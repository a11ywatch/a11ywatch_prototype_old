/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import fs from "fs";
import path from "path";
import uglify from "uglify-js";
import {
  app,
  init,
  directoryExist,
  uploadToS3,
  getFile,
  AWS_S3_ENABLED,
  DEV,
} from "./lib";

app.get("/", (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
  <body>
    <h1>welcome to cdn server for custom accessibility scripts</h1>
  </body>
</html>
`);
});

app.get("/cdn/:domain/:cdnPath", (req, res) => {
  try {
    console.log(`${req.params.domain}/${req.params.cdnPath}`);
    if (DEV) {
      res.sendFile(
        path.join(
          __dirname + `/scripts/${req.params.domain}/${req.params.cdnPath}`
        )
      );
    } else {
      getFile(`scripts/${req.params.domain}/${req.params.cdnPath}`, res);
    }
  } catch (e) {
    console.error(e);
    res.send(false);
  }
});

app.get("/download/:domain/:cdnPath", (req, res) => {
  try {
    res.set(
      "Content-Disposition",
      `attachment; filename=${req.params.cdnPath}`
    );
    if (DEV) {
      res.download(
        path.join(
          __dirname + `/scripts/${req.params.domain}/${req.params.cdnPath}`
        )
      );
    } else {
      getFile(`scripts/${req.params.domain}/${req.params.cdnPath}`, res);
    }
  } catch (e) {
    console.error(e);
    res.send(false);
  }
});

app.post("/api/add-script", (req, res) => {
  try {
    const { scriptBuffer, cdnSourceStripped, domain } = req.body;

    if (cdnSourceStripped && scriptBuffer) {
      const srcPath = `src/scripts/${domain}/${cdnSourceStripped}`;
      const awsPath = `scripts/${domain}/${cdnSourceStripped}`;
      const cdnFileName = `${srcPath}.js`;
      const cdnFileNameMin = `${srcPath}.min.js`;
      const dirExist = directoryExist(cdnFileName);

      if (dirExist) {
        const writeStream = fs.createWriteStream(cdnFileName);
        const writeStreamMinified = fs.createWriteStream(cdnFileNameMin);
        const newScriptBuffer = Buffer.from(scriptBuffer);
        const minifiedCode = uglify.minify(scriptBuffer)?.code;
        const minBuffer = Buffer.from(minifiedCode);

        writeStream.write(newScriptBuffer, "base64");
        writeStreamMinified.write(minBuffer, "base64");

        writeStream.on("finish", () => {
          console.log(`WROTE: CDN JS FILE: ${cdnFileName}`);
          if (AWS_S3_ENABLED) {
            uploadToS3(
              fs.createReadStream(cdnFileName),
              `${awsPath}.js`,
              cdnFileName
            );
          }
        });

        writeStreamMinified.on("finish", () => {
          console.log(`WROTE: Minified CDN JS FILE: ${cdnFileNameMin}`);
          if (AWS_S3_ENABLED) {
            uploadToS3(
              fs.createReadStream(cdnFileNameMin),
              `${awsPath}.min.js`,
              cdnFileNameMin
            );
          }
        });

        writeStream.end();
        writeStreamMinified.end();
      }
    }

    res.send(true);
  } catch (e) {
    console.error(e);
    res.send(false);
  }
});

init();
