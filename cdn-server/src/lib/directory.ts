/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import fs from "fs";
import path from "path";

export function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);

  try {
    if (fs.existsSync(dirname)) {
      return true;
    }
    fs.mkdirSync(dirname, { recursive: true });
    return false;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export function directoryExist(cdnFileName: string) {
  const existDir = ensureDirectoryExistence(cdnFileName);

  if (existDir) {
    return true;
  } else {
    return ensureDirectoryExistence(cdnFileName);
  }
}
