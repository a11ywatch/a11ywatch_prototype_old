/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import { Query } from "./queries";
import { Mutation } from "./mutations";
import { Subscription } from "./subscriptions";
import {
  User,
  History,
  Website,
  Issue,
  Feature,
  SubDomain,
  Analytic,
  Script,
} from "./models";

export const resolvers = {
  Script,
  Query,
  Mutation,
  Subscription,
  User,
  Analytic,
  Website,
  Issue,
  Feature,
  SubDomain,
  History,
};
