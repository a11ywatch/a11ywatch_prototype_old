/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

require("@tensorflow/tfjs-node-gpu");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { logServerInit } = require("./config/server");
const { aiModels, detectImageModel } = require("./ai");

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "100mb", extended: true }));

app.get("/", (req, res) => {
  try {
    res.json({
      server_status: "online",
    });
  } catch (e) {
    console.log(e);
  }
});

app.post("/api/clear", (req, res, next) => {
  try {
    aiModels.clearModels();
    res.send(true);
  } catch (e) {
    console.error(e);
    next();
  }
});

app.post("/api/init", async (req, res, next) => {
  try {
    await aiModels.initModels();
    res.send(true);
  } catch (e) {
    console.log(e);
    next();
  }
});

app.post("/api/parseImg", async (req, res, next) => {
  try {
    if (req.body) {
      const data = await detectImageModel(req.body.img, {
        width: Number(req.body.width),
        height: Number(req.body.height),
      });
      res.send(JSON.stringify(data));
    } else {
      next();
    }
  } catch (issue) {
    console.error(`parse failed:`, issue);
    next();
  }
});

const port = process.env.PORT || 0;

app.listen(port, () => {
  logServerInit(port);
});
