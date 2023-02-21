import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

import app from "./app";

const PROCESSING_DATA_KEY = "responseProcessingData";

enum ResponseFormat {
  html = "html",
  json = "json",
  unknown = "unknown",
  unsupported = "unsupported",
}

enum ResponseProcessingDataStatus {
  unhandled = "unhandled",
  handled = "handled",
  error = "error",
}

interface ResponseProcessingData {
  responseFormat: ResponseFormat;
  responseData?: { [x: string]: any };
  status: ResponseProcessingDataStatus;
  error?: Error;
}

const setResponseProcessing = {
  error: (error: Error): void => {
    (app.get(PROCESSING_DATA_KEY) as ResponseProcessingData).error = error;
    console.log(`response error set to`, error);
  },
  data: (data: any): void => {
    (app.get(PROCESSING_DATA_KEY) as ResponseProcessingData).responseData =
      data;
    console.log(`response data set to`, data);
  },
  format: {
    html: (): void => {
      (app.get(PROCESSING_DATA_KEY) as ResponseProcessingData).responseFormat =
        ResponseFormat.html;
      console.log(`response format set to: html`);
    },
    json: (): void => {
      (app.get(PROCESSING_DATA_KEY) as ResponseProcessingData).responseFormat =
        ResponseFormat.json;
      console.log(`response format set to: json`);
    },
    unsupported: (): void => {
      (app.get(PROCESSING_DATA_KEY) as ResponseProcessingData).responseFormat =
        ResponseFormat.unsupported;
      console.log(`response format set to: unsupported`);
    },
  },
  status: {
    handled: (): void => {
      (app.get(PROCESSING_DATA_KEY) as ResponseProcessingData).status =
        ResponseProcessingDataStatus.handled;
      console.log(`response status set to: handled`);
    },
    error: (error: Error): void => {
      const data = app.get(PROCESSING_DATA_KEY) as ResponseProcessingData;

      data.status = ResponseProcessingDataStatus.error;
      console.log(`response status set to: error`);

      setResponseProcessing.error(error);
    },
  },
};

function isRequestHandled(): boolean {
  return (
    ResponseProcessingDataStatus.handled ===
    (app.get(PROCESSING_DATA_KEY) as ResponseProcessingData).status
  );
}

function isFormatUnsupported(): boolean {
  return (
    ResponseFormat.unsupported ===
    (app.get(PROCESSING_DATA_KEY) as ResponseProcessingData).responseFormat
  );
}

function newResponseProcessingData(): ResponseProcessingData {
  return {
    responseFormat: ResponseFormat.unknown,
    status: ResponseProcessingDataStatus.unhandled,
  };
}

///
/// MIDDLEWARE
///

function setupResponseProcessing(
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  app.set(PROCESSING_DATA_KEY, newResponseProcessingData());
  console.log(`setup response processing`);
  next();
}

function useContentTypeHeader(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const value = req.headers["content-type"];
  console.log(`useContentTypeHeader middleware called`, {
    contentTypeHeaderValue: value,
  });
  switch (value) {
    case undefined:
      break;

    case "application/json":
      setResponseProcessing.format.json();

      break;

    default:
      setResponseProcessing.format.unsupported();
      const e = createHttpError(400, `Unsupported content-type "${value}"`);
      setResponseProcessing.error(e);
      next(e);
  }
  next();
}

/**
 * Actually call res.send() or res.json()
 *
 * DOESN'T CALL NEXT! The request lifecycle ends here!
 *
 * @param _req
 * @param res
 * @param _next
 */
function render(_req: Request, res: Response, _next: NextFunction): void {
  const { responseFormat, responseData, status, error } = app.get(
    PROCESSING_DATA_KEY
  ) as ResponseProcessingData;

  if (error) {
    console.log(`throwing error from render()`);
    throw error;
  }

  // @TODO do stuff with `status`

  switch (responseFormat) {
    case ResponseFormat.unknown:
      throw new Error(`unknown response format should be known by render time`);
      break;

    case ResponseFormat.html:
      res.send(responseData);
      break;

    case ResponseFormat.json:
      res.json(responseData);
      break;

    default:
      throw new Error(`invalid ResponseFormat during render`);
  }

  console.log({
    rendered: { responseFormat, responseData },
    status: res.statusCode,
  });

  // clear processing data we no longer need
  app.set(PROCESSING_DATA_KEY, null);
}

export {
  isRequestHandled,
  render,
  ResponseFormat,
  ResponseProcessingDataStatus,
  ResponseProcessingData,
  setResponseProcessing,
  setupResponseProcessing,
  useContentTypeHeader,
};
