/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import express from "express";
import createIframe from "node-iframe";
import cors from "cors";

const port = process.env.PORT || 8010;
const app = express();

app.use(createIframe);
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  try {
    res.send(`<!DOCTYPE html>
<html lang="en">
  <body>
    <h1>Welcome to iframe server</h1>
  </body>
</html>
`);
  } catch (e) {
    console.error(e);
  }
});

app.get("/iframe", (req, res) => {
  try {
    res.createIframe({
      url: decodeURI(String(req.query.url)).replace(
        "http",
        req.protocol === "https" ? "https" : "http"
      ),
      baseHref: !!req.query.baseHref,
    });
  } catch (e) {
    console.error(e);
  }
});

app.listen(port, () => console.log(`server listening on port ${port}!`));
