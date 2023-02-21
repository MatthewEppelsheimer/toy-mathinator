// /v1/math/* routes

import express from "express";

import { setResponseProcessing } from "../../response-processing";
import { handler } from "../../handler-middleware";
import logger from "../../log-middleware";
import {
  handleGet,
  handlePost,
  isSumSetResponseData,
} from "../../resources/sums";
import { handle405 } from "../../errors";

const mathRouter = express.Router();

mathRouter.all("*", logger(`router: mathRouter`));

mathRouter.route("/").all(
  handler((_req, _res) => {
    setResponseProcessing.data({ routes: ["/v1/math/sums"] });
  })
);

mathRouter
  .route("/sums")
  .post(
    handler((req, _res) => {
      setResponseProcessing.data(handlePost(req));
    })
  )
  .all(handle405);

mathRouter
  .route("/sums/:id")
  .get(
    handler((req, _res) => {
      const found = handleGet(req);
      if (isSumSetResponseData(found)) {
        setResponseProcessing.data(found);
      } else {
        setResponseProcessing.error(found);
      }
    })
  )
  .all(handle405);

export default mathRouter;
