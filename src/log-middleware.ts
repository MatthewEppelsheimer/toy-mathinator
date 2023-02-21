import type { RequestHandler } from "express";

export default function logger(message: string): RequestHandler {
  return (_req, _res, next) => {
    console.log(message);
    next();
  };
}
