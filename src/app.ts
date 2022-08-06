import Koa from "koa";
import cors from "@koa/cors";
import serve from "koa-static";
import mount from "koa-mount";

import { oauthRouter, controlRouter, healthRouter } from "./routes";
import { healthRouter } from "./routes";

const app = new Koa();

app.use(cors());

console.log(`${__dirname}`)
app.use(mount('/', serve(__dirname + '/sonos-client')))

app.use(healthRouter.routes());
app.use(controlRouter.routes());
app.use(oauthRouter.routes());

export default app;
