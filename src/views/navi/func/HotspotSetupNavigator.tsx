import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import HotspotSetupSelectionScreen from '../../func/setup/HotspotSetupSelectionScreen'
import HotspotSetupEducationScreen from '../../func/setup/HotspotSetupEducationScreen'
import HotspotSetupExternalScreen from '../../func/setup/HotspotSetupExternalScreen'
import HotspotSetupExternalConfirmScreen from '../../func/setup/HotspotSetupExternalConfirmScreen'
import HotspotSetupInstructionsScreen from '../../func/setup/HotspotSetupInstructionsScreen'
import HotspotSetupScanningScreen from '../../func/setup/HotspotSetupScanningScreen'
import HotspotSetupPickHotspotScreen from '../../func/setup/HotspotSetupPickHotspotScreen'
import HotspotSetupPickWifiScreen from '../../func/setup/HotspotSetupPickWifiScreen'
import HotspotSetupWifiScreen from '../../func/setup/HotspotSetupWifiScreen'
import HotspotSetupWifiConnectingScreen from '../../func/setup/HotspotSetupWifiConnectingScreen'
import HotspotSetupLocationInfoScreen from '../../func/setup/HotspotSetupLocationInfoScreen'
import HotspotSetupPickLocationScreen from '../../func/setup/HotspotSetupPickLocationScreen'
import HotspotSetupConfirmLocationScreen from '../../func/setup/HotspotSetupConfirmLocationScreen'
import HotspotSetupSkipLocationScreen from '../../func/setup/HotspotSetupSkipLocationScreen'

import FirmwareUpdateNeededScreen from '../../func/others/FirmwareUpdateNeededScreen'
import AntennaSetupScreen from '../../func/others/AntennaSetupScreen'

import HotspotTxnsProgressScreen from '../../func/txns/HotspotTxnsProgressScreen'
import HotspotTxnsSubmitScreen from '../../func/txns/HotspotTxnsSubmitScreen'

import OnboardingErrorScreen from '../../func/error/OnboardingErrorScreen'
import NotHotspotOwnerErrorScreen from '../../func/error/NotHotspotOwnerErrorScreen'
import OwnedHotspotErrorScreen from '../../func/error/OwnedHotspotErrorScreen'

import defaultScreenOptions from '../../defaultScreenOptions'

const HotspotSetupStack = createStackNavigator()

const HotspotSetup = () => {
  return (
    <HotspotSetupStack.Navigator
      headerMode="none"
      screenOptions={{ ...defaultScreenOptions }}
    >
      <HotspotSetupStack.Screen
        name="HotspotSetupSelectionScreen"
        component={HotspotSetupSelectionScreen}
        initialParams={{
          gatewayAction: 'addGateway',
        }}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupEducationScreen"
        component={HotspotSetupEducationScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupExternalScreen"
        component={HotspotSetupExternalScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupExternalConfirmScreen"
        component={HotspotSetupExternalConfirmScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupInstructionsScreen"
        component={HotspotSetupInstructionsScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupScanningScreen"
        component={HotspotSetupScanningScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupPickHotspotScreen"
        component={HotspotSetupPickHotspotScreen}
      />
      <HotspotSetupStack.Screen
        name="OnboardingErrorScreen"
        component={OnboardingErrorScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupPickWifiScreen"
        component={HotspotSetupPickWifiScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupWifiScreen"
        component={HotspotSetupWifiScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupWifiConnectingScreen"
        component={HotspotSetupWifiConnectingScreen}
      />
      <HotspotSetupStack.Screen
        name="FirmwareUpdateNeededScreen"
        component={FirmwareUpdateNeededScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupLocationInfoScreen"
        component={HotspotSetupLocationInfoScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupPickLocationScreen"
        component={HotspotSetupPickLocationScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupConfirmLocationScreen"
        component={HotspotSetupConfirmLocationScreen}
      />
      <HotspotSetupStack.Screen
        name="AntennaSetupScreen"
        component={AntennaSetupScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupSkipLocationScreen"
        component={HotspotSetupSkipLocationScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotTxnsProgressScreen"
        component={HotspotTxnsProgressScreen}
        options={{ gestureEnabled: false }}
      />
      <HotspotSetupStack.Screen
        name="NotHotspotOwnerErrorScreen"
        component={NotHotspotOwnerErrorScreen}
      />
      <HotspotSetupStack.Screen
        name="OwnedHotspotErrorScreen"
        component={OwnedHotspotErrorScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotTxnsSubmitScreen"
        component={HotspotTxnsSubmitScreen}
      />
    </HotspotSetupStack.Navigator>
  )
}

export default HotspotSetup
