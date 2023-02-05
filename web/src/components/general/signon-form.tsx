/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/

import React, { useRef, useMemo } from 'react'
import { GoogleLogin } from 'react-google-login'

import {
  Container,
  Typography,
  Button,
  TextField,
  FormControl,
  FormHelperText,
} from '@material-ui/core'

import { makeStyles } from '@material-ui/core/styles'
import { useMutation } from '@apollo/react-hooks'
import { REGISTER, LOGIN } from '@app/mutations'
import { AppManager, UserManager } from '@app/managers'
import { userModel } from '@app/data'
import { GOOGLE_CLIENT_ID } from '@app/configs'
import { GoogleIcon } from '@app/components/badges'

import { Link } from './link'
import { LinearBottom } from './loaders'

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: '12%',
    paddingBottom: '12%',
  },
  paper: {
    padding: theme.spacing(3),
    textAlign: 'center',
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 200,
  },
  submit: {
    marginTop: 10,
    width: 200,
  },
  textCenter: {
    textAlign: 'center',
    marginBottom: 10,
  },
  row: {
    marginTop: 10,
    flexDirection: 'row',
    display: 'inline-flex',
  },
  loginLink: {
    fontWeight: 'bold',
    marginLeft: 6,
  },
  or: {
    marginTop: 7,
  },
  google: {
    width: 200,
    minHeight: 40,
  },
  iconColor: {
    color: theme.palette.secondary.main,
  },
}))

function getTitle({ home, loginView }: any) {
  let title
  if (home) {
    title = 'Try for Free'
  } else if (loginView) {
    title = 'Login'
  } else {
    title = 'Register'
  }
  return title
}

export function SignOnForm({ loginView, home }: any) {
  const classes = useStyles()
  const [register, { data, error, loading }] = useMutation(REGISTER)
  const [
    login,
    { data: loginData, error: loginError, loading: loginLoading },
  ] = useMutation(LOGIN)
  const emailRef = useRef<any>(null)
  const passwordRef = useRef<any>(null)

  const signUpSource = data?.register || loginData?.login

  const mutationError = error?.graphQLErrors?.length
    ? error.graphQLErrors
    : loginError?.graphQLErrors

  useMemo(() => {
    if (signUpSource) {
      userModel.logIn(signUpSource)
      UserManager.setUser(signUpSource, true)
    }
  }, [signUpSource])

  useMemo(() => {
    if (mutationError) {
      AppManager.toggleSnack(true, mutationError, 'error')
    }
  }, [mutationError])

  const submit = (e: any) => {
    e.preventDefault()
    const signOnMutation = loginView ? login : register
    // @ts-ignore
    if (!passwordRef?.current?.value || !emailRef?.current?.value) {
      // const noPass = !emailRef.current.value

      AppManager.toggleSnack(
        true,
        !emailRef?.current?.value
          ? 'Please enter a password of at least 6 characters.'
          : 'Please check your email and password and try again.',
        'error'
      )
    } else {
      signOnMutation({
        variables: {
          email: emailRef?.current?.value,
          password: passwordRef?.current?.value,
        },
      }).catch((res: any) => {
        const errors = res?.graphQLErrors.map((error: any) => {
          return error?.message
        })
        console.log(errors)
      })
      // @ts-ignore
      if (passwordRef.current) {
        passwordRef.current.value = ''
      }
    }
  }

  const responseGoogle = (response: any) => {
    if (response.accessToken) {
      if (response.profileObj) {
        const signOnMutation = loginView ? login : register
        const emailCode = response.profileObj.email

        signOnMutation({
          variables: {
            email: emailCode,
            password: '',
            googleId: response?.googleId,
          },
        }).catch((res: any) => {
          const errors = res?.graphQLErrors?.map((error: any) => {
            return error?.message
          })
          console.log(errors)
        }) as any
      }
    }
  }

  const autoFocus = !home

  return (
    <>
      <Container maxWidth='sm' className={classes.root}>
        <Typography
          variant={home ? 'h4' : 'h2'}
          component={home ? 'h5' : 'h1'}
          gutterBottom
          align='center'
        >
          {getTitle({ home, loginView })}
        </Typography>
        <div className={classes.paper}>
          <GoogleLogin
            clientId={GOOGLE_CLIENT_ID + ''}
            buttonText={loginView ? 'Login' : 'Sign up with google'}
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            cookiePolicy={'single_host_origin'}
            render={(renderProps: any) => (
              <Button
                onClick={renderProps.onClick}
                className={classes.google}
                disabled={renderProps.disabled}
                variant='text'
                size='small'
                startIcon={<GoogleIcon className={classes.iconColor} />}
              >
                {loginView ? 'Login' : 'Sign up with google'}
              </Button>
            )}
          />
          <Typography variant='overline' component='p' className={classes.or}>
            Or
          </Typography>
          <form autoComplete={loginView ? 'on' : 'off'} onSubmit={submit}>
            <div>
              <FormControl>
                <TextField
                  id='email'
                  aria-describedby='my-email-text'
                  className={classes.textField}
                  label='Email'
                  type='email'
                  margin='dense'
                  autoFocus={autoFocus}
                  autoComplete='email'
                  variant='outlined'
                  required
                  inputRef={emailRef}
                />
                <FormHelperText
                  id='my-email-text'
                  className={classes.textCenter}
                >
                  We'll never share your email.
                </FormHelperText>
              </FormControl>
            </div>
            <div>
              <FormControl>
                <TextField
                  id='password'
                  aria-describedby='my-password-text'
                  className={`${classes.textField}`}
                  label='Password'
                  margin='dense'
                  inputProps={{
                    minLength: '6',
                  }}
                  type='password'
                  autoComplete='current-password'
                  variant='outlined'
                  required
                  inputRef={passwordRef}
                />
                <FormHelperText
                  id='my-password-text'
                  className={classes.textCenter}
                  style={{ marginBottom: 0 }}
                >
                  We'll never share your password.
                </FormHelperText>
              </FormControl>
            </div>
            <Button className={classes.submit} type='submit'>
              {loginView ? 'Login' : 'Create Account'}
            </Button>
          </form>
          {home ? (
            <span className={classes.row}>
              <Typography variant='overline' component='span'>
                Already have an account?
                <Link href='/login' className={classes.loginLink}>
                  Log in
                </Link>
              </Typography>
            </span>
          ) : null}
          {!home ? (
            <span className={classes.row}>
              <Typography variant='overline' component='p'>
                Forgot Password?{' '}
                <Link href='/reset-password' className={classes.loginLink}>
                  Reset
                </Link>
              </Typography>
            </span>
          ) : null}
        </div>
      </Container>
      <LinearBottom loading={loading || loginLoading} />
    </>
  )
}
