import createHttpError from "http-errors";

import { handler } from "./handler-middleware";
import { setResponseProcessing } from "./response-processing";

const handle404 = handler((_req, _res) => {
  console.log(`404 handler`);
  setResponseProcessing.error(createHttpError(404));
});

const handle405 = handler((_req, _res) => {
  console.log(`405 handler`);
  setResponseProcessing.error(createHttpError(405));
});

export { handle404, handle405 };
