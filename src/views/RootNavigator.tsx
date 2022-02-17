import React, { useEffect } from 'react'
import { Platform, Text, View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'

import { useSelector } from 'react-redux'

import changeNavigationBarColor from 'react-native-navigation-bar-color'
import { RootState } from '../store/rootReducer'
import Onboarding from './link/OnboardingNavigator'
import defaultScreenOptions from './defaultScreenOptions'
import { useColors } from '../theme/themeHooks'
import MainTabs from './main/tabs/MainTabs'
// import HotspotsNavigator from './main/hotspots/HotspotsNavigator'
import HotspotDetailScreen from './main/hotspots/HotspotDetailScreen'
import HotspotAssertLocationNavigator from './main/hotspots/HotspotAssertLocationNavigator'
import HotspotSetupNavigator from './main/hotspots/HotspotSetupNavigator'
import HotspotSetWiFiNavigator from './main/hotspots/HotspotSetWiFiNavigator'

const usingSimulator = false

const OnboardingStack = createStackNavigator()
const MainStack = createStackNavigator()
// const MainStack = createNativeStackNavigator()

const DetailsScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Details Screen</Text>
  </View>
)

const RootNavigator = () => {
  const { walletLinkToken } = useSelector((state: RootState) => state.app)
  const colors = useColors()
  // const { surfaceContrast, white } = colors

  useEffect(() => {
    changeNavigationBarColor(colors.primaryBackground, true, false)
  }, [colors.primaryBackground])

  if (!walletLinkToken && !usingSimulator) {
    return (
      <OnboardingStack.Navigator
        headerMode="none"
        screenOptions={defaultScreenOptions}
      >
        <OnboardingStack.Screen
          name="Onboarding"
          component={Onboarding}
          options={{ gestureEnabled: false }}
        />
      </OnboardingStack.Navigator>
    )
  }

  const headerStyles = {
    // headerTitleStyle: {
    //   color: white,
    // },
    // headerStyle: {
    //   backgroundColor: surfaceContrast,
    // },
  }

  return (
    <MainStack.Navigator
      // headerMode="none"
      screenOptions={({ route }) => {
        if (route.name === 'LockScreen')
          // 锁频模式下，禁用掉手势
          return { ...defaultScreenOptions, gestureEnabled: false }

        if (Platform.OS === 'android')
          return { ...defaultScreenOptions, ...headerStyles }
        return headerStyles
      }}
    >
      <MainStack.Screen
        name="MainTabs"
        options={{ headerShown: false }}
        component={MainTabs}
      />
      {/* <MainStack.Screen name="HotspotViews" component={HotspotsNavigator} /> */}
      <MainStack.Group>
        <MainStack.Screen
          name="HotspotDetail"
          options={{ headerShown: false }}
          component={HotspotDetailScreen}
        />
        <MainStack.Screen
          name="HotspotSetup"
          options={{ headerShown: false }}
          component={HotspotSetupNavigator}
        />
        <MainStack.Screen
          name="HotspotAssert"
          options={{ headerShown: false }}
          component={HotspotAssertLocationNavigator}
        />
        <MainStack.Screen
          name="HotspotSetWiFi"
          options={{ headerShown: false }}
          component={HotspotSetWiFiNavigator}
        />
      </MainStack.Group>
      <MainStack.Screen name="LockScreen" component={DetailsScreen} />
    </MainStack.Navigator>
  )
}

export default RootNavigator
