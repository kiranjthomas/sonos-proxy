import Router from "koa-router";
import Redis from "ioredis";
import client from "../clients/oauth";

export const oauthRouter = new Router();
const redis = new Redis({ host: "redis" });

oauthRouter.get("/authorize", async (ctx) => {
  const authorizationUri = client.authorizeURL({
    redirect_uri: "https://localhost:5000/oauth/callback",
    scope: "playback-control-all",
    state: "foo",
  });

  ctx.redirect(authorizationUri);
});

oauthRouter.get("/oauth/callback", async (ctx) => {
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
