import type Koa from "koa";
import client from "../clients/oauth";
import redistClient from "../clients/redis";

export default function getAccessToken(): Koa.Middleware {
  return async (ctx, next): Promise<void> => {
    const accessTokenJSONString = (await redistClient.get("accessToken")) || "";

    let accessToken = client.createToken(JSON.parse(accessTokenJSONString));
    if (accessToken.expired()) {
      try {
        accessToken = await accessToken.refresh({
          scope: "playback-control-all",
        });
      } catch (error) {
        console.log("Error refreshing access token: ", error);
      }

      redistClient.set("accessToken", JSON.stringify(accessToken));
    }

    ctx.state.accessToken = accessToken;

    return next();
  };
}
