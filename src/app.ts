import Koa from "koa";
import cors from "@koa/cors";
import serve from "koa-static";
import mount from "koa-mount";
import bodyParser from "@koa/bodyparser";

import { oauthRouter, controlRouter, healthRouter } from "./routes";

const app = new Koa();

app.use(cors());
app.use(bodyParser());

console.log(`${__dirname}`);
app.use(mount("/", serve(__dirname + "/sonos-client")));

app.use(healthRouter.routes());
app.use(controlRouter.routes());
app.use(oauthRouter.routes());

export default app;
