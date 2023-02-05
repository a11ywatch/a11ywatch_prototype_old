/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { DEV } from "./index";

// TODO create whitelist array env map
export const whitelist = [
  "https://adanet-test.herokuapp.com",
  "https://mordern-net.herokuapp.com/",
  "https://www.enableyoursite.com",
  "https://www.adafirm.net",
  "https://d2kxkcfquhc28u.cloudfront.net",
  "http://d2kxkcfquhc28u.cloudfront.net",
  "https://a11bot.herokuapp.com",
];

export const corsOptions = {
  origin: whitelist,
  credentials: true,
};

const source = DEV ? "localhost" : "a11ywatch";

export const logServerInit = (port: number): void => {
  console.log([`🚀 Server ready at ${source}:${port}`]);
};
