import express from "express";

import rootRouter from "./routes";

import app from "./app";

import {
  render,
  setupResponseProcessing,
  useContentTypeHeader,
} from "./response-processing";
import { handle404 } from "./errors";

const PORT = 3000;

// Log all requests
app.use((req, _res, next) => {
  const { headers } = req;
  console.log(`${req.method} ${req.originalUrl}`, headers);
  next();
});

// rather than call res.send(), route endpoint handlers will modify ResponseProcessingData, for post-processing middleware to use in sending
app.use(setupResponseProcessing);
app.use(useContentTypeHeader);
app.use(express.json());

// routes
app.use(rootRouter);

// 404
app.use(handle404);

// post-processing middleware that uses ResponseProcessingData
// response logging
app.use(render);

app.listen(PORT);
console.log(`Listening on port ${PORT}`);
