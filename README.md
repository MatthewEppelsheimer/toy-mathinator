# Mathinator

A **toy** project for experimenting with creating a RESTFul API using Express.js. This demonstrates a method of decoupling the API's internal data representations from public request and response contract formats.

Created February of 2023.

## Layers

The primary reason to decouple is making it easy to add support for alternate `Content-Type` and `Accept` headers in future development.

Why bother? First of all, we'll all be using JSON until someday we don't anymore. Look what happened to XML -- nobody saw JSON coming. Second, for maximum client accessibility / user-friendliness. Plus there are other things that could be done this way, such as modiying output in response to requested localization, etc.

Route middleware generally doesn't access the Response, but modifies the internal datastore established by `setupResponseProcessing` middleware, including errors. Then, `render` middleware uses the data store to send the Response. (The data store's implementation is pretty basic and assumes one requests are processed in a blocking, synchronous manner; if the app is revised to be asynchronous, data between requests will leak.)

The result is internal processing can remain simple, and output transformations are all handled by the `render` middleware -- one place to make changes, rather than modifying every single endpoint handler.

## Conclusions

- Express isn't really designed for this, so it's an awkward fit, but even with Express' minimal/opinionated developer interface, it's possible to scaffold more structured layers around it.
- If you need this level of sophistication, then more complex web server frameworks (e.g. Nest.js) will generally be a better fit.

## Usage

```shell
npm run watch
```

## API functionality

* Resource: Sums - a set of numbers that have been summed
    * `POST /v1/math/sums` calculates summary of provided set of integers
    * `GET /v1/math/sums/<id>` returns summary for "sum" resources

(Again, toy project.)

## Organization of files

```
src/
    resources/
      - business logic and persistence for each RESTful resource
    routes/
      - route-handling middleware, organized as a router tree
    app.ts
      - exports the express() instance
    errors.ts
    handler-middleware.ts
      - `handler` is a convenience wrapper that manages when to call next(). project-specific term "handler" is endpoint middleware that completes response data compiling - after a handler, further piped handler middleware can be skipped.
    index.ts
      - root-level Express.js lifecycle middleware
    log-middleware.ts
    response-processing.ts
      - exports `setupResponseProcessing` and `render`
```
