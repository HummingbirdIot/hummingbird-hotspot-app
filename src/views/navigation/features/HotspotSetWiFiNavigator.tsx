import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import HotspotSetupScanningScreen from '../../features/setup/HotspotSetupScanningScreen'
import HotspotSetupPickHotspotScreen from '../../features/setup/HotspotSetupPickHotspotScreen'
import HotspotSetupWifiFormScreen from '../../features/setup/HotspotSetupWifiFormScreen'
import defaultScreenOptions from '../../defaultScreenOptions'
import HotspotSetupWifiConnectingScreen from '../../features/setup/HotspotSetupWifiConnectingScreen'
import HotspotSetupPickWifiScreen from '../../features/setup/HotspotSetupPickWifiScreen'

const HotspotSetupStack = createStackNavigator()

const HotspotAssert = () => {
  return (
    <HotspotSetupStack.Navigator
      headerMode="none"
      screenOptions={{ ...defaultScreenOptions }}
    >
      <HotspotSetupStack.Screen
        name="HotspotSetupScanningScreen"
        component={HotspotSetupScanningScreen}
        initialParams={{
          hotspotType: 'HUMMINGBIRD_H500',
          gatewayAction: 'setWiFi',
        }}
      />
      <HotspotSetupStack.Screen
        name="HotspotSetupPickHotspotScreen"
        component={HotspotSetupPickHotspotScreen}
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
    </HotspotSetupStack.Navigator>
  )
}

export default HotspotAssert
