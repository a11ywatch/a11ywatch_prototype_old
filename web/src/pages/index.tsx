/*
 * Copyright (c) A11yWatch, LLC. and its affiliates.
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 **/
import React from 'react'

import { Container } from '@material-ui/core'
import {
  Footer,
  MarketingDrawer,
  SignOnForm,
  Price,
} from '@app/components/general'
import {
  CtaFeatures,
  CtaIntro,
  CtaVideo,
  CtaCustomers,
} from '@app/components/cta'
import { WithSwipeModal as SwipeableTemporaryDrawer } from '@app/components/adhoc'
import { strings } from '@app-strings'
import { withApollo } from '@app/apollo'

function Index() {
  return (
    <>
      <MarketingDrawer navPosition={'relative'}>
        <Container>
          <CtaIntro />
          <CtaVideo />
          <CtaFeatures />
          <CtaCustomers />
          <Price blockFree />
          <SignOnForm home />
        </Container>
        <Footer />
      </MarketingDrawer>
      <SwipeableTemporaryDrawer />
    </>
  )
}

Index.meta = {
  title: strings.meta.title,
}

export default withApollo(Index)
