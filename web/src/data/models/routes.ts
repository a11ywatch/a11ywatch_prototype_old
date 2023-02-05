/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

const { userModel } = require('./user')

const routeHandle = {
  get routeBlocked() {
    return ['/roadmap', '/about', '/privacy'].includes(userModel.originalUrl)
  },
}

export { routeHandle }
