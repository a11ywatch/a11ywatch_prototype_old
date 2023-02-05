/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import '@app-ui-stylesheet'
import '@app/stylesheets/tailwind.css'
import '@app/stylesheets/main.css'

import React, { useEffect, Fragment } from 'react'
import Router from 'next/router'
import { AppProps } from 'next/app'

import Head from 'next/head'

import { CssBaseline } from '@material-ui/core'
import { ThemeProvider } from '@material-ui/core/styles'

import { strings } from '@app-strings'
import { theme } from '@app-theme'
import { WithSnackBar, WithSkipContent } from '@app/components/adhoc'
import { userModel } from '@app/data'
import { startIntercom, generateFont } from '@app/utils'
import { APP_TYPE } from '@app/configs'

Router.events.on('routeChangeComplete', userModel.handleRoutes)

interface MergedApp extends AppProps {
  Component: AppProps['Component'] & {
    meta: any
  }
}

export default function MyApp({ Component, pageProps }: MergedApp) {
  useEffect(() => {
    startIntercom()
  }, [])

  return (
    <Fragment>
      <Head>
        <title>{Component?.meta?.title || strings?.meta?.title}</title>
        <meta
          name='viewport'
          content='minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no'
        />
        <meta
          name='description'
          content={Component?.meta?.description || strings?.meta?.description}
        />
        <meta name='theme-color' content={theme.palette.primary.main} />
        <link href='./manifest.json' rel='manifest' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <link rel='apple-touch-icon' href='./static/img/favicon-small.png' />
        <link rel='icon' type='image/x-icon' href='./static/img/favicon.png' />
        <link
          rel='preload'
          href={`./static/styles/${APP_TYPE}/styles.css`}
          as='style'
        />
        <link
          rel='preload'
          href={`./static/styles/${APP_TYPE}/fonts.css`}
          as='style'
        />
        <link
          rel='stylesheet'
          type='text/css'
          href={`./static/styles/${APP_TYPE}/styles.css`}
        />
        {generateFont()}
        <link
          rel='stylesheet'
          type='text/css'
          href={`./static/styles/${APP_TYPE}/fonts.css`}
        />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <WithSkipContent />
        <Component {...pageProps} />
        <WithSnackBar />
      </ThemeProvider>
    </Fragment>
  )
}
