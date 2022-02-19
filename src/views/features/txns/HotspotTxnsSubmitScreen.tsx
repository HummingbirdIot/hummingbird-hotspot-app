import React, { useState } from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useAsync } from 'react-async-hook'
import { AssertLocationV2 } from '@helium/transactions'
import { useOnboarding } from '@helium/react-native-sdk'
import { PendingTransaction } from '@helium/http'
import Box from '../../../components/Box'
import { DebouncedButton } from '../../../components/Button'
import Text from '../../../components/Text'
import { RootNavigationProp } from '../../navigation/naviTypes'
import SafeAreaBox from '../../../components/SafeAreaBox'
import { HotspotSetupStackParamList } from '../../navigation/features/hotspotSetupTypes'
import { submitTxn } from '../../../utils/clients/appDataClient'

type Route = RouteProp<HotspotSetupStackParamList, 'HotspotTxnsSubmitScreen'>

const HotspotTxnsSubmitScreen = () => {
  const { t } = useTranslation()
  const { params } = useRoute<Route>()
  const navigation = useNavigation<RootNavigationProp>()
  const { postPaymentTransaction } = useOnboarding()
  const [results, setResults] = useState<Array<PendingTransaction>>([])

  useAsync(async () => {
    console.log('HotspotTxnsSubmitScreen::useAsync::routeParams:', params)
    const tasks = []
    if (!params.gatewayAddress) {
      throw new Error('Gateway address not found')
    }
    if (params.gatewayTxn) {
      console.log(
        'HotspotTxnsSubmitScreen::params::gatewayTxn:',
        params.gatewayTxn,
      )
      const gatewayTxn = await postPaymentTransaction(
        params.gatewayAddress,
        params.gatewayTxn,
      )

      if (!gatewayTxn) {
        console.log('HotspotTxnsSubmitScreen::!gatewayTxn:')
        return
      }
      console.log('HotspotTxnsSubmitScreen::gatewayTxn:', gatewayTxn)
      // await
      tasks.push(submitTxn(gatewayTxn))
    }

    if (params.assertTxn) {
      let finalTxn = params.assertTxn
      const assertTxn = AssertLocationV2.fromString(finalTxn)

      const isFree = assertTxn.owner?.b58 !== assertTxn.payer?.b58 // Maker is paying
      console.log('HotspotTxnsSubmitScreen::assertTxn:', isFree, assertTxn)
      if (isFree) {
        // If the maker is paying, post to onboarding
        const onboardAssertTxn = await postPaymentTransaction(
          params.gatewayAddress,
          params.assertTxn,
        )
        if (!onboardAssertTxn) return

        finalTxn = onboardAssertTxn
      }
      console.log('HotspotTxnsSubmitScreen::finalTxn:', isFree, finalTxn)
      await submitTxn(finalTxn)
      tasks.push(submitTxn(finalTxn))
    }
    setResults(await Promise.all(tasks))
  }, [params])

  console.log('HotspotTxnsSubmitScreen::results', results.length, results)

  return (
    <SafeAreaBox
      flex={1}
      backgroundColor="primaryBackground"
      padding="lx"
      paddingTop="xxl"
    >
      <Box flex={1} alignItems="center" paddingTop="xxl">
        <Text variant="subtitle1" marginBottom="l">
          {t('hotspot_setup.progress.title')}
        </Text>
        <Box paddingHorizontal="l">
          <Text variant="body1" textAlign="center" marginBottom="l">
            {t('hotspot_setup.progress.subtitle')}
          </Text>
        </Box>
      </Box>
      <DebouncedButton
        onPress={() => navigation.navigate('MainTabs')}
        variant="primary"
        width="100%"
        mode="contained"
        title={t('hotspot_setup.progress.next')}
      />
    </SafeAreaBox>
  )
}

export default HotspotTxnsSubmitScreen
