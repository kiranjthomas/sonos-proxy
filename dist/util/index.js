"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.playPauseSonos = void 0;
const axios_1 = __importDefault(require("axios"));
const verror_1 = __importDefault(require("verror"));
const host = "api.ws.sonos.com";
const path = "control/api/v1";
async function playPauseSonos(token, room) {
    const playPauseEndpoint = `groups/${room}/playback/togglePlayPause`;
    let result;
    try {
        result = await postAxios(`https://${host}/${path}/${playPauseEndpoint}`, token);
    }
    catch (err) {
        const cause = err;
        throw new verror_1.default({ name: "togglePlayPauseError", cause }, "Error toggling Sonos play");
    }
    return result;
}
exports.playPauseSonos = playPauseSonos;
async function postAxios(url, token) {
    let result;
    try {
        result = await (0, axios_1.default)(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
    }
    catch (err) {
        const cause = err;
        throw new verror_1.default({
            name: "postAxiosError",
            cause,
            info: {
                status: cause?.response?.status,
                statusText: cause?.response?.statusText,
            },
        }, "Error calling postAxios");
    }
    return result;
}
//# sourceMappingURL=index.js.map