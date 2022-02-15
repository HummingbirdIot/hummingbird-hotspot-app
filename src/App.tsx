import React, { useEffect, useMemo } from 'react'
// import { Platform } from 'react-native'
import { LogBox, Platform, StatusBar, UIManager } from 'react-native'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import { ThemeProvider } from '@shopify/restyle'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  ThemeProvider as ElementsThemeProvider,
  // Button,
  // colors,
} from 'react-native-elements'
// import { NavigationContainer } from '@react-navigation/native'
import MapboxGL from '@react-native-mapbox-gl/maps'
import Config from 'react-native-config'
import useAppState from 'react-native-appstate-hook'
import {
  HotspotBleProvider,
  OnboardingProvider,
} from '@helium/react-native-sdk'
import * as SplashScreen from 'expo-splash-screen'
import { useSelector } from 'react-redux'
import { useAsync } from 'react-async-hook'
import { NavigationContainer } from '@react-navigation/native'
import { theme, darkThemeColors, lightThemeColors } from './theme/theme'
import SecurityScreen from './views/security/SecurityScreen'
// import Root from './views/Root'
import { useAppDispatch } from './store/store'
import { RootState } from './store/rootReducer'
import appSlice, { restoreAppSettings } from './store/user/appSlice'
import useMount from './utils/useMount'
import { fetchInitialData } from './store/helium/heliumDataSlice'
// import NavigationRoot from './navigation/NavigationRoot'
import { navigationRef } from './navigation/navigator'
import RootView from './views/RootView'

// const theme = {
//   colors: {
//     ...Platform.select({
//       default: colors.platform.android,
//       ios: colors.platform.ios,
//     }),
//   },
//   // Avatar: {
//   //   rounded: true,
//   // },
//   // Badge: {
//   //   textStyle: { fontSize: 30 },
//   // },
//   Button: {
//     containerStyle: {
//       marginTop: 10,
//     },
//   },
// }

// const RaisedButton = (props: any) => <Button raised {...props} />

function appConfig() {
  // 设置安卓动画增强优化特性
  if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true)
    }
  }

  // 设置应忽略的警报信息
  // LogBox.ignoreLogs(['new NativeEventEmitter']) // Ignore log notification by message
  // LogBox.ignoreAllLogs() // Ignore all log notifications
  LogBox.ignoreLogs([
    "Accessing the 'state' property of the 'route' object is not supported.",
    'Setting a timer',
    'Calling getNode() on the ref of an Animated component',
    'Native splash screen is already hidden',
    'No Native splash screen',
    'RCTBridge required dispatch_sync to load',
    'Require cycle',
    'new NativeEventEmitter',
    'EventEmitter.removeListener(',
  ])
}

function App() {
  // 获取当前系统主题信息
  const colorScheme: ColorSchemeName = useColorScheme()
  // console.log('App::ColorSchemeName:', colorScheme)

  appConfig()

  const { appState } = useAppState()
  const dispatch = useAppDispatch()

  const {
    lastIdle,
    isPinRequired,
    authInterval,
    isRestored,
    isBackedUp,
    isRequestingPermission,
    isLocked,
  } = useSelector((state: RootState) => state.app)
  const settingsLoaded = useSelector(
    (state: RootState) => state.account.settingsLoaded,
  )
  const featuresLoaded = useSelector(
    (state: RootState) => state.features.featuresLoaded,
  )

  useMount(() => {
    dispatch(restoreAppSettings())
  })

  // 获取和更新初始信息
  useEffect(() => {
    if (!isBackedUp || !settingsLoaded || !featuresLoaded) return

    dispatch(fetchInitialData())
    // configChainVars() // 当前版本SDK没有对应的接口
  })

  useEffect(() => {
    console.log('App::Config:', Config)
    MapboxGL.setAccessToken(Config.MAPBOX_ACCESS_TOKEN)
  }, [dispatch])

  // 处理应用状态信息
  useEffect(() => {
    if (appState === 'background' && !isLocked) {
      dispatch(appSlice.actions.updateLastIdle())
      return
    }

    const isActive = appState === 'active'
    const now = Date.now()
    const expiration = now - authInterval
    const lastIdleExpired = lastIdle && expiration > lastIdle

    // pin is required and last idle is past user interval, lock the screen
    const shouldLock =
      isActive && isPinRequired && !isRequestingPermission && lastIdleExpired

    if (shouldLock) {
      dispatch(appSlice.actions.lock(true))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState])

  // 启动界面状态管理
  useAsync(async () => {
    if (isRestored) {
      await SplashScreen.hideAsync()
    }
  }, [isRestored])

  useEffect(() => {
    // Hide splash after 5 seconds, deal with the consequences?
    const timeout = setTimeout(() => {
      SplashScreen.hideAsync()
    }, 5000)
    return () => clearInterval(timeout)
  }, [dispatch])

  const colorAdaptedTheme = useMemo(
    () => ({
      ...theme,
      colors: colorScheme === 'light' ? lightThemeColors : darkThemeColors,
    }),
    [colorScheme],
  )

  return (
    <OnboardingProvider baseUrl="https://onboarding.dewi.org/api/v2">
      <HotspotBleProvider>
        <ThemeProvider theme={colorAdaptedTheme}>
          <ElementsThemeProvider>
            <SafeAreaProvider>
              {/* TODO: Will need to adapt status bar for light/dark modes */}
              {Platform.OS === 'ios' && <StatusBar barStyle="light-content" />}
              {Platform.OS === 'android' && (
                <StatusBar translucent backgroundColor="transparent" />
              )}
              <NavigationContainer ref={navigationRef}>
                <RootView />
              </NavigationContainer>

              {/* <SafeAreaView edges={['top', 'right', 'bottom', 'left']}>
          <Button title="My Button" />
          <Button
            title="My 2nd Button"
            containerStyle={{ backgroundColor: 'red' }}
            titleStyle={{ color: 'pink' }}
          />
        </SafeAreaView> */}
            </SafeAreaProvider>
            <SecurityScreen
              visible={appState !== 'active' && appState !== 'unknown'}
            />
          </ElementsThemeProvider>
        </ThemeProvider>
      </HotspotBleProvider>
    </OnboardingProvider>
  )
}

export default App
