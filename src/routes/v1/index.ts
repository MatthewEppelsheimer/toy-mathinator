// /v1 router

import express from "express";

import { setResponseProcessing } from "../../response-processing";
import { handler } from "../../handler-middleware";

import mathRouter from "./math";
import logger from "../../log-middleware";

const v1Router = express.Router();

v1Router.all("*", logger(`router: v1Router`));

v1Router.route("/v1").get(
  handler((_req, _res) => {
    setResponseProcessing.data("<h1>Hello World</h1>");

    setResponseProcessing.format.html(); // override default
  })
);

v1Router.use("/math", mathRouter);

export default v1Router;
