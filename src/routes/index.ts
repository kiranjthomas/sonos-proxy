import type Koa from "koa";
import Router from "koa-router";
import Redis from "ioredis";
import { AuthorizationCode } from "simple-oauth2";
import VError from "verror";
import config from "config";

import { playPauseSonos, loadPlaylist } from "../util";

export const router = new Router();
const redis = new Redis({ host: "redis" });

const appConfig = {
  sonos: {
    id: config.get("sonos.clientId") as string,
    secret: config.get("sonos.clientSecret") as string,
    livingRoomGroupId: config.get("sonos.livingRoomGroupId") as string,
    play3GroupId: config.get("sonos.play3GroupId") as string,
  },
};

const oauthConfig = {
  client: { id: appConfig.sonos.id, secret: appConfig.sonos.secret },
  auth: {
    tokenHost: "https://api.sonos.com",
    tokenPath: "login/v3/oauth/access",
    authorizePath: "login/v3/oauth",
  },
};

const client = new AuthorizationCode(oauthConfig);

function getAccessToken(): Koa.Middleware {
  return async (ctx, next): Promise<void> => {
    const accessTokenJSONString = (await redis.get("accessToken")) || "";

    let accessToken = client.createToken(JSON.parse(accessTokenJSONString));
    if (accessToken.expired()) {
      const refreshParams = { scope: "playback-control-all" };

      try {
        accessToken = await accessToken.refresh(refreshParams);
      } catch (error) {
        console.log("Error refreshing access token: ", error);
      }

      redis.set("accessToken", JSON.stringify(accessToken));
    }

    ctx.state.accessToken = accessToken;

    return next();
  };
}

router.get("/health", async (ctx) => {
  ctx.body = { message: "healthy" };
});

router.get("/togglePlayPause", getAccessToken(), async (ctx) => {
  const {
    accessToken: {
      token: { access_token },
    },
  } = ctx.state;

  try {
    await playPauseSonos(access_token, appConfig.sonos.livingRoomGroupId);
  } catch (err) {
    const cause = err as VError;
    const info = VError.info(cause);
    ctx.body = info.statusText;
    ctx.status = info.status;
    return;
  }

  ctx.body = { message: "successfully toggled play/pause endpoint" };
});

router.get("/loadPlaylist", getAccessToken(), async (ctx) => {
  const {
    accessToken: {
      token: { access_token },
    },
  } = ctx.state;

  try {
    await loadPlaylist(access_token, appConfig.sonos.livingRoomGroupId);
  } catch (err) {
    const cause = err as VError;
    const info = VError.info(cause);
    ctx.body = info.statusText;
    ctx.status = info.status;
    return;
  }

  ctx.body = { message: "successfully loaded playlist" };
});

router.get("/authorize", async (ctx) => {
  const authorizationUri = client.authorizeURL({
    redirect_uri: "https://localhost:5000/oauth/callback",
    scope: "playback-control-all",
    state: "foo",
  });

  ctx.redirect(authorizationUri);
});

router.get("/oauth/callback", async (ctx) => {
  const queryParams = ctx.query;

  // TODO - figure out a nice way to tell typescript that code exists
  if (typeof queryParams.code === "string") {
    const tokenParams = {
      code: queryParams.code,
      redirect_uri: "https://localhost:5000/oauth/callback",
      scope: "playback-control-all",
    };

    let accessToken;
    try {
      accessToken = await client.getToken(tokenParams);
    } catch (error) {
      console.log("Access Token Error", error);
    }

    if (accessToken) {
      redis.set("accessToken", JSON.stringify(accessToken));
    }
  }
});
