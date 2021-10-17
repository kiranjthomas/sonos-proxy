import type Koa from "koa";
import Router from "koa-router";
import Redis from "ioredis";
import { AuthorizationCode } from "simple-oauth2";
import dotenv from "dotenv";
import VError from "verror";

import { playPauseSonos } from "../util";

export const router = new Router();
const redis = new Redis({ host: "redis" });

dotenv.config();
const {
  SONOS_CLIENT_ID: id = "",
  SONOS_CLIENT_SECRET: secret = "",
  LIVING_ROOM_ID: livingRoom = "",
  PLAY_3: bedRoom = "",
} = process.env;

const config = {
  client: { id, secret },
  auth: {
    tokenHost: "https://api.sonos.com",
    tokenPath: "login/v3/oauth/access",
    authorizePath: "login/v3/oauth",
  },
};

const client = new AuthorizationCode(config);

function getAccessToken(): Koa.Middleware {
  return async (ctx, next): Promise<void> => {
	  console.log('in getAccessToken');
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

router.get("/healthy", async (ctx) => {
  console.log("WTF!!");
  ctx.body = { message: "healthy" };
});

router.get("/togglePlayPause", getAccessToken(), async (ctx) => {
 console.log('in togglePlayPause');
const {
    accessToken: {
      token: { access_token },
    },
  } = ctx.state;

  try {
    await playPauseSonos(access_token, livingRoom);
  } catch (err) {
    const cause = err as VError;
    const info = VError.info(cause);
    ctx.body = info.statusText;
    ctx.status = info.status;
    return;
  }

  ctx.body = { message: "successfully toggled play/pause endpoint" };
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

