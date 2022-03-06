/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView } from 'react-native'
import { useTranslation } from 'react-i18next'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import {
  Balance,
  DataCredits,
  Location,
  NetworkTokens,
  USDollars,
  useOnboarding,
} from '@helium/react-native-sdk'
import type { Account } from '@helium/http'
import { useAsync } from 'react-async-hook'
import {
  FeaturesNavigationProp,
  FeaturesStackParamList,
} from '../../navigation/features/featuresNavigationTypes'
import BackScreen from '../../../components/containers/BackScreenContainer'
import Box from '../../../components/boxes/Box'
import { DebouncedButton } from '../../../components/buttons/Button'
import Text from '../../../components/texts/Text'
import { decimalSeparator, groupSeparator } from '../../../utils/i18n'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'
import { getAddress } from '../../../utils/secureData'
import { getAccount } from '../../../utils/clients/heliumDataClient'
import HotspotLocationPreview from '../../../components/locations/HotspotLocationPreview'

type Route = RouteProp<
  FeaturesStackParamList,
  'HotspotAssertConfirmLocationScreen'
>

const HotspotAssertConfirmLocationScreen = () => {
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
  const [feeData, setFeeData] = useState<{
    isFree: boolean
    hasSufficientBalance: boolean
    remainingFreeAsserts: number
    totalStakingAmount: Balance<NetworkTokens>
    totalStakingAmountDC: Balance<DataCredits>
    totalStakingAmountUsd: Balance<USDollars>
  }>()

  // console.log('HotspotAssertConfirmLocationScreen::routeParams:', params)
  const { elevation, gain, coords, gatewayAction, hotspot } = params

  useAsync(async () => {
    const address = await getAddress()
    if (!address) return
    setOwnerAddress(address)
  }, [])

  useEffect(() => {
    if (!ownerAddress) return
    // console.log('HotspotAssertConfirmLocationScreen::ownerAddress', ownerAddress)

    getAccount(ownerAddress).then(setAccount)
  }, [ownerAddress])
  // console.log('HotspotAssertConfirmLocationScreen::account', account)

  useEffect(() => {
    if (!ownerAddress) return
    if (!account) return
    if (fetchFeeDataStatus) return
    if (gatewayAction === 'assertLocation' && !hotspot) {
      setFetchFeeDataStatus(3)
      setFetchFeeDataError({
        type: 'Check_Hotspot_Data_Error',
        error: new Error(
          "Something wrong with your opration, there seems that you didn't pass a hotspot parameter to this screen.",
        ),
      })
      return
    }
    setFetchFeeDataStatus(1)
    setFetchFeeDataError(undefined)
    getOnboardingRecord(params.hotspotAddress)
      .then((onboardingRecord) => {
        // console.log(
        //   'HotspotAssertConfirmLocationScreen::onboardingRecord:',
        //   ownerAddress,
        //   onboardingRecord,
        // )
        if (!onboardingRecord) {
          setFetchFeeDataStatus(3)
          setFetchFeeDataError({
            type: 'Load_Fee_Data_Error',
            error: new Error(
              "Your hotspots haven't been recorded on the sever",
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
        setFetchFeeDataStatus(2)

        Location.loadLocationFeeData({
          nonce: hotspot?.nonce || 0,
          accountIntegerBalance: account.balance.integerBalance,
          dataOnly: hotspot?.mode === 'dataonly',
          owner: ownerAddress,
          locationNonceLimit: onboardingRecord.maker.locationNonceLimit,
          makerAddress: onboardingRecord.maker.address,
        })
          .then(setFeeData)
          .then(() => setFetchFeeDataStatus(4))
          .catch((error) => {
            setFetchFeeDataStatus(3)
            setFetchFeeDataError({
              type: 'Load_Fee_Data_Error',
              error,
            })
          })
      })
      .catch((error) => {
        setFetchFeeDataStatus(3)
        setFetchFeeDataError({
          type: 'Get_Onboarding_Record_Error',
          error,
        })
      })
  }, [
    ownerAddress,
    account,
    getOnboardingRecord,
    params.hotspotAddress,
    fetchFeeDataStatus,
    fetchFeeDataError,
    hotspot,
    gatewayAction,
  ])

  const navNext = useCallback(async () => {
    // console.log('HotspotTxnsProgressScreen::navNextParams:', params)
    navigation.replace('HotspotTxnsProgressScreen', params)
  }, [navigation, params])

  const handleClose = useCallback(() => rootNav.navigate('MainTabs'), [rootNav])

  if (fetchFeeDataError) {
    return (
      <BackScreen onClose={handleClose}>
        <Box flex={1} justifyContent="center" paddingBottom="xxl">
          <Text textAlign="center" fontSize={30}>
            Ooooops!
          </Text>
          <Text
            textAlign="center"
            fontSize={16}
            marginTop="xs"
            marginBottom="xxl"
          >
            Getting Fee Data Failed
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
      </BackScreen>
    )
  }

  if (!feeData || fetchFeeDataStatus < 4) {
    return (
      <BackScreen onClose={handleClose}>
        <Box flex={1} justifyContent="center" paddingBottom="xxl">
          <ActivityIndicator color="#687A8C" />
          <Text textAlign="center" fontSize={16} marginTop="m">
            Getting Fee Data
          </Text>
        </Box>
      </BackScreen>
    )
  }

  const { isFree, hasSufficientBalance, totalStakingAmount } = feeData

  // console.log(
  //   'HotspotTxnsProgressScreen::feeData::isFree:',
  //   isFree,
  //   hotspot?.nonce,
  //   hotspot?.mode,
  //   totalStakingAmount,
  // )

  return (
    <BackScreen onClose={handleClose}>
      <ScrollView>
        <Box flex={1} justifyContent="center" paddingBottom="xxl">
          <Text variant="h1" marginBottom="l" maxFontSizeMultiplier={1}>
            {t('hotspot_setup.location_fee.title')}
          </Text>
          {isFree ? (
            <Text
              variant="subtitle1"
              marginBottom={{ phone: 'l', smallPhone: 'ms' }}
            >
              {t('hotspot_setup.location_fee.subtitle_free')}
            </Text>
          ) : (
            <Text
              variant="subtitle1"
              marginBottom={{ phone: 'l', smallPhone: 'ms' }}
            >
              {t('hotspot_setup.location_fee.subtitle_fee')}
            </Text>
          )}
          <Text
            variant="subtitle1"
            marginBottom={{ phone: 'xl', smallPhone: 'ms' }}
            numberOfLines={2}
            adjustsFontSizeToFit
            maxFontSizeMultiplier={1.3}
          >
            {t('hotspot_setup.location_fee.confirm_location')}
          </Text>
          <Box
            height={200}
            borderRadius="l"
            overflow="hidden"
            marginBottom={{ phone: 'm', smallPhone: 'ms' }}
          >
            <HotspotLocationPreview
              mapCenter={coords}
              locationName={params.locationName}
            />
          </Box>

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

          {!isFree && (
            <>
              <Box
                flexDirection="row"
                justifyContent="space-between"
                paddingTop="m"
                marginTop={{ phone: 'm', smallPhone: 'xxs' }}
              >
                <Text variant="body1" color="secondaryText">
                  {t('hotspot_setup.location_fee.balance')}
                </Text>
                <Text
                  variant="body1"
                  color={hasSufficientBalance ? 'secondaryText' : 'error'}
                >
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
                  {totalStakingAmount.toString(2)}
                </Text>
              </Box>

              {!hasSufficientBalance && (
                <Box marginTop={{ phone: 'l', smallPhone: 'xxs' }}>
                  <Text variant="body2" color="error" textAlign="center">
                    {t('hotspot_setup.location_fee.no_funds')}
                  </Text>
                </Box>
              )}
            </>
          )}
        </Box>
      </ScrollView>
      <Box>
        <DebouncedButton
          title={
            gatewayAction === 'addGateway'
              ? t('hotspot_setup.add_hotspot.next')
              : isFree
              ? t('hotspot_setup.location_fee.next')
              : t('hotspot_setup.location_fee.fee_next')
          }
          mode="contained"
          variant="secondary"
          onPress={navNext}
          disabled={isFree ? false : !hasSufficientBalance}
        />
      </Box>
    </BackScreen>
  )
}

export default HotspotAssertConfirmLocationScreen
