import React, { useMemo } from 'react'
// import { Platform } from 'react-native'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { ThemeProvider, Button, colors } from 'react-native-elements'
import { theme, darkThemeColors, lightThemeColors } from './theme/theme'

import Root from './views/Root'

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
  const colorScheme: ColorSchemeName = useColorScheme()
  console.log('App::ColorSchemeName:', colorScheme)

  const colorAdaptedTheme = useMemo(
    () => ({
      ...theme,
      colors: colorScheme === 'light' ? lightThemeColors : darkThemeColors,
    }),
    [colorScheme],
  )

  return (
    <ThemeProvider theme={colorAdaptedTheme}>
      <SafeAreaProvider>
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
    </ThemeProvider>
  )
}

export default App
