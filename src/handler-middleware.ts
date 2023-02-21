import type { Request, Response, RequestHandler } from "express";

import { isRequestHandled, setResponseProcessing } from "./response-processing";

type HandlerMiddleware = (
  req: Request,
  res: Response
) => ReturnType<RequestHandler>; // (returns void)

/**
 * Handler middleware convenience wrapper
 *
 * If request already handled, skips processing (call next()). Then, calls given middleware. Then, calls next().
 *
 * @param middleware
 * @returns
 */
export function handler(middleware: HandlerMiddleware): RequestHandler {
  return (req, res, next) => {
    if (isRequestHandled()) {
      next();
      return;
    }
    middleware(req, res);
    setResponseProcessing.status.handled();
    next();
  };
}
