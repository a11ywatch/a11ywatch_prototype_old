/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import React from 'react'
import { Typography, Tooltip } from '@material-ui/core'
import { styleSpace } from './style'
import { strings } from '@app-strings'

export const FacebookBadge = ({
  style = styleSpace,
  href = 'https://www.facebook.com/A11ywatch-114828426730553/',
  inline,
}: any) => {
  const FACEBOOK = 'Facebook'
  const TITLE = `${strings.appName} on ${FACEBOOK}`

  const icon = (
    <a
      href={href}
      style={!inline ? style : {}}
      target='_blank'
      aria-label={TITLE}
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 15.3 15.4'
        height='18'
        fill={'#959da5'}
      >
        <path
          d='M14.5 0H.8a.88.88 0 0 0-.8.9v13.6a.88.88 0 0 0 .8.9h7.3v-6h-2V7.1h2V5.4a2.87 2.87 0 0 1 2.5-3.1h.5a10.87 10.87 0 0 1 1.8.1v2.1h-1.3c-1 0-1.1.5-1.1 1.1v1.5h2.3l-.3 2.3h-2v5.9h3.9a.88.88 0 0 0 .9-.8V.8a.86.86 0 0 0-.8-.8z'
          fillRule='evenodd'
        ></path>
      </svg>
    </a>
  )

  if (inline) {
    return (
      <div style={{ display: 'flex' }}>
        {icon}
        <Typography variant={'subtitle2'} style={{ marginLeft: 12 }}>
          {FACEBOOK}
        </Typography>
      </div>
    )
  }

  return <Tooltip title={TITLE}>{icon}</Tooltip>
}
