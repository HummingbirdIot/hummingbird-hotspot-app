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
  FeaturesNavigationProp,
  FeaturesStackParamList,
} from '../../navigation/features/featuresNavigationTypes'
import BackScreenContainer from '../../../components/containers/BackScreenContainer'
import Box from '../../../components/boxes/Box'
import { DebouncedButton } from '../../../components/buttons/Button'
import Text from '../../../components/texts/Text'
import { decimalSeparator, groupSeparator } from '../../../utils/i18n'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'
import { getAddress } from '../../../utils/secureData'
import { getAccount } from '../../../utils/clients/heliumDataClient'
import { useColors } from '../../../theme/themeHooks'

type Route = RouteProp<
  FeaturesStackParamList,
  'HotspotAssertConfirmAntennaScreen'
>

const HotspotAssertConfirmAntennaScreen = () => {
  const { t } = useTranslation()
  const { getOnboardingRecord } = useOnboarding()
  const { params } = useRoute<Route>()
  const navigation = useNavigation<FeaturesNavigationProp>()
  const rootNav = useNavigation<RootNavigationProp>()
  const [account, setAccount] = useState<Account>()
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null)

  /**
   * 0: 未请求
   * 1: 请求OnboardingRecord
   * 2: 请求FeeData
   * 3: 错误
   * 4: 请求完成
   */
  const [fetchFeeDataStatus, setFetchFeeDataStatus] = useState<number>(0)
  const [fetchFeeDataError, setFetchFeeDataError] =
    useState<{ type: string; error: Error }>()
  const [feeData, setFeeData] =
    useState<{ totalStakingAmount: Balance<DataCredits> }>()

  // console.log('HotspotAssertConfirmAntennaScreen::routeParams:', params)
  const { elevation, gain, hotspot } = params
  const { gray } = useColors()

  useAsync(async () => {
    const address = await getAddress()
    if (!address) return
    setOwnerAddress(address)
  }, [])

  useEffect(() => {
    if (!ownerAddress) return

    getAccount(ownerAddress).then(setAccount)
  }, [ownerAddress])

  useEffect(() => {
    if (!ownerAddress) return
    if (!account) return
    if (fetchFeeDataStatus) return
    if (!hotspot) {
      setFetchFeeDataStatus(3)
      setFetchFeeDataError({
        type: 'Check_Hotspot_Data_Error',
        error: new Error(
          "Something wrong with your opration, there seems that you didn't pass a hotspot parameter to this screen.",
        ),
      })
      return
    }
    if (!account.balance) {
      setFetchFeeDataStatus(3)
      setFetchFeeDataError({
        type: 'Load_Fee_Data_Error',
        error: new Error(
          'Your wallet account not exists or the wallet has no balance',
        ),
      })
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
    setFetchFeeDataStatus(4)
  }, [
    ownerAddress,
    account,
    getOnboardingRecord,
    params.hotspotAddress,
    gain,
    elevation,
    fetchFeeDataStatus,
    hotspot,
  ])

  const navNext = useCallback(async () => {
    // console.log('HotspotTxnsProgressScreen::navNextParams:', params)
    navigation.replace('HotspotTxnsProgressScreen', params)
  }, [navigation, params])

  const handleClose = useCallback(() => rootNav.navigate('MainTabs'), [rootNav])

  if (fetchFeeDataError) {
    return (
      <BackScreenContainer onClose={handleClose}>
        <Box flex={1} justifyContent="center" paddingBottom="xxl">
          <Text textAlign="center" fontSize={30}>
            {t('hotspot_setup.antenna_fee.title_error')}
          </Text>
          <Text
            textAlign="center"
            fontSize={16}
            marginTop="xs"
            marginBottom="xxl"
          >
            {t('hotspot_setup.antenna_fee.subtitle_error')}
          </Text>

          <Box backgroundColor="grayExtraLight" borderRadius="m" padding="xl">
            <Text textAlign="center" fontSize={16}>
              {fetchFeeDataError.type}
            </Text>
            <Text textAlign="center" fontSize={16} marginTop="xl">
              {fetchFeeDataError.error.toString()}
            </Text>
          </Box>
        </Box>
      </BackScreenContainer>
    )
  }

  if (!feeData || fetchFeeDataStatus < 4) {
    return (
      <BackScreenContainer onClose={handleClose}>
        <Box flex={1} justifyContent="center" paddingBottom="xxl">
          <ActivityIndicator color={gray} size={54} />
          <Text textAlign="center" variant="body1" marginTop="m">
            {t('hotspot_setup.antenna_fee.calculating_fee')}
          </Text>
        </Box>
      </BackScreenContainer>
    )
  }

  return (
    <BackScreenContainer onClose={handleClose}>
      <ScrollView>
        <Box flex={1} justifyContent="center" paddingBottom="xxl">
          <Text variant="h1" marginBottom="l" maxFontSizeMultiplier={1}>
            {t('hotspot_setup.antenna_fee.title')}
          </Text>
          <Text
            variant="subtitle1"
            marginBottom={{ phone: 'l', smallPhone: 'ms' }}
          >
            {t('hotspot_setup.antenna_fee.subtitle_fee')}
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
          title={t('hotspot_setup.antenna_fee.next')}
          mode="contained"
          variant="secondary"
          onPress={navNext}
        />
      </Box>
    </BackScreenContainer>
  )
}

export default HotspotAssertConfirmAntennaScreen
