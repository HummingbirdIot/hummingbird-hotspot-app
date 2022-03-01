import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import HotspotSetupSelectionScreen from '../../features/setup/HotspotSetupSelectionScreen'
import HotspotSetupEducationScreen from '../../features/setup/HotspotSetupEducationScreen'
import HotspotSetupExternalScreen from '../../features/setup/HotspotSetupExternalScreen'
import HotspotTxnsConfirmExternalScreen from '../../features/txns/HotspotTxnsConfirmExternalScreen'
import HotspotSetupInstructionsScreen from '../../features/setup/HotspotSetupInstructionsScreen'
import HotspotSetupScanningScreen from '../../features/setup/HotspotSetupScanningScreen'
import HotspotSetupPickHotspotScreen from '../../features/setup/HotspotSetupPickHotspotScreen'
import HotspotSetupPickWifiScreen from '../../features/setup/HotspotSetupPickWifiScreen'
import HotspotSetupWifiFormScreen from '../../features/setup/HotspotSetupWifiFormScreen'
import HotspotSetupWifiConnectingScreen from '../../features/setup/HotspotSetupWifiConnectingScreen'
import HotspotSetupEnableLocationScreen from '../../features/setup/HotspotSetupEnableLocationScreen'
import HotspotSetupSkipLocationScreen from '../../features/setup/HotspotSetupSkipLocationScreen'
import HotspotAssertPickLocationScreen from '../../features/assert/HotspotAssertPickLocationScreen'
import HotspotAssertPickAntennaScreen from '../../features/assert/HotspotAssertPickAntennaScreen'
import HotspotAssertConfirmLocationScreen from '../../features/assert/HotspotAssertConfirmLocationScreen'

import FirmwareUpdateNeededScreen from '../../features/others/FirmwareUpdateNeededScreen'

import HotspotTxnsProgressScreen from '../../features/txns/HotspotTxnsProgressScreen'
import HotspotTxnsSubmitScreen from '../../features/txns/HotspotTxnsSubmitScreen'
import HotspotTxnsDemoScreen from '../../features/txns/HotspotTxnsDemoScreen'

import OnboardingErrorScreen from '../../features/error/OnboardingErrorScreen'
import NotHotspotOwnerErrorScreen from '../../features/error/NotHotspotOwnerErrorScreen'
import OwnedHotspotErrorScreen from '../../features/error/OwnedHotspotErrorScreen'

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
        name="HotspotTxnsConfirmExternalScreen"
        component={HotspotTxnsConfirmExternalScreen}
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
        name="HotspotSetupWifiFormScreen"
        component={HotspotSetupWifiFormScreen}
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
        name="HotspotSetupEnableLocationScreen"
        component={HotspotSetupEnableLocationScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotAssertPickLocationScreen"
        component={HotspotAssertPickLocationScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotAssertConfirmLocationScreen"
        component={HotspotAssertConfirmLocationScreen}
      />
      <HotspotSetupStack.Screen
        name="HotspotAssertPickAntennaScreen"
        component={HotspotAssertPickAntennaScreen}
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
      <HotspotSetupStack.Screen
        name="HotspotTxnsDemoScreen"
        component={HotspotTxnsDemoScreen}
      />
    </HotspotSetupStack.Navigator>
  )
}

export default HotspotSetup
