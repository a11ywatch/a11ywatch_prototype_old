/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import React, { useState } from 'react'
import StripeCheckout from 'react-stripe-checkout'

import {
  Container,
  Typography,
  Button,
  List,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { getDate } from 'date-fns'
import { AppConfig as Config } from '@app/configs'
import { strings } from '@app-strings'
import { withApollo } from '@app/apollo'
import { NavBar, PageTitle, Box } from '@app/components/general'
import { SimpleListItemSkeleton } from '@app/components/placeholders'
import { paymentsData } from '@app/data'
import { getOrdinalSuffix } from '@app/utils'
import { WithHydrate } from '@app/components/adhoc'

import Pricing from './pricing'

const useStyles = makeStyles(() => ({
  row: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  email: {
    marginBottom: 10.5,
  },
  submit: {
    minWidth: 170,
  },
  cancel: {
    marginTop: 60,
    marginBottom: 30,
    background: '#fff',
    color: '#000',
  },
  cancelBtn: {
    background: 'transparent',
    boxShadow: 'none',
  },
}))

const defaultState = {
  basic: true,
  premium: false,
}

function Payments({ hideTitle = false }) {
  const classes = useStyles()
  const { data, loading, addSubscription, cancelSubscription } = paymentsData()
  const [state, setState] = useState(defaultState)
  const [open, setOpen] = useState(false)

  const handleChange = (newState: any) => () => {
    setState({
      basic: newState === 'Basic',
      premium: newState === 'Premium',
    })
  }

  const onToken = (token: any) => {
    if (token) {
      addSubscription({
        variables: {
          stripeToken: JSON.stringify({
            ...token,
            plan: state.premium ? 1 : 0,
          }),
          email: token.email,
        },
      })
    }
  }

  const handleModal = (modalOpen: boolean) => () => {
    setOpen(modalOpen)
  }

  const cancelConfirm = () => {
    cancelSubscription({
      variables: {
        email: data?.email,
      },
    })
    setOpen(false)
  }

  const renderPayMentBoxes = data?.role === 0 && !data.activeSubscription
  const nextPaymentDay =
    data?.paymentSubscription?.current_period_start &&
    getDate(new Date(data?.paymentSubscription?.current_period_start))

  return (
    <WithHydrate>
      <NavBar title={'Payments'} backButton marketing notitle />
      <Container maxWidth='xl'>
        <Box>
          {hideTitle ? null : <PageTitle>Payments</PageTitle>}
          {loading && !data ? (
            <>
              <Typography variant='subtitle1' component='p'>
                {!renderPayMentBoxes ? 'Account Info' : 'Upgrade Account'}
              </Typography>
              <List>
                <SimpleListItemSkeleton />
                <SimpleListItemSkeleton />
              </List>
            </>
          ) : (
            <>
              <Typography variant='subtitle1' component='p' gutterBottom>
                {!renderPayMentBoxes ? 'Account Info' : 'Upgrade Account'}
              </Typography>
              {renderPayMentBoxes ? (
                <Pricing
                  priceOnly
                  basic={state.basic || data?.role === 1}
                  premium={state.premium || data?.role === 2}
                  handleChange={handleChange}
                />
              ) : (
                <>
                  {nextPaymentDay ? (
                    <Typography variant='subtitle1' component='p'>
                      {`Payments will occur on the ${getOrdinalSuffix(
                        nextPaymentDay
                      )} of every month`}
                    </Typography>
                  ) : null}
                  <Typography variant='subtitle1' component='p'>
                    {`Account type ${
                      data?.paymentSubscription?.plan?.nickname || ''
                    } - $${
                      data?.paymentSubscription?.plan?.amount / 100 || ''
                    }`}
                  </Typography>
                </>
              )}
              {!renderPayMentBoxes ? (
                <>
                  <Button
                    title={'Cancel Subscription'}
                    type={'button'}
                    onClick={handleModal(true)}
                    className={classes.cancel}
                  >
                    Cancel Subscription
                  </Button>
                </>
              ) : (
                <StripeCheckout
                  token={onToken}
                  name={state.basic ? 'Basic' : 'Premium'}
                  stripeKey={Config.STRIPE_KEY + ''}
                  email={data?.email || ''}
                  // @ts-ignore
                  disabled={Boolean(!state.basic && !state.premium)}
                  amount={state.basic ? 1000 : 2000}
                  zipCode={false}
                  billingAddress={false}
                  // @ts-ignore
                  className={classes.cancel}
                  panelLabel={`${state.basic ? 'Basic' : 'Premium'} Plan`}
                />
              )}
              <Dialog
                open={open}
                onClose={handleModal(false)}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
              >
                <DialogTitle id='alert-dialog-title'>
                  {'Cancel your subscription? You can always re-sub later on.'}
                </DialogTitle>
                <DialogContent>
                  <DialogContentText id='alert-dialog-description'>
                    Cancel {data?.role === 1 ? 'basic' : 'premium'} subscription
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={handleModal(false)}
                    color='primary'
                    variant='contained'
                    className={classes.cancelBtn}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={cancelConfirm}
                    color='primary'
                    variant='contained'
                    type='submit'
                  >
                    Agree
                  </Button>
                </DialogActions>
              </Dialog>
            </>
          )}
        </Box>
      </Container>
    </WithHydrate>
  )
}

Payments.meta = {
  title: `${strings.appName} - Payments`,
}

export default withApollo(Payments)
