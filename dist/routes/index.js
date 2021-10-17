"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
const ioredis_1 = __importDefault(require("ioredis"));
const simple_oauth2_1 = require("simple-oauth2");
const dotenv_1 = __importDefault(require("dotenv"));
const verror_1 = __importDefault(require("verror"));
const util_1 = require("../util");
exports.router = new koa_router_1.default();
const redis = new ioredis_1.default({ host: "redis" });
dotenv_1.default.config();
const { SONOS_CLIENT_ID: id = "", SONOS_CLIENT_SECRET: secret = "", LIVING_ROOM_ID: livingRoom = "", PLAY_3: bedRoom = "", } = process.env;
const config = {
    client: { id, secret },
    auth: {
        tokenHost: "https://api.sonos.com",
        tokenPath: "login/v3/oauth/access",
        authorizePath: "login/v3/oauth",
    },
};
const client = new simple_oauth2_1.AuthorizationCode(config);
function getAccessToken() {
    return async (ctx, next) => {
        const accessTokenJSONString = (await redis.get("accessToken")) || "";
        let accessToken = client.createToken(JSON.parse(accessTokenJSONString));
        if (accessToken.expired()) {
            const refreshParams = { scope: "playback-control-all" };
            try {
                accessToken = await accessToken.refresh(refreshParams);
            }
            catch (error) {
                console.log("Error refreshing access token: ", error);
            }
            redis.set("accessToken", JSON.stringify(accessToken));
        }
        ctx.state.accessToken = accessToken;
        return next();
    };
}
exports.router.get("/togglePlayPause", getAccessToken(), async (ctx) => {
    const { accessToken: { token: { access_token }, }, } = ctx.state;
    try {
        await (0, util_1.playPauseSonos)(access_token, livingRoom);
    }
    catch (err) {
        const cause = err;
        const info = verror_1.default.info(cause);
        ctx.body = info.statusText;
        ctx.status = info.status;
        return;
    }
    ctx.body = { message: "successfully toggled play/pause endpoint" };
});
exports.router.get("/authorize", async (ctx) => {
    const authorizationUri = client.authorizeURL({
        redirect_uri: "https://localhost:5000/oauth/callback",
        scope: "playback-control-all",
        state: "foo",
    });
    ctx.redirect(authorizationUri);
});
exports.router.get("/oauth/callback", async (ctx) => {
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
//# sourceMappingURL=index.js.map