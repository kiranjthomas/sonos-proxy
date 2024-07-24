import Koa from "koa";
import bodyParser from "@koa/bodyparser";
import logger from "koa-logger";

import { oauthRouter, controlRouter, healthRouter } from "./routes";

const app = new Koa();

app.use(logger());
app.use(bodyParser());

app.use(healthRouter.routes());
app.use(controlRouter.routes());
app.use(oauthRouter.routes());

export default app;
