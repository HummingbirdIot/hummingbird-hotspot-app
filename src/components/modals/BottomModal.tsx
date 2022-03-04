import React, { memo, useCallback, useEffect, useState } from 'react'
import { Modal } from 'react-native'
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { useTranslation } from 'react-i18next'
import { ResponsiveValue } from '@shopify/restyle'
import Close from '../../assets/images/close.svg'
import Text from '../texts/Text'
import Box from '../boxes/Box'
import TouchableOpacityBox from '../boxes/TouchableOpacityBox'
import BlurBox from '../boxes/BlurBox'
import { ReAnimatedBox } from '../boxes/AnimatedBox'
import { useColors } from '../../theme/themeHooks'
import { Theme } from '../../theme/theme'

type ListItem = {
  label: string
  action: () => void
}

export type IndexedListItem = {
  index: number
  item: ListItem
}

const BottomActionsModal = ({
  title,
  children,
  modalVisible,
  handleClose,
  contentHeight,
  footer,
  backgroundColor,
  deviderColor,
}: {
  title: string
  children: Element[] | Element
  footer?: Element
  modalVisible: boolean
  handleClose: () => void
  contentHeight: number
  backgroundColor?: ResponsiveValue<keyof Theme['colors'], Theme>
  deviderColor?: string
}) => {
  const { t } = useTranslation()
  const colors = useColors()
  const [height, setHeight] = useState(0)
  const offset = useSharedValue(0)
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: offset.value + height }],
    }
  })

  const animate = useCallback(
    (val: number) => {
      offset.value = withSpring(val, {
        damping: 80,
        overshootClamping: true,
        restDisplacementThreshold: 0.1,
        restSpeedThreshold: 0.1,
        stiffness: 500,
      })
    },
    [offset],
  )

  useEffect(() => {
    if (modalVisible) {
      offset.value = 0
      animate(-contentHeight)
    }
  }, [animate, modalVisible, offset, contentHeight])

  useEffect(() => {
    setHeight(contentHeight)
    animate(contentHeight)
  }, [animate, contentHeight])

  return (
    <Modal
      transparent
      visible={modalVisible}
      onRequestClose={handleClose}
      animationType="fade"
    >
      <BlurBox position="absolute" top={0} bottom={0} left={0} right={0} />
      <Box flex={1}>
        <TouchableOpacityBox flex={1} onPress={handleClose} />
        <ReAnimatedBox
          style={animatedStyles}
          borderTopLeftRadius="l"
          borderTopRightRadius="l"
          height={height}
          paddingHorizontal="lx"
          backgroundColor={backgroundColor || 'surface'}
        >
          <Box
            flexDirection="row"
            borderBottomWidth={1}
            style={{ borderBottomColor: deviderColor || '#F0F0F5' }}
            marginTop="s"
            marginBottom="m"
            justifyContent="space-between"
            alignItems="center"
          >
            <Text color="surfaceText" variant="body2">
              {t(title)}
            </Text>
            <TouchableOpacityBox
              onPress={handleClose}
              height={50}
              justifyContent="center"
              paddingHorizontal="m"
              marginEnd="n_m"
            >
              <Close color={colors.surfaceText} height={14} width={14} />
            </TouchableOpacityBox>
          </Box>
          {children}
          {footer}
        </ReAnimatedBox>
      </Box>
    </Modal>
  )
}

export default memo(BottomActionsModal)
