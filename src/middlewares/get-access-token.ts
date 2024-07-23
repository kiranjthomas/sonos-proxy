import type Koa from "koa";
import client from "../clients/oauth";
import redisClient from "../clients/redis";

export function getAccessToken(): Koa.Middleware {
  return async (ctx, next): Promise<void> => {
    const accessTokenJSONString = (await redisClient.get("accessToken")) || "";

    let accessToken = client.createToken(JSON.parse(accessTokenJSONString));
    if (accessToken.expired()) {
      try {
        accessToken = await accessToken.refresh({
          scope: "playback-control-all",
        });
      } catch (error) {
        console.log("Error refreshing access token: ", error);
      }

      await redisClient.set("accessToken", JSON.stringify(accessToken));
    }

    ctx.state.accessToken = accessToken;

    return next();
  };
}
