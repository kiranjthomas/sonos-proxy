import Koa from "koa";
import { oauthRouter, controlRouter, healthRouter } from "./routes";

const app = new Koa();

app.use(healthRouter.routes());
app.use(controlRouter.routes());
app.use(oauthRouter.routes());

export default app;
