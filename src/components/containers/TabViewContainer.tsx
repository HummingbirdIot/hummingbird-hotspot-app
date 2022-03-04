import React, { memo, useMemo } from 'react'
import { GestureResponderEvent } from 'react-native'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import { Icon } from 'react-native-elements'
import { Edge } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useColors } from '../../theme/themeHooks'
import SafeAreaBox from '../boxes/SafeAreaBox'
import Box from '../boxes/Box'
import Text from '../texts/Text'

type IconInfo = {
  name: string
  onPress: (event: GestureResponderEvent) => void
}
const TabViewContainer = ({
  title,
  icons,
  children,
}: {
  title: string
  icons?: Array<IconInfo>
  children?: Array<JSX.Element> | JSX.Element
}) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation()
  const colorScheme: ColorSchemeName = useColorScheme()

  const { primaryText } = useColors()

  const edges = useMemo(() => ['left', 'right', 'top'] as Edge[], [])

  return (
    <SafeAreaBox
      backgroundColor={
        colorScheme === 'light' ? 'primaryBackground' : 'surface'
      }
      flex={1}
      edges={edges}
    >
      <Box
        flexDirection="row"
        justifyContent="space-between"
        marginVertical="m"
        paddingHorizontal="l"
      >
        <Box flex={1}>
          <Text variant="h3">{t(title)}</Text>
        </Box>
        <Box flexDirection="row-reverse" justifyContent="flex-end">
          {icons &&
            icons.map((icon) => (
              <Icon
                key={icon.name}
                name={icon.name}
                onPress={icon.onPress}
                size={30}
                color={primaryText}
                tvParallaxProperties={undefined}
              />
            ))}
        </Box>
      </Box>
      <Box
        flex={1}
        backgroundColor={
          colorScheme === 'light' ? 'secondaryBackground' : 'primaryBackground'
        }
      >
        {children}
      </Box>
    </SafeAreaBox>
  )
}

export default memo(TabViewContainer)
