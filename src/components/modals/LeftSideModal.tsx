import React, { memo, useCallback, useEffect } from 'react'
import { Modal } from 'react-native'
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { ResponsiveValue } from '@shopify/restyle'
import {
  useSafeAreaFrame,
  useSafeAreaInsets,
} from 'react-native-safe-area-context'
import { Icon } from 'react-native-elements'
import Box from '../boxes/Box'
import TouchableOpacityBox from '../boxes/TouchableOpacityBox'
import BlurBox from '../boxes/BlurBox'
import { ReAnimatedBox } from '../boxes/AnimatedBox'
import { Theme } from '../../theme/theme'
import Text from '../texts/Text'
import { useColors } from '../../theme/themeHooks'

type ListItem = {
  label: string
  action: () => void
}

export type IndexedListItem = {
  index: number
  item: ListItem
}

const LeftSideModal = ({
  title,
  children,
  modalVisible,
  handleClose,
  widthRatio,
  backgroundColor,
}: {
  title: string
  children: Element[] | Element
  modalVisible: boolean
  handleClose: () => void
  widthRatio?: number
  backgroundColor?: ResponsiveValue<keyof Theme['colors'], Theme>
}) => {
  const { primaryText } = useColors()
  const { width, height } = useSafeAreaFrame()
  const { top } = useSafeAreaInsets()
  const modalWidth = width * (widthRatio || 0.7)
  const offset = useSharedValue(-modalWidth)
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }],
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

  const close = useCallback(() => {
    if (modalVisible) {
      animate(-modalWidth)
      setTimeout(handleClose, 80)
    }
  }, [animate, handleClose, modalVisible, modalWidth])

  useEffect(() => {
    if (modalVisible) {
      offset.value = -modalWidth
      animate(0)
    }
  }, [animate, modalVisible, modalWidth, offset])

  return (
    <Modal
      transparent
      visible={modalVisible}
      onRequestClose={close}
      animationType="fade"
    >
      <BlurBox
        position="absolute"
        opacity={0.65}
        top={0}
        bottom={0}
        left={0}
        right={0}
      />
      <Box flex={1}>
        <TouchableOpacityBox flex={1} onPress={close} />
        <ReAnimatedBox
          position="absolute"
          top={0}
          left={0}
          bottom={0}
          style={animatedStyles}
          borderBottomRightRadius="l"
          borderTopRightRadius="l"
          width={modalWidth}
          height={height}
          backgroundColor={backgroundColor || 'surface'}
        >
          <Box
            flexDirection="row"
            justifyContent="space-between"
            marginVertical="m"
            paddingHorizontal="m"
            alignItems="center"
            style={{
              paddingTop: top,
            }}
          >
            <Box flex={1}>
              <Text variant="h3">{title}</Text>
            </Box>
            <Box>
              <Icon
                name="menu-open"
                onPress={close}
                size={30}
                color={primaryText}
                tvParallaxProperties={undefined}
              />
            </Box>
          </Box>
          <Box flex={1}>{children}</Box>
        </ReAnimatedBox>
      </Box>
    </Modal>
  )
}

export default memo(LeftSideModal)
