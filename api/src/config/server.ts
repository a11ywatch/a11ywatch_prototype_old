/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { config } from "./config";

const { CLIENT_URL, CRAWL_URL, CLIENT_URL_ADANET, DEV, GRAPHQL_PORT } = config;

// TODO create whitelist array env map
export const whitelist = [
  CLIENT_URL,
  String(CLIENT_URL).replace("http", "https"),
  CRAWL_URL,
  CLIENT_URL_ADANET,
  "https://adanet-test.herokuapp.com",
  "https://mordern-net.herokuapp.com/",
  "https://www.enableyoursite.com",
  "https://www.adafirm.net",
  "https://d2kxkcfquhc28u.cloudfront.net",
  "http://d2kxkcfquhc28u.cloudfront.net",
  "https://a11bot.herokuapp.com",
  "http://127.0.0.1",
  "http://0.0.0.0",
];

// pages that will take a long time to crawl: EVENTUALLY REMOVE
export const TEMP_WATCHER_BLACKLIST = [
  `twitter.com`,
  `etsy.com`,
  "gmail.com",
  "etsy.com",
  `google.com`,
  `dropbox.com`,
  `github.com`,
  `nytimes.com`,
  `squareup.com`,
  `gamestop.com`,
  `facebook.com`,
  `amazon.com`,
  `netflix.com`,
  "myspace.com",
  "alibaba.com",
  "producthunt.com",
];

export const corsOptions = {
  origin: whitelist,
  credentials: true,
};

export const BYPASS_AUTH = [
  "Register",
  "Login",
  "Ping",
  "ForgotPassword",
  "Testout",
  "ResetPassword",
  "getWebsites",
  "getIssue",
  "getScript",
  "getUser",
  "ScanWebsite",
  "CrawlWebsite",
  "Payments",
  "IntrospectionQuery",
];

export const cronTimer = DEV ? "0 1 * * *" : "0 16 * * *";

const source = DEV ? "localhost" : "a11ywatch";

export const logServerInit = (server: any) => {
  console.log([
    `🚀 Server ready at ${source}:${GRAPHQL_PORT}${server?.graphqlPath}`,
    `🚀 Subscriptions ready at ws://${source}:${GRAPHQL_PORT}${server?.subscriptionsPath}`,
  ]);
};
// interface ServerInit {
//   graphqlPath: string;
//   subscriptionsPath: string;
// }
