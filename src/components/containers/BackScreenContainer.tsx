/* eslint-disable react/jsx-props-no-spreading */
import { useNavigation } from '@react-navigation/native'
import { BoxProps } from '@shopify/restyle'
import React, { memo } from 'react'
import { Edge } from 'react-native-safe-area-context'
import { Spacing, Theme } from '../../theme/theme'
import BackButton from '../buttons/BackButton'
import Box from '../boxes/Box'
import CloseButton from '../buttons/CloseButton'
import SafeAreaBox from '../boxes/SafeAreaBox'

type Props = BoxProps<Theme> & {
  children?: React.ReactNode
  edges?: Edge[]
  onClose?: () => void
  hideBack?: boolean
  headerHorizontalPadding?: Spacing
}

const BackScreenContainer = ({
  backgroundColor,
  children,
  flex,
  padding,
  edges,
  onClose,
  hideBack,
  headerHorizontalPadding = 'lx',
  ...rest
}: Props) => {
  const navigation = useNavigation()
  return (
    <SafeAreaBox
      edges={edges || undefined}
      backgroundColor={backgroundColor || 'primaryBackground'}
      flex={1}
    >
      <Box flexDirection="row" paddingHorizontal={headerHorizontalPadding}>
        {!hideBack && (
          <BackButton marginHorizontal="n_lx" onPress={navigation.goBack} />
        )}
        <Box flex={1} />
        {onClose && (
          <CloseButton
            paddingHorizontal="lx"
            marginEnd="n_lx"
            onPress={onClose}
          />
        )}
      </Box>
      <Box padding={padding || 'lx'} flex={flex || 1} {...rest}>
        {children}
      </Box>
    </SafeAreaBox>
  )
}

export default memo(BackScreenContainer)
