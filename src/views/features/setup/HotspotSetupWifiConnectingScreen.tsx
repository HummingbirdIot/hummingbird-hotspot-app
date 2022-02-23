import React, { useCallback } from 'react'
import { uniq } from 'lodash'
import { useAsync } from 'react-async-hook'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useHotspotBle } from '@helium/react-native-sdk'
import { ActivityIndicator } from 'react-native'
import useAlert from '../../../utils/hooks/useAlert'
import {
  HotspotSetupNavigationProp,
  HotspotSetupStackParamList,
} from '../../navigation/features/hotspotSetupTypes'
import Text from '../../../components/Text'
import Box from '../../../components/Box'
import SafeAreaBox from '../../../components/SafeAreaBox'
import { getHotspotDetails } from '../../../utils/clients/appDataClient'
import { getAddress } from '../../../utils/secureAccount'
import { RootNavigationProp } from '../../navigation/naviTypes'
import { useColors } from '../../../theme/themeHooks'

type Route = RouteProp<
  HotspotSetupStackParamList,
  'HotspotSetupWifiConnectingScreen'
>

const HotspotSetupWifiConnectingScreen = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<HotspotSetupNavigationProp>()
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
    async (messageKey: string, err: unknown) => {
      console.log(
        'HotspotSetupWifiConnectingScreen::handleError',
        messageKey,
        err,
      )

      await showOKAlert({ titleKey: 'generic.error', messageKey }).catch(
        (e) => {
          console.log(
            'HotspotSetupWifiConnectingScreen::showOKAlert::error:',
            e,
          )
        },
      )
      navigation.goBack()
    },
    [navigation, showOKAlert],
  )

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
      // console.log(
      //   'HotspotSetupWifiConnectingScreen::goToNextStep::address:',
      //   address,
      // )
      try {
        const hotspot = await getHotspotDetails(hotspotAddress)
        // console.log(
        //   'HotspotSetupPickWifiScreen::goToNextStep::hotspot:',
        //   hotspotAddress,
        //   hotspot,
        // )
        if (hotspot && hotspot.owner === address) {
          navigation.replace('OwnedHotspotErrorScreen')
        } else if (hotspot && hotspot.owner !== address) {
          navigation.replace('NotHotspotOwnerErrorScreen')
        } else {
          console.log(
            'HotspotSetupWifiConnectingScreen::goToNextStep::addGatewayTxn:',
            hotspotType,
            addGatewayTxn,
          )
          navigation.replace('HotspotTxnsProgressScreen', {
            hotspotAddress,
            addGatewayTxn,
            // hotspotType,
          })
        }
      } catch (error) {
        console.log(
          'HotspotSetupWifiConnectingScreen::getHotspotDetails::error:',
          hotspotAddress,
          error,
        )
        navigation.replace('HotspotTxnsProgressScreen', {
          hotspotAddress,
          addGatewayTxn,
          // hotspotType,
        })
      }
    }
  }, [
    addGatewayTxn,
    gatewayAction,
    hotspotAddress,
    hotspotType,
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
      // console.log(
      //   'HotspotSetupWifiConnectingScreen::connectedNetworks',
      //   connectedNetworks.length,
      //   connectedNetworks,
      // )
      if (connectedNetworks.length > 0 && connectedNetworks.includes(network)) {
        await removeConfiguredWifi(network)
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
          <ActivityIndicator color={primaryText} />
          <Text variant="body1" textAlign="center">
            {t('hotspot_setup.wifi_password.connecting').toUpperCase()}
          </Text>
        </Box>
      </Box>
    </SafeAreaBox>
  )
}

export default HotspotSetupWifiConnectingScreen
