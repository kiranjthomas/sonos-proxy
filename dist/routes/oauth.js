"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
const simple_oauth2_1 = require("simple-oauth2");
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.router = new koa_router_1.default();
const redis = new ioredis_1.default({ host: "redis" });
const id = process.env.SONOS_CLIENT_ID || "";
const secret = process.env.SONOS_CLIENT_SECRET || "";
const livingRoom = process.env.LIVING_ROOM_ID || "";
const config = {
    client: { id, secret },
    auth: {
        tokenHost: "https://api.sonos.com",
        tokenPath: "login/v3/oauth/access",
        authorizePath: "login/v3/oauth",
    },
};
const client = new simple_oauth2_1.AuthorizationCode(config);
exports.router.get("/authorize", async (ctx) => {
    const authorizationUri = client.authorizeURL({
        redirect_uri: "https://localhost:5000/oauth/callback",
        scope: "playback-control-all",
        state: "foo",
    });
    // eslint-disable-next-line no-debugger
    debugger;
    console.log(authorizationUri);
    ctx.redirect(authorizationUri);
});
exports.router.get("/oauth/callback", async (ctx) => {
    // eslint-disable-next-line no-debugger
    debugger;
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
        }
        catch (error) {
            console.log("Access Token Error", error);
        }
        if (accessToken) {
            redis.set("accessToken", JSON.stringify(accessToken));
        }
    }
});
//# sourceMappingURL=oauth.js.map