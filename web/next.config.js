/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
const { resolve } = require('path')
const { parsed } = require('dotenv').config()
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin')

const { domainMap } = require('./domain-map')
const { generateSiteMap } = require('./generate-sitemap')
const { getDynamicPaths } = require('./dynamic-paths')

const dev = process.env.NODE_ENV !== 'production'
// DOCKER URL SERVICES
const proxyDockerUrls = ['mav', 'localhost', 'angelica', 'cdn-server', 'api']

const replaceDockerNetwork = (url) => {
  if (!dev && process.env.DOCKER_ENV) {
    const includesElement = (element) => url.includes(element)
    const hasIndex = proxyDockerUrls.findIndex(includesElement)

    if (hasIndex !== -1) {
      return url.replace(proxyDockerUrls[hasIndex], '3.15.161.13')
    }
  }
  return url
}

const env = Object.assign({}, parsed, {
  dev,
  APP_TYPE: process.env.APP_TYPE || 'main',
  API: replaceDockerNetwork(process.env.API),
  WEB_SOCKET_URL: replaceDockerNetwork(process.env.WEB_SOCKET_URL),
  STRIPE_KEY:
    process.env.STRIPE_KEY_PROD && !dev
      ? process.env.STRIPE_KEY_PROD
      : process.env.STRIPE_KEY,
  SCRIPTS_CDN_URL_HOST:
    process.env.SCRIPTS_CDN_URL_HOST_PROD && !dev
      ? process.env.SCRIPTS_CDN_URL_HOST_PROD
      : process.env.SCRIPTS_CDN_URL_HOST,
  INTERCOM_APPID: process.env.INTERCOM_APPID,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_ANALYTIC_ID: process.env.GOOGLE_ANALYTIC_ID,
  API_ENDPOINT: process.env.API_ENDPOINT,
  // PREVENT SETTING THIS ENVS
  NODE_ENV: undefined,
  NODE_MODULES_CACHE: undefined,
})

module.exports = {
  compress: true,
  generateBuildId: async () => {
    if (process.env.SOURCE_VERSION) {
      return `cust-next-build-${process.env.SOURCE_VERSION}`
    }

    return null
  },
  dev,
  env,
  webpack: (
    config,
    { buildId, dev: development, isServer, defaultLoaders, webpack }
  ) => {
    generateSiteMap(process.env.DOMAIN_NAME)
    const { themeType, stringType } = domainMap(process.env.APP_TYPE)
    const { uiIncludes, uiStylePath, uiComponentPath } = getDynamicPaths({
      themeType,
      dev,
    })

    const nodeExclude = [resolve(__dirname, 'node_modules')]

    config.module.rules.push(
      {
        test: /\.+(js|jsx)$/,
        use: defaultLoaders.babel,
        include: uiIncludes,
        exclude: nodeExclude,
      },
      {
        test: /\.(ts|tsx)?$/,
        include: uiIncludes,
        exclude: nodeExclude,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      }
    )

    const rule = config.module.rules
      .find((rule) => rule.oneOf)
      .oneOf.find(
        (r) => r.issuer && r.issuer.include && r.issuer.include.includes('_app')
      )

    if (rule) {
      rule.issuer.include = [
        rule.issuer.include,
        /[\\/]node_modules[\\/]monaco-editor[\\/]/,
      ]
    }

    config.plugins.push(
      new MonacoWebpackPlugin({
        languages: ['javascript'],
        filename: 'static/[name].worker.js',
      })
    )
    config.resolve.alias = {
      ...config.resolve.alias,
      ['@app-theme']: resolve(__dirname, `./src/theme/${themeType}`),
      ['@app-strings']: resolve(
        __dirname,
        `./src/content/strings/${stringType}`
      ),
      ['@app-strings']: resolve(
        __dirname,
        `./src/content/strings/${stringType}`
      ),
      ['@app-ui-stylesheet']: uiStylePath,
      ['@app']: resolve(__dirname, './src'),
      ['ui']: uiComponentPath,
    }

    if (!development) {
      if (!Array.isArray(config.optimization.minimizer)) {
        config.optimization.minimizer = []
      }
      config.optimization.minimize = true
      config.optimization.minimizer.push(new OptimizeCSSAssetsPlugin()),
        config.optimization.minimizer.push(new TerserPlugin())
    } else {
      config.devtool = 'cheap-module-source-map'
    }

    return config
  },
}
