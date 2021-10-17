"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const koa_router_1 = __importDefault(require("koa-router"));
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
const simple_oauth2_1 = require("simple-oauth2");
const util_1 = require("../util");
exports.router = new koa_router_1.default();
const redis = new ioredis_1.default({ host: "redis" });
dotenv_1.default.config();
const client = new simple_oauth2_1.AuthorizationCode(config);
function getAccessToken() {
    // eslint-disable-next-line no-debugger
    debugger;
    return async (ctx, next) => {
        const accessTokenJSONString = (await redis.get("accessToken")) || "";
        // eslint-disable-next-line no-debugger
        debugger;
        // if (!accessTokenJSONString) {
        //   ctx.response.status = 400;
        //   ctx.response.message = JSON.stringify({
        //     message: "could not find accessToken in redis",
        //   });
        // }
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
    // eslint-disable-next-line no-debugger
    debugger;
    const { accessToken } = ctx.state;
    try {
        await (0, util_1.playPauseSonos)(accessToken.token.access_token, livingRoom);
    }
    catch (err) {
        // TODO fix this
        console.log({ err });
    }
});
//# sourceMappingURL=sonos.js.map