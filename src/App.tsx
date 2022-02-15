import React, { useEffect, useMemo } from 'react'
// import { Platform } from 'react-native'
import { LogBox, Platform, StatusBar } from 'react-native'
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
import { theme, darkThemeColors, lightThemeColors } from './theme/theme'
import SecurityScreen from './views/security/SecurityScreen'

import Root from './views/Root'
import { useAppDispatch } from './store/store'

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

function App() {
  LogBox.ignoreLogs(['new NativeEventEmitter']) // Ignore log notification by message
  LogBox.ignoreAllLogs() // Ignore all log notifications
  const { appState } = useAppState()
  const dispatch = useAppDispatch()

  const colorScheme: ColorSchemeName = useColorScheme()
  console.log('App::ColorSchemeName:', colorScheme)

  useEffect(() => {
    console.log('App::Config:', Config)
    MapboxGL.setAccessToken(Config.MAPBOX_ACCESS_TOKEN)
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
              <Root />
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
