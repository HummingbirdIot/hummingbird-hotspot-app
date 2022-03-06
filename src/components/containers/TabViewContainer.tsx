import React, { memo, useCallback, useMemo } from 'react'
import { GestureResponderEvent } from 'react-native'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import { Icon } from 'react-native-elements'
import { Edge } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useColors } from '../../theme/themeHooks'
import SafeAreaBox from '../boxes/SafeAreaBox'
import Box from '../boxes/Box'
import Text from '../texts/Text'
import LeftSideModal from '../modals/LeftSideModal'
import AccountsBar from '../elements/AccountsBar'
import TouchableOpacityBox from '../boxes/TouchableOpacityBox'
import { RootState } from '../../store/rootReducer'
import { useAppDispatch } from '../../store/store'
import viewSlice from '../../store/view/viewSlice'

type IconInfo = {
  name: string
  onPress: (event: GestureResponderEvent) => void
}
const TabViewContainer = ({
  title,
  icons,
  children,
  showAccountSwitch,
}: {
  title: string
  icons?: Array<IconInfo>
  children?: Array<JSX.Element> | JSX.Element
  showAccountSwitch?: boolean
}) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const colorScheme: ColorSchemeName = useColorScheme()
  const { primaryText } = useColors()

  const edges = useMemo(() => ['left', 'right', 'top'] as Edge[], [])

  const { isAccountsBarVisible } = useSelector((state: RootState) => state.view)
  const setModalVisible = useCallback(
    (visible: boolean) =>
      dispatch(viewSlice.actions.setAccountsBarVisible(visible)),
    [dispatch],
  )

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
        alignItems="center"
      >
        {showAccountSwitch && (
          <TouchableOpacityBox
            paddingRight="s"
            paddingVertical="xs"
            onPress={() => setModalVisible(true)}
          >
            <Box
              flex={1}
              borderRightWidth={2}
              borderRightColor="primaryText"
              paddingRight="xs"
            >
              <Icon
                // name="reorder"
                name="menu"
                size={26}
                color={primaryText}
                tvParallaxProperties={undefined}
              />
            </Box>
          </TouchableOpacityBox>
        )}
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
      <LeftSideModal
        title="Accounts"
        modalVisible={isAccountsBarVisible}
        handleClose={() => setModalVisible(false)}
      >
        <AccountsBar />
      </LeftSideModal>
    </SafeAreaBox>
  )
}

export default memo(TabViewContainer)
