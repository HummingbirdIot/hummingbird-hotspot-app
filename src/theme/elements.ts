import { useTheme } from '@shopify/restyle'
import { Platform } from 'react-native'
import { colors } from 'react-native-elements'
import { Theme } from './theme'

export const useElementsTheme = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const theme = useTheme<Theme>()
  return {
    colors: {
      ...Platform.select({
        default: colors.platform.android,
        ios: colors.platform.ios,
      }),
    },
    Avatar: {
      rounded: true,
      containerStyle: { backgroundColor: '#000' },
      titleStyle: { fontSize: 16 },
    },
    Header: {
      centerComponent: {
        style: {
          fontSize: 20,
          color: '#fff',
        },
      },
    },
    Badge: {
      textStyle: { fontSize: 30 },
    },
    Button: {
      containerStyle: {
        marginTop: 10,
      },
    },
  }
}
