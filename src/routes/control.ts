import Router from "koa-router";
import VError from "verror";

import redistClient from "../clients/redis";
import appConfig from "../util/config";
import { playPauseSonos, loadPlaylist, getGroups } from "../util/sonos-api";
import getAccessToken from "../middlewares/get-access-token";

export const controlRouter = new Router();
// const redis = new Redis({ host: "redis" });

controlRouter.get("/getGroupId", getAccessToken(), async (ctx) => {
  const {
    accessToken: {
      token: { access_token },
    },
  } = ctx.state;

  const { householdsId } = JSON.parse(
    (await redistClient.get("householdsId")) || ""
  );

  // eslint-disable-next-line no-debugger
  debugger;

  let result;
  try {
    result = await getGroups(access_token, householdsId);
  } catch (err) {
    const cause = err as VError;
    const info = VError.info(cause);
    ctx.body = info.statusText;
    ctx.status = info.status;
    return;
  }

  if (result) {
    const {
      data: { groups },
    } = result;

    // if (groups.some((group) => group.name === 'Living'))
  }

  ctx.body = {
    message: "successfully got groupId",
    result,
  };
});

controlRouter.get("/togglePlayPause", getAccessToken(), async (ctx) => {
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

controlRouter.get("/loadPlaylist", getAccessToken(), async (ctx) => {
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

// controlRouter.get("/getAccessToken", getAccessToken(), async (ctx) => {
//   const {
//     accessToken: {
//       token: { access_token },
//     },
//   } = ctx.state;

//   ctx.body = {
//     message: "successfully toggled play/pause endpoint",
//     accessToken: access_token,
//   };
// });
