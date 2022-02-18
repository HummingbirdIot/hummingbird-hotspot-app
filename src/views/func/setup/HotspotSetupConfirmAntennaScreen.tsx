import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import {
  Address,
  AssertLocationV2,
  Balance,
  DataCredits,
  useOnboarding,
} from '@helium/react-native-sdk'
import type { Account } from '@helium/http'
import { useAsync } from 'react-async-hook'
import { CurrencyType } from '@helium/currency'
import {
  HotspotSetupNavigationProp,
  HotspotSetupStackParamList,
} from '../../navi/func/hotspotSetupTypes'
import BackScreen from '../../../components/BackScreen'
import Box from '../../../components/Box'
import { DebouncedButton } from '../../../components/Button'
import Text from '../../../components/Text'
import { decimalSeparator, groupSeparator } from '../../../utils/i18n'
import { RootNavigationProp } from '../../navi/naviTypes'
import { getAddress } from '../../../utils/secureAccount'
import { getAccount } from '../../../utils/appDataClient'

type Route = RouteProp<
  HotspotSetupStackParamList,
  'HotspotSetupConfirmAntennaScreen'
>

const HotspotSetupConfirmAntennaScreen = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<HotspotSetupNavigationProp>()
  const rootNav = useNavigation<RootNavigationProp>()
  const [account, setAccount] = useState<Account>()
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null)
  const [feeData, setFeeData] =
    useState<{ totalStakingAmount: Balance<DataCredits> }>()
  const { params } = useRoute<Route>()
  const { elevation, gain, hotspot } = params
  const { getOnboardingRecord } = useOnboarding()

  // console.log('HotspotSetupConfirmAntennaScreen::routeParams:', params)

  useAsync(async () => {
    const address = await getAddress()
    if (!address) return
    setOwnerAddress(address)
  }, [])

  useEffect(() => {
    if (!ownerAddress) return

    getAccount(ownerAddress).then(setAccount)
  }, [ownerAddress])
  // console.log('HotspotSetupConfirmAntennaScreen::account', account)

  useEffect(() => {
    if (!ownerAddress || !account?.balance) {
      return
    }
    const addr = Address.fromB58(params.hotspotAddress)
    const { fee } = new AssertLocationV2({
      owner: addr,
      gateway: addr,
      payer: addr,
      location: 'fffffffffffffff',
      gain,
      elevation,
      nonce: hotspot?.nonce || 1,
    })
    const totalStakingAmount = new Balance(fee, CurrencyType.dataCredit)
    setFeeData({ totalStakingAmount })
  }, [
    ownerAddress,
    account,
    getOnboardingRecord,
    params.hotspotAddress,
    gain,
    elevation,
    hotspot?.nonce,
  ])

  const navNext = useCallback(async () => {
    console.log('HotspotTxnsProgressScreen::navNextParams', params)
    navigation.replace('HotspotTxnsProgressScreen', params)
  }, [navigation, params])

  const handleClose = useCallback(() => rootNav.navigate('MainTabs'), [rootNav])

  if (!feeData) {
    return (
      <BackScreen onClose={handleClose}>
        <Box flex={1} justifyContent="center" paddingBottom="xxl">
          <ActivityIndicator color="#687A8C" size={54} />
          <Text textAlign="center" fontSize={16} marginTop="m">
            Getting Fee Data
          </Text>
        </Box>
      </BackScreen>
    )
  }

  return (
    <BackScreen onClose={handleClose}>
      <ScrollView>
        <Box flex={1} justifyContent="center" paddingBottom="xxl">
          <Text variant="h1" marginBottom="l" maxFontSizeMultiplier={1}>
            {t('hotspot_setup.location_fee.title')}
          </Text>
          <Text
            variant="subtitle1"
            marginBottom={{ phone: 'l', smallPhone: 'ms' }}
          >
            {t('hotspot_setup.location_fee.subtitle_fee')}
          </Text>
          <Box
            flexDirection="row"
            justifyContent="space-between"
            marginTop={{ phone: 'm', smallPhone: 'xxs' }}
          >
            <Text variant="body1" color="secondaryText">
              {t('hotspot_setup.location_fee.gain_label')}
            </Text>
            <Text variant="body1" color="primaryText">
              {t('hotspot_setup.location_fee.gain', { gain })}
            </Text>
          </Box>

          <Box
            flexDirection="row"
            justifyContent="space-between"
            marginTop={{ phone: 'm', smallPhone: 'xxs' }}
          >
            <Text variant="body1" color="secondaryText">
              {t('hotspot_setup.location_fee.elevation_label')}
            </Text>
            <Text variant="body1" color="primaryText">
              {t('hotspot_setup.location_fee.elevation', { count: elevation })}
            </Text>
          </Box>
          <Box
            flexDirection="row"
            justifyContent="space-between"
            paddingTop="m"
            marginTop={{ phone: 'm', smallPhone: 'xxs' }}
          >
            <Text variant="body1" color="secondaryText">
              {t('hotspot_setup.location_fee.balance')}
            </Text>
            <Text variant="body1" color="secondaryText">
              {account?.balance?.toString(2, {
                groupSeparator,
                decimalSeparator,
              })}
            </Text>
          </Box>

          <Box
            flexDirection="row"
            justifyContent="space-between"
            marginTop={{ phone: 'm', smallPhone: 'xxs' }}
          >
            <Text variant="body1" color="secondaryText">
              {t('hotspot_setup.location_fee.fee')}
            </Text>
            <Text variant="body1" color="primaryText">
              {feeData.totalStakingAmount.toString(2)}
            </Text>
          </Box>
        </Box>
      </ScrollView>
      <Box>
        <DebouncedButton
          title={t('hotspot_setup.location_fee.fee_next')}
          mode="contained"
          variant="secondary"
          onPress={navNext}
        />
      </Box>
    </BackScreen>
  )
}

export default HotspotSetupConfirmAntennaScreen
