/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import React, { useState, useEffect } from 'react'
import {
  Container,
  Typography,
  Button,
  TextField,
  Fade,
  IconButton,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import CloseIcon from '@material-ui/icons/Close'

import { Link, NavBar, PageTitle, Box } from '@app/components/general'
import { TextSkeleton } from '@app/components/placeholders'
import { AppManager } from '@app/managers'
import { userData } from '@app/data'
import { strings } from '@app-strings'
import { withApollo } from '@app/apollo'

const useStyles = makeStyles(() => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  email: {
    marginBottom: 10.5,
  },
  password: {
    marginRight: 70,
  },
  submit: {
    minWidth: 170,
  },
  payments: {
    minWidth: 170,
    background: '#fff',
    color: '#000',
    marginBottom: 10.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: 20,
  },
  input: {
    marginBottom: 10,
  },
  passwordTitle: {
    marginRight: 10,
  },
  defaultButton: {
    margin: 0,
    marginLeft: 70,
    padding: 0,
  },
}))

function Profile() {
  const classes = useStyles()
  const { data = {}, loading, updateUser, updateUserData } = userData()
  const [changePassword, setChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const { user } = data

  const onChangeCurrent = (event: any) => {
    setCurrentPassword(event.target.value)
  }

  const onChangeNew = (event: any) => {
    setNewPassword(event.target.value)
  }

  const updatePassword = (e: any) => {
    e?.preventDefault()
    updateUser({
      variables: {
        password: currentPassword,
        newPassword,
      },
    })
  }

  useEffect(() => {
    if (updateUserData?.updateUser?.success) {
      AppManager.toggleSnack(
        true,
        updateUserData?.updateUser?.message,
        'success'
      )
      setCurrentPassword('')
      setNewPassword('')
    }
  }, [updateUserData])

  return (
    <>
      <NavBar backButton title={'Profile'} marketing notitle />
      <Container maxWidth='xl'>
        <Box>
          <PageTitle title={`Profile`} />
          <Typography variant='subtitle1' component='p'>
            Email
          </Typography>
          {!data?.user && loading ? (
            <TextSkeleton className={classes.email} />
          ) : (
            <Typography
              variant='subtitle2'
              component='p'
              className={classes.email}
            >
              {user?.email}
            </Typography>
          )}
          <Typography variant='subtitle1' component='p'>
            Account Type
          </Typography>
          {!data?.user && loading ? (
            <TextSkeleton className={classes.email} />
          ) : (
            <Typography
              variant='subtitle2'
              component='p'
              className={classes.email}
            >
              {user?.role === 0
                ? 'Free'
                : user?.role === 1
                ? 'Basic'
                : 'Premium'}
            </Typography>
          )}
          <Button
            className={classes.payments}
            type='button'
            href='/payments'
            component={Link}
            variant='outlined'
          >
            Upgrade
          </Button>
          <div className={classes.row}>
            <Typography
              variant='subtitle1'
              component='p'
              className={classes.passwordTitle}
            >
              Password
            </Typography>
            {changePassword ? (
              <IconButton
                className={classes.defaultButton}
                aria-label='Clear update password form'
                onClick={() => setChangePassword(!changePassword)}
                color='inherit'
              >
                <CloseIcon fontSize='small' />
              </IconButton>
            ) : null}
          </div>
          {!data?.user && loading ? (
            <TextSkeleton width='8%' />
          ) : (
            <div className={classes.row}>
              {changePassword ? (
                <Fade in={changePassword}>
                  <form
                    onSubmit={updatePassword}
                    noValidate
                    className={classes.form}
                  >
                    <TextField
                      autoFocus
                      onChange={onChangeCurrent}
                      className={classes.input}
                      color='secondary'
                      // @ts-ignore
                      minLength='6'
                      // @ts-ignore
                      pattern='password'
                      autoComplete='current-password'
                      value={currentPassword}
                      id='current_password'
                      placeholder='Current Password'
                      type='password'
                      required
                    />
                    <TextField
                      onChange={onChangeNew}
                      className={classes.input}
                      color='secondary'
                      // @ts-ignore
                      pattern='password'
                      // @ts-ignore
                      minLength='6'
                      autoComplete='new-password'
                      value={newPassword}
                      id='new_password'
                      placeholder='New Password'
                      type='password'
                      required
                    />
                    <Button
                      onClick={updatePassword}
                      className={classes.submit}
                      type='submit'
                      variant='outlined'
                    >
                      Submit
                    </Button>
                  </form>
                </Fade>
              ) : (
                <Typography
                  variant='subtitle2'
                  component='p'
                  gutterBottom
                  className={classes.password}
                >
                  ******
                </Typography>
              )}
            </div>
          )}
          {!changePassword ? (
            <Button
              onClick={() => setChangePassword(!changePassword)}
              className={classes.submit}
              type='button'
              variant='outlined'
            >
              Change Password
            </Button>
          ) : null}
        </Box>
      </Container>
    </>
  )
}

Profile.meta = {
  title: `${strings.appName} - Profile`,
}

export default withApollo(Profile)
