import React, { useCallback } from 'react'
import { uniq } from 'lodash'
import { useAsync } from 'react-async-hook'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { BleError, useHotspotBle } from '@helium/react-native-sdk'
import useAlert from '../../../../utils/useAlert'
import {
  HotspotSetupNavigationProp,
  HotspotSetupStackParamList,
} from './hotspotSetupTypes'
import Text from '../../../../components/Text'
import Box from '../../../../components/Box'
import SafeAreaBox from '../../../../components/SafeAreaBox'
import { getHotspotDetails } from '../../../../utils/appDataClient'
import { getAddress } from '../../../../utils/secureAccount'
import { RootNavigationProp } from '../../tabs/tabTypes'

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

  const handleError = useCallback(
    async (err: unknown) => {
      let msg = ''

      if ((err as BleError).toString !== undefined) {
        msg = (err as BleError).toString()
      } else {
        msg = err as string
      }
      await showOKAlert({ titleKey: 'generic.error', messageKey: msg })
      navigation.goBack()
    },
    [navigation, showOKAlert],
  )

  const goToNextStep = useCallback(async () => {
    if (gatewayAction === 'setWiFi') {
      console.log('HotspotSetupWifiConnectingScreen::Set WiFi Success!')
      rootNav.navigate('MainTabs')
    } else {
      const address = await getAddress()
      console.log(
        'HotspotSetupWifiConnectingScreen::goToNextStep::address:',
        address,
      )
      try {
        const hotspot = await getHotspotDetails(hotspotAddress)
        console.log(
          'HotspotSetupPickWifiScreen::goToNextStep::hotspot:',
          hotspotAddress,
          hotspot,
        )
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
          // navigation.replace('HotspotSetupLocationInfoScreen', {
          //   hotspotAddress,
          //   addGatewayTxn,
          //   hotspotType,
          // })
          navigation.navigate('HotspotTxnsProgressScreen', {
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
        'HotspotSetupWifiConnectingScreen::connectToWifi::response:',
        response,
      )
      if (response === 'not_found') {
        showOKAlert({
          titleKey: 'generic.error',
          messageKey: 'generic.something_went_wrong',
        })
        navigation.goBack()
      } else if (response === 'invalid') {
        showOKAlert({
          titleKey: 'generic.error',
          messageKey: 'generic.invalid_password',
        })
        navigation.goBack()
      } else {
        goToNextStep()
      }
    } catch (error) {
      console.log('HotspotSetupWifiConnectingScreen::setWifi::error:', error)
      navigation.goBack()
    }
  }, [goToNextStep, navigation, network, password, setWifi, showOKAlert])

  const forgetWifi = async () => {
    try {
      const connectedNetworks = uniq((await readWifiNetworks(true)) || [])
      console.log(
        'HotspotSetupWifiConnectingScreen::forgetWifi::connectedNetworks:',
        connectedNetworks.length,
        connectedNetworks,
      )
      if (connectedNetworks.length > 0) {
        await removeConfiguredWifi(connectedNetworks[0])
      }
    } catch (e) {
      console.log('HotspotSetupWifiConnectingScreen::forgetWifi::error:', e)
      handleError(e)
    }
  }

  useAsync(async () => {
    await forgetWifi()
    connectToWifi()
  }, [])

  return (
    <SafeAreaBox flex={1} backgroundColor="primaryBackground">
      <Box flex={1} justifyContent="center" paddingBottom="xxl">
        <Box marginTop="xl">
          <Text variant="body1" textAlign="center">
            {t('hotspot_setup.wifi_password.connecting').toUpperCase()}
          </Text>
        </Box>
      </Box>
    </SafeAreaBox>
  )
}

export default HotspotSetupWifiConnectingScreen
