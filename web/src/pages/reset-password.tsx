/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import React, { useRef, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  LinearProgress,
} from '@material-ui/core'
import { AppManager, UserManager } from '@app/managers'
import { userData } from '@app/data'
import { Spacer, Footer, MarketingDrawer } from '@app/components/general'
// @ts-ignore
import { strings } from '@app-strings'
import { withApollo } from '@app/apollo'

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: '7%',
    paddingBottom: '7%',
  },
  paper: {
    padding: theme.spacing(3),
    textAlign: 'center',
  },
  container: {},
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  submit: {
    marginTop: 10,
  },
  block: {
    flexDirection: 'column',
  },
  row: {
    marginTop: 10,
    flexDirection: 'row',
    display: 'inline-flex',
  },
  absolute: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
}))

function ResetPassword() {
  let savedEmail = ''

  const classes = useStyles()
  const {
    loading,
    forgotPassword,
    forgotPasswordData,
    resetPassword,
    resetPasswordData,
  } = userData(null, {
    query: false,
  })

  const emailRef = useRef(null)
  const resetRef = useRef(null)
  const resetSent = forgotPasswordData?.forgotPassword?.email === 'true'

  const title = resetSent ? 'Enter Reset Code' : 'Reset Password'

  useEffect(() => {
    if (resetPasswordData?.resetPassword?.jwt) {
      UserManager.setUser(resetPasswordData.resetPassword, true)
    }
  }, [resetPasswordData])

  useEffect(() => {
    if (resetSent) {
      AppManager.toggleSnack(
        true,
        'Please check your email and enter the reset code.',
        'message'
      )
    }
  }, [forgotPasswordData])

  const submit = (e: any) => {
    e.preventDefault()
    // @ts-ignore
    if (resetSent && resetRef?.current?.value) {
      resetPassword({
        variables: {
          email: savedEmail,
          // @ts-ignore
          resetCode: resetRef.current.value,
        },
      })
      // @ts-ignore
    } else if (emailRef?.current?.value) {
      forgotPassword({
        variables: {
          // @ts-ignore
          email: emailRef.current.value,
        },
      })
      // @ts-ignore
      savedEmail = emailRef.current.value
    } else {
      console.log('no value passed in')
    }
    if (emailRef?.current) {
      // @ts-ignore
      emailRef.current.value = ''
    }
  }

  return (
    <MarketingDrawer title='Reset Password' homeMenu={'Reset-Password'}>
      <Container maxWidth='xl' className={classes.root}>
        <Typography
          variant='h2'
          component={resetSent ? 'h3' : 'h1'}
          gutterBottom
        >
          {title}
        </Typography>
        <Paper className={classes.paper}>
          <form
            className={classes.container}
            autoComplete={resetSent ? 'on' : 'off'}
            onSubmit={submit}
          >
            <div>
              <FormControl>
                {resetSent ? (
                  <TextField
                    id='resetCode'
                    aria-describedby='my-reset-text'
                    className={classes.textField}
                    label='Reset Code'
                    type='text'
                    autoFocus
                    margin='normal'
                    variant='outlined'
                    required
                    inputRef={resetRef}
                  />
                ) : (
                  <TextField
                    id='email'
                    aria-describedby='my-email-text'
                    className={classes.textField}
                    label='Email'
                    type='email'
                    autoFocus
                    autoComplete='email'
                    margin='normal'
                    variant='outlined'
                    required
                    inputRef={emailRef}
                  />
                )}
              </FormControl>
            </div>
            <Button className={classes.submit} type='submit'>
              {resetSent ? 'Submit' : 'Send Email'}
            </Button>
          </form>
        </Paper>
      </Container>
      <Spacer height={`20vh`} />
      <Footer />
      {loading ? (
        <LinearProgress className={classes.absolute} color='secondary' />
      ) : null}
    </MarketingDrawer>
  )
}

ResetPassword.meta = {
  title: `${strings.appName} - Reset Password`,
}

export default withApollo(ResetPassword)
