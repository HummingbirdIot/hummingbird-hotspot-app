import React, { memo, ReactText, useMemo } from 'react'
import { Linking, Switch } from 'react-native'
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import Text, { TextProps } from '../texts/Text'
import TouchableOpacityBox from '../boxes/TouchableOpacityBox'
import { useColors } from '../../theme/themeHooks'
import CarotRight from '../../assets/images/carot-right.svg'
import LinkImg from '../../assets/images/link.svg'
import ActionSheet from '../modals/ActionSheetModal'
import { ActionSheetItemType } from '../modals/ActionSheetModalItem'

export type SelectProps = {
  onDonePress?: () => void
  onValueSelect: (value: ReactText, index: number) => void
  items: ActionSheetItemType[]
}

export type SettingListItemType = {
  title: string
  destructive?: boolean
  onPress?: () => void
  onToggle?: (value: boolean) => void
  value?: boolean | string | number
  select?: SelectProps
  openUrl?: string
}

const SettingListItem = ({
  item: { title, value, destructive, onToggle, onPress, select, openUrl },
  isTop = false,
  isBottom = false,
}: {
  item: SettingListItemType
  isTop?: boolean
  isBottom?: boolean
}) => {
  const colors = useColors()
  const colorScheme: ColorSchemeName = useColorScheme()

  const handlePress = () => {
    if (openUrl) {
      Linking.openURL(openUrl)
    }

    if (onPress) {
      onPress()
    }
  }

  const trackColor = useMemo(
    () => ({
      false: colors.secondaryBackground,
      true: colors.primaryBackground,
    }),
    [colors],
  )

  const actionSheetTextProps = useMemo(
    () =>
      ({
        variant: 'body2',
      } as TextProps),
    [],
  )

  const { top } = useSafeAreaInsets()
  const { y, height } = useSafeAreaFrame()

  return (
    <TouchableOpacityBox
      flexDirection="row"
      justifyContent="space-between"
      backgroundColor={
        colorScheme === 'light' ? 'primaryBackground' : 'surface'
      }
      alignItems="center"
      height={48}
      paddingHorizontal="ms"
      marginBottom="xxxs"
      onPress={handlePress}
      disabled={!(onPress || openUrl)}
      borderTopLeftRadius={isTop ? 'm' : 'none'}
      borderTopRightRadius={isTop ? 'm' : 'none'}
      borderBottomLeftRadius={isBottom ? 'm' : 'none'}
      borderBottomRightRadius={isBottom ? 'm' : 'none'}
    >
      <Text
        variant="body2"
        color={destructive ? 'secondaryText' : 'primaryText'}
      >
        {title}
      </Text>
      {!onToggle && !select && onPress && (
        <CarotRight color={colors.secondaryBackground} />
      )}
      {openUrl && <LinkImg />}
      {onToggle && (
        <Switch
          value={value as boolean}
          onValueChange={onToggle}
          trackColor={trackColor}
          thumbColor={colors.white}
        />
      )}
      {select && (
        <ActionSheet
          data={select.items}
          selectedValue={value as string}
          onValueSelected={select.onValueSelect}
          title={title}
          textProps={actionSheetTextProps}
          iconVariant="none"
          maxModalHeight={height - y - top}
        />
      )}
    </TouchableOpacityBox>
  )
}

export default memo(SettingListItem)
