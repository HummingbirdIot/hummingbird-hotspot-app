import * as React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { useRoute } from '@react-navigation/native'
import HotspotAssertPickLocationScreen from '../../features/assert/HotspotAssertPickLocationScreen'
import HotspotAssertPickAntennaScreen from '../../features/assert/HotspotAssertPickAntennaScreen'
import HotspotAssertConfirmAntennaScreen from '../../features/assert/HotspotAssertConfirmAntennaScreen'
import HotspotAssertConfirmLocationScreen from '../../features/assert/HotspotAssertConfirmLocationScreen'
import HotspotTxnsProgressScreen from '../../features/txns/HotspotTxnsProgressScreen'
import HotspotTxnsSubmitScreen from '../../features/txns/HotspotTxnsSubmitScreen'
import OnboardingErrorScreen from '../../features/error/OnboardingErrorScreen'
import defaultScreenOptions from '../../defaultScreenOptions'

const HotspotAssertStack = createStackNavigator()

const HotspotAssert = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { params } = useRoute() as any
  return (
    <HotspotAssertStack.Navigator
      headerMode="none"
      screenOptions={{ ...defaultScreenOptions }}
      initialRouteName={
        params.gatewayAction === 'assertAntenna'
          ? 'HotspotAssertPickAntennaScreen'
          : 'HotspotAssertPickLocationScreen'
      }
    >
      <HotspotAssertStack.Screen
        name="HotspotAssertPickLocationScreen"
        component={HotspotAssertPickLocationScreen}
        initialParams={{
          hotspotType: 'HUMMINGBIRD_H500',
          gatewayAction: 'assertLocation',
          ...params,
        }}
      />
      <HotspotAssertStack.Screen
        name="HotspotAssertPickAntennaScreen"
        component={HotspotAssertPickAntennaScreen}
        initialParams={{
          hotspotType: 'HUMMINGBIRD_H500',
          gatewayAction: 'assertLocation',
          ...params,
        }}
      />
      <HotspotAssertStack.Screen
        name="HotspotAssertConfirmAntennaScreen"
        component={HotspotAssertConfirmAntennaScreen}
      />
      <HotspotAssertStack.Screen
        name="HotspotAssertConfirmLocationScreen"
        component={HotspotAssertConfirmLocationScreen}
      />
      <HotspotAssertStack.Screen
        name="HotspotTxnsProgressScreen"
        component={HotspotTxnsProgressScreen}
        options={{ gestureEnabled: false }}
      />
      <HotspotAssertStack.Screen
        name="HotspotTxnsSubmitScreen"
        component={HotspotTxnsSubmitScreen}
      />
      <HotspotAssertStack.Screen
        name="OnboardingErrorScreen"
        component={OnboardingErrorScreen}
      />
    </HotspotAssertStack.Navigator>
  )
}

export default HotspotAssert
