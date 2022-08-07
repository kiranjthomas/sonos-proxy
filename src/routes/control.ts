import Router from "koa-router";
import VError from "verror";

import redistClient from "../clients/redis";
import {
  playPauseSonos,
  loadPlaylist,
  loadFavorite,
  getGroups,
  setVolume,
} from "../util/sonos-api";
import getAccessToken from "../middlewares/get-access-token";
import getRooms from "../middlewares/get-rooms";

export const controlRouter = new Router();
// const redis = new Redis({ host: "redis" });

controlRouter.get("/getGroups", getAccessToken(), async (ctx) => {
  const {
    accessToken: {
      token: { access_token },
    },
  } = ctx.state;

  const { householdsId } = JSON.parse(
    (await redistClient.get("householdsId")) || ""
  );

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

  const {
    data: { groups },
  } = result;

  groups.forEach((group) =>
    redistClient.set(group.name, JSON.stringify(group))
  );

  ctx.body = {
    message: "successfully got groupId",
    groups: result.data?.groups,
  };
});

controlRouter.get(
  "/togglePlayPause",
  getAccessToken(),
  getRooms(),
  async (ctx) => {
    const {
      accessToken: {
        token: { access_token },
      },
      livingRoomGroup,
    } = ctx.state;

    try {
      await playPauseSonos(access_token, livingRoomGroup.id);
    } catch (err) {
      const cause = err as VError;
      const info = VError.info(cause);
      ctx.body = { message: info.statusText };
      ctx.status = info.status;
      return;
    }

    ctx.body = { message: "successfully toggled play/pause endpoint" };
  }
);

controlRouter.get(
  "/loadPlaylist/:room",
  getAccessToken(),
  getRooms(),
  async (ctx) => {
    const {
      accessToken: {
        token: { access_token },
      },
      livingRoomGroup,
      bedroomGroup,
    } = ctx.state;

    const roomId =
      ctx.params.room === "LivingRoom" ? livingRoomGroup.id : bedroomGroup.id;

    try {
      await loadPlaylist(access_token, roomId);
    } catch (err) {
      const cause = err as VError;
      const info = VError.info(cause);
      ctx.body = { message: info.statusText };
      ctx.status = info.status;
      return;
    }

    try {
      await setVolume(access_token, roomId);
    } catch (err) {
      const cause = err as VError;
      const info = VError.info(cause);
      ctx.body = { message: info.statusText };
      ctx.status = info.status;
      return;
    }

    ctx.body = { message: "successfully loaded playlist" };
  }
);

controlRouter.get(
  "/loadFavorite/:room/:favoriteId",
  getAccessToken(),
  getRooms(),
  async (ctx) => {
    const {
      accessToken: {
        token: { access_token },
      },
      livingRoomGroup,
      bedroomGroup,
    } = ctx.state;

    const { room, favoriteId } = ctx.params;
    const roomId = room === "LivingRoom" ? livingRoomGroup.id : bedroomGroup.id;

    try {
      await loadFavorite(access_token, roomId, favoriteId);
    } catch (err) {
      const cause = err as VError;
      const info = VError.info(cause);
      ctx.body = { message: info.statusText };
      ctx.status = info.status;
      return;
    }

    try {
      await setVolume(access_token, roomId);
    } catch (err) {
      const cause = err as VError;
      const info = VError.info(cause);
      ctx.body = { message: info.statusText };
      ctx.status = info.status;
      return;
    }

    ctx.body = { message: `successfully loaded favoriteId: ${favoriteId}` };
  }
);
