import React, { memo } from 'react'
import { GestureResponderEvent } from 'react-native'
import { Header } from 'react-native-elements'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import { useColors } from '../../theme/themeHooks'
import Box from '../../components/Box'

const DetailViewContainer = ({
  title,
  icon,
  children,
  goBack,
}: {
  title: string
  icon: {
    name: string
    onPress: (event: GestureResponderEvent) => void
  }
  goBack: (event: GestureResponderEvent) => void
  children?: Array<JSX.Element> | JSX.Element
}) => {
  const colorScheme: ColorSchemeName = useColorScheme()
  const { primaryBackground, surfaceContrast } = useColors()
  return (
    <Box flex={1} backgroundColor="primaryBackground">
      <Header
        backgroundColor={
          colorScheme === 'light' ? surfaceContrast : primaryBackground
        }
        containerStyle={{
          borderBottomWidth: 0,
        }}
        centerComponent={{
          text: title,
          // style: { fontSize: 20, color: '#fff' },
        }}
        leftComponent={{
          icon: 'arrow-back-ios',
          color: '#fff',
          onPress: goBack,
        }}
        rightComponent={
          icon
            ? {
                icon: icon.name,
                color: '#fff',
                onPress: icon.onPress,
              }
            : undefined
        }
      />
      <Box flex={1}>{children}</Box>
    </Box>
  )
}

export default memo(DetailViewContainer)
