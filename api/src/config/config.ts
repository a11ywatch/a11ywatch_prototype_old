/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import dotenv from "dotenv";

dotenv.config();

const DEV = process.env.NODE_ENV !== "production";

const proxyDockerUrls = ["mav", "localhost", "angelica", "cdn-server", "api"];

const replaceDockerNetwork = (url: string): string => {
  if (!DEV && process.env.DOCKER_ENV) {
    const includesElement = (element) => url?.includes(element);
    const hasIndex = proxyDockerUrls.findIndex(includesElement);

    if (hasIndex !== -1) {
      return url.replace(proxyDockerUrls[hasIndex], "127.0.0.1");
    }
  }
  return url;
};

export const config = {
  DEV,
  DB_URL: process.env.DB_URL,
  DB_NAME: process.env.DB_NAME,
  CLIENT_URL: replaceDockerNetwork(process.env.CLIENT_URL),
  GRAPHQL_PORT: process.env.PORT || process.env.GRAPHQL_PORT || 0,
  EMAIL_SERVICE_PASSWORD: process.env.EMAIL_SERVICE_PASSWORD,
  STRIPE_KEY: process.env.STRIPE_KEY,
  WATCHER_CLIENT_URL: replaceDockerNetwork(process.env.WATCHER_CLIENT_URL),
  CRAWL_URL: replaceDockerNetwork(process.env.CRAWL_URL),
  SCRIPTS_CDN_URL: replaceDockerNetwork(process.env.SCRIPTS_CDN_URL),
  STRIPE_BASIC_PLAN: process.env.STRIPE_BASIC_PLAN,
  STRIPE_PREMIUM_PLAN: process.env.STRIPE_PREMIUM_PLAN,
  URL_SOURCE: replaceDockerNetwork(process.env.ROOT_URL),
  CLIENT_URL_ADANET: replaceDockerNetwork(process.env.CLIENT_URL_ADANET),
  DOCKER_ENV: process.env.DOCKER_ENV,
  EMAIL_SERVICE_URL: process.env.EMAIL_SERVICE_URL,
  EMAIL_CLIENT_ID: process.env.EMAIL_CLIENT_ID,
  EMAIL_CLIENT_KEY: process.env.EMAIL_CLIENT_KEY,
};
