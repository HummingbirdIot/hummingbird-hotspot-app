import React, { memo } from 'react'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import { Icon } from 'react-native-elements'
import { GestureResponderEvent } from 'react-native'
import { useColors } from '../../../theme/themeHooks'
import Box from '../../../components/Box'
import Text from '../../../components/Text'
import TouchableOpacityBox from '../../../components/TouchableOpacityBox'

const DashboardNumberItem = ({
  item,
  value,
  onPress,
}: {
  item: string
  value: string
  onPress?: (event: GestureResponderEvent) => void
}) => {
  const colorScheme: ColorSchemeName = useColorScheme()
  return (
    <Box flex={1} paddingHorizontal="s">
      <TouchableOpacityBox
        height={70}
        backgroundColor={
          colorScheme === 'light' ? 'primaryBackground' : 'surface'
        }
        padding="s"
        borderRadius="s"
        justifyContent="center"
        onPress={onPress}
      >
        <Text color="surfaceText" fontSize={30} textAlign="center">
          {value}
        </Text>
        <Text color="surfaceText" fontSize={11} textAlign="right">
          {item}
        </Text>
      </TouchableOpacityBox>
    </Box>
  )
}

const DashboardIconItem = ({
  name,
  onPress,
}: {
  name: string
  onPress: (event: GestureResponderEvent) => void
}) => {
  const colorScheme: ColorSchemeName = useColorScheme()
  const { surfaceText } = useColors()
  return (
    <Box flex={1} paddingHorizontal="s">
      <TouchableOpacityBox
        width={70}
        height={70}
        backgroundColor={
          colorScheme === 'light' ? 'primaryBackground' : 'surface'
        }
        padding="s"
        borderRadius="s"
        justifyContent="center"
        onPress={onPress}
      >
        <Icon
          name={name}
          color={surfaceText}
          size={30}
          tvParallaxProperties={undefined}
        />
      </TouchableOpacityBox>
    </Box>
  )
}

export default {
  Number: memo(DashboardNumberItem),
  Icon: memo(DashboardIconItem),
}
