/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { config } from "./index";

// TODO create whitelist array env map
export const whitelist = ["http://angelica"];

const source = config.DEV ? "localhost" : "a11ywatch";

export const logServerInit = (port: number) => {
  console.log([`🚀 Server ready at ${source}:${port}`]);
};
