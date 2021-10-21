import type Koa from "koa";
import client from "../clients/oauth";
import redistClient from "../clients/redis";

export default function getRooms(): Koa.Middleware {
  return async (ctx, next): Promise<void> => {
    const livingRoomGroup = JSON.parse(
      (await redistClient.get("Living Room")) || ""
    );

    const bedroomGroup = JSON.parse((await redistClient.get("Bedroom")) || "");

    ctx.state.livingRoomGroup = livingRoomGroup;
    ctx.state.bedroomGroup = bedroomGroup;

    return next();
  };
}
