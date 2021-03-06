import React, { useCallback } from 'react'
import { uniq } from 'lodash'
import { useAsync } from 'react-async-hook'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useHotspotBle } from '@helium/react-native-sdk'
import { ActivityIndicator } from 'react-native'
import useAlert from '../../../utils/hooks/useAlert'
import {
  FeaturesNavigationProp,
  FeaturesStackParamList,
} from '../../navigation/features/featuresNavigationTypes'
import Text from '../../../components/texts/Text'
import Box from '../../../components/boxes/Box'
import SafeAreaBox from '../../../components/boxes/SafeAreaBox'
import { getHotspotDetails } from '../../../utils/clients/appDataClient'
import { getAddress } from '../../../store/app/secureData'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'
import { useColors } from '../../../theme/themeHooks'

type Route = RouteProp<
  FeaturesStackParamList,
  'HotspotSetupWifiConnectingScreen'
>

const HotspotSetupWifiConnectingScreen = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<FeaturesNavigationProp>()
  const rootNav = useNavigation<RootNavigationProp>()

  const {
    params: {
      network,
      password,
      hotspotAddress,
      addGatewayTxn,
      hotspotType,
      gatewayAction,
    },
  } = useRoute<Route>()

  const { readWifiNetworks, setWifi, removeConfiguredWifi } = useHotspotBle()

  const { showOKAlert } = useAlert()
  const { primaryText } = useColors()

  const handleError = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (messageKey: string, err: unknown) => {
      await showOKAlert({ titleKey: 'generic.error', messageKey })
      if (navigation.canGoBack()) {
        navigation.goBack()
      }
    },
    [navigation, showOKAlert],
  )

  const navLoaction = useCallback(() => {
    navigation.navigate('HotspotSetupEnableLocationScreen', {
      hotspotAddress,
      addGatewayTxn,
      hotspotType,
      gatewayAction,
    })
  }, [addGatewayTxn, gatewayAction, hotspotAddress, hotspotType, navigation])

  const goToNextStep = useCallback(async () => {
    if (gatewayAction === 'setWiFi') {
      // console.log('HotspotSetupWifiConnectingScreen::SetWiFiSuccess!')
      await showOKAlert({
        titleKey: 'Success',
        messageKey: 'Set WiFi Successfully!',
      })
      if (hotspotAddress) {
        rootNav.navigate('HotspotScreen', {
          address: hotspotAddress,
        })
      } else {
        rootNav.navigate('MainTabs')
      }
    } else {
      const address = await getAddress()
      try {
        const hotspot = await getHotspotDetails(hotspotAddress)
        if (hotspot && hotspot.owner === address) {
          navigation.replace('OwnedHotspotErrorScreen')
        } else if (hotspot && hotspot.owner !== address) {
          navigation.replace('NotHotspotOwnerErrorScreen')
        } else {
          navLoaction()
        }
      } catch (error) {
        navLoaction()
      }
    }
  }, [
    gatewayAction,
    hotspotAddress,
    navLoaction,
    navigation,
    rootNav,
    showOKAlert,
  ])

  const connectToWifi = useCallback(async () => {
    console.log(
      'HotspotSetupWifiConnectingScreen::connectToWifi::network:',
      network,
      password,
    )
    try {
      const response = await setWifi(network, password)
      console.log(
        'HotspotSetupWifiConnectingScreen::setWifi::response:',
        response,
      )
      if (response === 'not_found') {
        handleError('generic.something_went_wrong', 'not_found')
      } else if (response === 'invalid') {
        handleError('generic.invalid_password', null)
      } else {
        goToNextStep()
      }
    } catch (error) {
      handleError('generic.something_went_wrong', error)
    }
  }, [goToNextStep, handleError, network, password, setWifi])

  const forgetWifi = async () => {
    try {
      const connectedNetworks = uniq((await readWifiNetworks(true)) || [])
      console.log(
        'HotspotSetupWifiConnectingScreen::connectedNetworks',
        connectedNetworks.length,
        connectedNetworks,
      )
      if (connectedNetworks.length > 0) {
        // await removeConfiguredWifi('nanchao-2_5G')
        if (connectedNetworks[0] === network) {
          await removeConfiguredWifi(network)
        } else {
          await removeConfiguredWifi(connectedNetworks[0])
          if (connectedNetworks.includes(network)) {
            await removeConfiguredWifi(network)
          }
        }
      }
    } catch (e) {
      handleError('forget_wifi_error', e)
    }
  }

  useAsync(async () => {
    await forgetWifi()
    connectToWifi()
  }, [network, password])

  return (
    <SafeAreaBox flex={1} backgroundColor="primaryBackground">
      <Box flex={1} justifyContent="center" paddingBottom="xxl">
        <Box marginTop="xl">
          <ActivityIndicator color={primaryText} size={100} />
          <Text variant="body1" textAlign="center">
            {t('hotspot_setup.wifi_password.connecting').toUpperCase()}
          </Text>
        </Box>
      </Box>
    </SafeAreaBox>
  )
}

export default HotspotSetupWifiConnectingScreen
