/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import React from 'react'
import { Grid, Paper, Typography } from '@material-ui/core'
import { strings } from '@app-strings'
import { makeStyles } from '@material-ui/core/styles'

import {
  Accessibility as AccessibilityIcon,
  Notifications as NotificationsIcon,
  Code as CodeIcon,
  Build as BuildIcon,
  Cloud as CloudIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Compare as CompareIcon,
  Web as WebIcon,
  TripOrigin as TripIcon,
} from '@material-ui/icons'

const useStyles = makeStyles((theme) => ({
  root: {
    paddingBottom: '12%',
  },
  paper: {
    padding: theme.spacing(3),
    textAlign: 'center',
    margin: '3px',
    flex: 1,
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    minWidth: '25vw',
    [theme.breakpoints.down('sm')]: {
      flex: 'none',
      marginLeft: 0,
      marginRight: 0,
      marginBottom: '3px',
      width: '100%',
    },
  },
  hiddenAI: {
    [theme.breakpoints.up('lg')]: {
      display: 'none',
    },
  },
  title: {
    maxWidth: '80vw',
  },
  subtitle: {
    maxWidth: '80vw',
    textAlign: 'left',
  },
  flex: {
    flex: 1,
  },
}))

const RenderIcon = ({ index, ...props }: any): any =>
  React.createElement(
    (() => {
      switch (index) {
        case 0:
          return AccessibilityIcon
          break
        case 1:
          return NotificationsIcon
          break
        case 2:
          return CodeIcon
          break
        case 3:
          return BuildIcon
          break
        case 4:
          return CloudIcon
          break
        case 5:
          return SpeedIcon
          break
        case 6:
          return SecurityIcon
          break
        case 7:
          return CompareIcon
          break
        case 8:
          return WebIcon
          break
        case 9:
          return TripIcon
          break
        default:
          return SpeedIcon
          break
      }
    })(),
    props
  )

function FeatureItem({ item, index }: { item: any; index: number }) {
  const classes = useStyles()

  return (
    <Paper className={`${classes.paper} ${index >= 8 ? classes.hiddenAI : ''}`}>
      <RenderIcon index={index} fontSize='large' />
      <Typography
        variant='h5'
        component='span'
        gutterBottom
        className={classes.title}
      >
        {item.title}
      </Typography>
      <div className={classes.flex} />
      <Typography
        variant='subtitle1'
        component='p'
        gutterBottom
        className={classes.subtitle}
      >
        {item.detail}
      </Typography>
    </Paper>
  )
}

const CtaFeatures = () => {
  const classes = useStyles()

  return (
    <section className={classes.root}>
      <div>
        <Typography variant='h4' component='h2'>
          Fast and efficient, web accessibility made easy
        </Typography>
        <Typography variant='h6' component='p' gutterBottom>
          Our system is composed of a robost structure that makes us unique
        </Typography>
      </div>
      <Grid container alignItems={'center'} justify={'center'}>
        {strings.features.map((item: any, index: number) => (
          <FeatureItem item={item} index={index} key={item.id} />
        ))}
      </Grid>
    </section>
  )
}

export { CtaFeatures }
