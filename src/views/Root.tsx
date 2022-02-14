import React from 'react'
// import { Text } from 'react-native'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FullTheme, Header, ThemeProps, withTheme } from 'react-native-elements'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const Root = () => {
  // const { theme /* , updateTheme, replaceTheme */ } = props
  const insets = useSafeAreaInsets()
  console.log('Root::SafeAreaInsets:', insets)

  return (
    <>
      <Header
        // leftComponent={{
        //   icon: 'menu',
        //   color: '#fff',
        //   iconStyle: { color: '#fff' },
        // }}
        centerComponent={{ text: 'Hostpots', style: { color: '#fff' } }}
        rightComponent={{ icon: 'add', color: '#fff' }}
      />
    </>
  )
}

export default withTheme(Root, '')
