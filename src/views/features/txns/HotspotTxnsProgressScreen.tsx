import React from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { isString } from 'lodash'
import {
  useHotspotBle,
  HotspotErrorCode,
  WalletLink,
  Location,
  useOnboarding,
} from '@helium/react-native-sdk'
import { ActivityIndicator, Linking, Platform } from 'react-native'
import { useSelector } from 'react-redux'
import Box from '../../../components/boxes/Box'
import Text from '../../../components/texts/Text'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'
import SafeAreaBox from '../../../components/boxes/SafeAreaBox'
import { hotspotOnChain } from '../../../utils/clients/appDataClient'
import useAlert from '../../../utils/hooks/useAlert'
import {
  GatewayAction,
  FeaturesStackParamList,
} from '../../navigation/features/featuresNavigationTypes'
import { useColors } from '../../../theme/themeHooks'
import { DebouncedButton } from '../../../components/buttons/Button'
import useMount from '../../../utils/hooks/useMount'
import { RootState } from '../../../store/rootReducer'
import navigator from '../../navigation/navigator'

type Route = RouteProp<FeaturesStackParamList, 'HotspotTxnsProgressScreen'>

const HotspotTxnsProgressScreen = () => {
  const { t } = useTranslation()
  const { params } = useRoute<Route>()
  const navigation = useNavigation<RootNavigationProp>()
  const { showOKAlert } = useAlert()
  const { createGatewayTxn } = useHotspotBle()
  const { getOnboardingRecord } = useOnboarding()
  const { primaryText } = useColors()
  const { walletLinkToken: token, isWatcher } = useSelector(
    (state: RootState) => state.app.user,
  )

  const {
    hotspotAddress,
    addGatewayTxn: qrAddGatewayTxn,
    gatewayAction,
  } = params

  const handleError = async (error: unknown) => {
    // eslint-disable-next-line no-console
    console.error(error)
    let titleKey = 'generic.error'
    let messageKey = 'generice.something_went_wrong'

    if (isString(error)) {
      if (error === HotspotErrorCode.WAIT) {
        messageKey = 'hotspot_setup.add_hotspot.wait_error_body'
        titleKey = 'hotspot_setup.add_hotspot.wait_error_title'
      } else {
        messageKey = `Got error code ${error}`
      }
    }

    await showOKAlert({ titleKey, messageKey })
    navigation.navigate('MainTabs')
  }

  const submitOnboardingTxns = async () => {
    console.log('submitOnboardingTxns', token, isWatcher)
    if (!token) {
      if (isWatcher) {
        setTimeout(
          () =>
            navigator.demoExplorationTxns({
              action: gatewayAction as Exclude<GatewayAction, 'setWiFi'>,
            }),
          1000 * 3,
        )
      } else {
        handleError('Token Not found')
      }
      return
    }

    const parsed = WalletLink.parseWalletLinkToken(token)
    if (!parsed?.address) throw new Error('Invalid Token')

    const { address: ownerAddress } = parsed

    if (!hotspotAddress) {
      if (qrAddGatewayTxn) {
        throw new Error('Hotspot not found')
      } else {
        throw new Error('Hotspot disconnected')
      }
    }

    const updateParams = {
      token,
    } as WalletLink.SignHotspotRequest

    try {
      // check if add gateway needed
      const isOnChain = await hotspotOnChain(hotspotAddress)
      console.log('HotspotTxnsProgressScreen::isOnChain:', isOnChain)
      const onboardingRecord = await getOnboardingRecord(hotspotAddress)
      if (!onboardingRecord) return
      if (!isOnChain) {
        // if so, construct and publish add gateway
        if (qrAddGatewayTxn) {
          // Gateway QR scanned
          updateParams.addGatewayTxn = qrAddGatewayTxn
        } else {
          // Gateway BLE scanned
          const addGatewayTxn = await createGatewayTxn({
            ownerAddress,
            payerAddress: onboardingRecord.maker.address,
          })
          updateParams.addGatewayTxn = addGatewayTxn
        }
      }

      // construct and publish assert location
      if (params.coords) {
        const [lng, lat] = params.coords

        const assertLocationTxn = await Location.createLocationTxn({
          gateway: hotspotAddress,
          lat,
          lng,
          decimalGain: params.gain,
          elevation: params.elevation,
          dataOnly: false,
          owner: ownerAddress,
          currentLocation: params.currentLocation || '', // If reasserting location, put previous location here
          makerAddress: onboardingRecord.maker.address,
          locationNonceLimit: onboardingRecord.maker.locationNonceLimit || 0,
        })
        // console.log(
        //   'HotspotTxnsProgressScreen::assertLocationTxn:',
        //   assertLocationTxn,
        // )
        updateParams.assertLocationTxn = assertLocationTxn.toString()
      }
    } catch (error) {
      console.log('HotspotTxnsProgressScreen::fixParams::error:', error)
    }

    console.log('HotspotTxnsProgressScreen::updateParams:', updateParams)

    let url = WalletLink.createUpdateHotspotUrl(updateParams)
    if (!url) {
      // eslint-disable-next-line no-console
      console.error('Link could not be created')
      return
    }
    const { delegateApps } = WalletLink
    const { universalLink, urlScheme } = delegateApps[0]
    if (Platform.OS === 'android') {
      url = url.replace(universalLink, urlScheme)
    }
    console.log(
      'schemes and urls:',
      universalLink,
      urlScheme,
      url,
      url.replace(universalLink, urlScheme),
    )

    // console.log('HotspotTxnsProgressScreen::url:', url)

    const supported = await Linking.canOpenURL(url)
    if (supported) {
      Linking.openURL(url)
    } else {
    }
  }

  useMount(() => {
    const onmounted = async () => {
      try {
        await submitOnboardingTxns()
      } catch (e) {
        handleError(e)
      }
    }
    onmounted()
  })

  return (
    <SafeAreaBox
      flex={1}
      backgroundColor="primaryBackground"
      padding="lx"
      paddingTop="xxl"
    >
      <Box flex={1} alignItems="center" paddingTop="xxl">
        <Text variant="subtitle1" marginBottom="l">
          {gatewayAction === 'addGateway'
            ? t('hotspot_setup.progress.title_add')
            : t('hotspot_setup.progress.title_assert')}
        </Text>
        <Box flex={1} justifyContent="center">
          <ActivityIndicator color={primaryText} />
        </Box>
      </Box>
      <DebouncedButton
        onPress={() => navigation.navigate('MainTabs')}
        variant="primary"
        width="100%"
        mode="contained"
        title={t('generic.cancel')}
      />
    </SafeAreaBox>
  )
}

export default HotspotTxnsProgressScreen
