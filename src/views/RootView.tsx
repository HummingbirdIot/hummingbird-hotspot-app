import React, { useEffect } from 'react'
import { Platform, Text, View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
// import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useSelector } from 'react-redux'

import changeNavigationBarColor from 'react-native-navigation-bar-color'
import { RootState } from '../store/rootReducer'
import Onboarding from '../features/onboarding/OnboardingNavigator'
import defaultScreenOptions from './conf/defaultScreenOptions'
import { useColors } from '../theme/themeHooks'
import MainTabs from './main/tabs/MainTabs'

const OnboardingStack = createStackNavigator()
const MainStack = createStackNavigator()
// const MainStack = createNativeStackNavigator()

const HomeScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Home Screen</Text>
  </View>
)

const DetailsScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Details Screen</Text>
  </View>
)

const RootNavigator = () => {
  const insets = useSafeAreaInsets()
  console.log('Root::SafeAreaInsets:', insets)

  const { walletLinkToken } = useSelector((state: RootState) => state.app)
  const colors = useColors()

  useEffect(() => {
    changeNavigationBarColor(colors.primaryBackground, true, false)
  }, [colors.primaryBackground])

  if (!walletLinkToken) {
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

  return (
    <MainStack.Navigator
      headerMode="none"
      screenOptions={({ route }) => {
        if (route.name === 'LockScreen')
          // 锁频模式下，禁用掉手势
          return { ...defaultScreenOptions, gestureEnabled: false }

        if (Platform.OS === 'android') return defaultScreenOptions
        return {}
      }}
    >
      <MainStack.Screen
        name="MainTabs"
        options={{ headerShown: false }}
        component={MainTabs}
      />
      <MainStack.Screen
        name="HotspotSetup"
        options={{ headerShown: false }}
        component={HomeScreen}
      />
      <MainStack.Screen
        name="HotspotAssert"
        options={{ headerShown: false }}
        component={HomeScreen}
      />
      <MainStack.Screen name="LockScreen" component={DetailsScreen} />
    </MainStack.Navigator>
  )
}

export default RootNavigator
