// /* routes

import express from "express";
import { handler } from "../handler-middleware";
import logger from "../log-middleware";
import { setResponseProcessing } from "../response-processing";
import v1Router from "./v1";

const rootRouter = express.Router();

rootRouter.all("*", logger(`router: rootRouter`));
rootRouter
  .route("/")
  .all((_req, _res, next) => {
    setResponseProcessing.format.html();
    next();
  })
  .get(
    handler((_req, _res) => {
      setResponseProcessing.data("<h1>Hello World</h1>");
    })
  );

rootRouter.use("/v1", v1Router);

export default rootRouter;
