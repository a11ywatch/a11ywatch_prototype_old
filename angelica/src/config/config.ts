/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import dotenv from "dotenv";

dotenv.config();

const DEV = process.env.NODE_ENV !== "production";
const DOCKER_ENV = process.env.DOCKER_ENV;

const proxyDockerUrls = ["mav", "localhost", "angelica", "cdn-server", "api"];

const replaceDockerNetwork = (url: string) => {
  if (!DEV && DOCKER_ENV) {
    const includesElement = (element) => url?.includes(element);
    const hasIndex = proxyDockerUrls.findIndex(includesElement);

    if (hasIndex !== -1) {
      return url.replace(proxyDockerUrls[hasIndex], "127.0.0.1");
    }
  }
  return url;
};

const AI_SERVICE_URL = replaceDockerNetwork(process.env.AI_SERVICE_URL);
const WATCHER_CLIENT_URL = replaceDockerNetwork(process.env.WATCHER_CLIENT_URL);
const SCRIPTS_CDN_URL_HOST = process.env.SCRIPTS_CDN_URL_HOST;

export const config = {
  DEV,
  WATCHER_CLIENT_URL,
  AI_SERVICE_URL,
  SCRIPTS_CDN_URL: process.env.SCRIPTS_CDN_URL,
  SCRIPTS_CDN_URL_HOST,
};

export {
  DEV,
  DOCKER_ENV,
  WATCHER_CLIENT_URL,
  AI_SERVICE_URL,
  SCRIPTS_CDN_URL_HOST,
};
