import Router from "koa-router";
import VError from "verror";

import redisClient from "../clients/redis";
import {
  GroupData,
  playPauseSonos,
  loadPlaylist,
  loadFavorite,
  setVolume,
} from "../util/sonos-control-api";
import { isEventAuthentic } from "../util/sonos-event-api";
import { getAccessToken, getRooms } from "../middlewares";

export const controlRouter = new Router();

controlRouter.post("/groupsCallback", async (ctx) => {
  if (!isEventAuthentic(ctx.request.headers)) {
    ctx.body = "Unauthorized";
    ctx.status = 401;
    return;
  }

  const { groups } = <GroupData>ctx.request.body;

  // always make sure music plays after pi button makes loadPlayList/LivingRoom request
  if (groups.length === 1) {
    await redisClient.set("Living Room", JSON.stringify(groups[0]));
  }

  for (const group of groups) {
    await redisClient.set(group.name, JSON.stringify(group));
  }

  ctx.body = "OK";
  ctx.status = 200;
});

controlRouter.get(
  "/refreshAccessToken",
  getAccessToken(),
  async (ctx) => {
    ctx.body = { message: "refreshed access token" };
  }
);

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
  "/loadPlaylist/:room/:playlistId",
  getAccessToken(),
  getRooms(),
  async (ctx) => {
    console.time("getAccessToken");

    const {
      accessToken: {
        token: { access_token },
      },
      livingRoomGroup,
      bedroomGroup,
    } = ctx.state;

    console.timeEnd("getAccessToken");

    const { room, playlistId } = ctx.params;
    const roomId = room === "LivingRoom" ? livingRoomGroup.id : bedroomGroup.id;

    console.time("loadPlaylist");

    try {
      await loadPlaylist(access_token, roomId, playlistId);
    } catch (err) {
      const cause = err as VError;
      const info = VError.info(cause);
      ctx.body = { message: info.statusText };
      ctx.status = info.status;

      console.error({ err });

      return;
    }

    console.timeEnd("loadPlaylist");

    console.time("setVolume");

    try {
      await setVolume(access_token, roomId);
    } catch (err) {
      const cause = err as VError;
      const info = VError.info(cause);
      ctx.body = { message: info.statusText };
      ctx.status = info.status;
      return;
    }

    console.timeEnd("setVolume");

    ctx.body = { message: "successfully loaded playlist" };
  }
);

controlRouter.get(
  "/loadFavorite/:room/:favoriteId",
  getAccessToken(),
  getRooms(),
  async (ctx) => {
    console.time("getAccessToken");

    const {
      accessToken: {
        token: { access_token },
      },
      livingRoomGroup,
      bedroomGroup,
    } = ctx.state;

    console.timeEnd("getAccessToken");

    const { room, favoriteId } = ctx.params;
    const roomId = room === "LivingRoom" ? livingRoomGroup.id : bedroomGroup.id;

    console.time("loadFavorite");
    try {
      await loadFavorite(access_token, roomId, favoriteId);
    } catch (err) {
      const cause = err as VError;
      const info = VError.info(cause);
      ctx.body = { message: info.statusText };
      ctx.status = info.status;
      return;
    }

    console.timeEnd("loadFavorite");

    console.time("setVolume");

    try {
      await setVolume(access_token, roomId);
    } catch (err) {
      const cause = err as VError;
      const info = VError.info(cause);
      ctx.body = { message: info.statusText };
      ctx.status = info.status;
      return;
    }

    console.timeEnd("setVolume");

    ctx.body = { message: `successfully loaded favoriteId: ${favoriteId}` };
  }
);
