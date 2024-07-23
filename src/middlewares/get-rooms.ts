import type Koa from "koa";
import redisClient from "../clients/redis";

export function getRooms(): Koa.Middleware {
  return async (ctx, next): Promise<void> => {
    const livingRoomGroup = JSON.parse(
      (await redisClient.get("Living Room")) || ""
    );

    const bedroomGroup = JSON.parse((await redisClient.get("Bedroom")) || "");

    ctx.state.livingRoomGroup = livingRoomGroup;
    ctx.state.bedroomGroup = bedroomGroup;

    return next();
  };
}
