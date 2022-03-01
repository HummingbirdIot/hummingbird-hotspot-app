import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet } from 'react-native'
import { FlatList } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'
import Text from '../../components/Text'
import Box from '../../components/Box'
import TouchableOpacityBox from '../../components/TouchableOpacityBox'
import BottomModal from './BottomModal'

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
  data,
  modalVisible,
  handleClose,
  maxModalHeight,
}: {
  title: string
  data: ListItem[]
  modalVisible: boolean
  handleClose: () => void
  maxModalHeight: number
}) => {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()

  const [sheetHeight, setSheetHeight] = useState(0)

  const renderItem = useCallback(
    ({ index, item: { label, action } }: IndexedListItem) => {
      return (
        <Box key={index} height={50}>
          <Text onPress={action}>{label}</Text>
        </Box>
      )
    },
    [],
  )

  useEffect(() => {
    let nextSheetHeight = data.length * 44 + 156 + (insets?.bottom || 0)
    if (maxModalHeight && nextSheetHeight > maxModalHeight) {
      nextSheetHeight = maxModalHeight
    }
    setSheetHeight(nextSheetHeight)
  }, [data.length, insets?.bottom, maxModalHeight])

  const footer = useMemo(() => {
    return (
      <Box marginBottom="xl">
        <TouchableOpacityBox
          onPress={handleClose}
          style={styles.cancelContainer}
          height={49}
          marginVertical="m"
          alignItems="center"
          justifyContent="center"
          borderRadius="ms"
        >
          <Text variant="body2" fontSize={18} style={styles.cancelText}>
            {t('generic.cancel')}
          </Text>
        </TouchableOpacityBox>
      </Box>
    )
  }, [handleClose, t])

  const keyExtractor = useCallback((_, index) => index, [])

  return (
    <BottomModal
      title={title}
      modalVisible={modalVisible}
      handleClose={handleClose}
      bodyHeight={sheetHeight}
      footer={footer}
    >
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
      />
    </BottomModal>
  )
}

const styles = StyleSheet.create({
  cancelContainer: { backgroundColor: '#F0F0F5' },
  cancelText: { color: '#B3B4D6' },
})

export default memo(BottomActionsModal)
