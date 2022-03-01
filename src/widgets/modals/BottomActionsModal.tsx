import React, { memo, useEffect, useMemo, useState } from 'react'
import { StyleSheet } from 'react-native'
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

  useEffect(() => {
    let nextSheetHeight = data.length * 70 + 156 + (insets?.bottom || 0)
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

  return (
    <BottomModal
      title={title}
      modalVisible={modalVisible}
      handleClose={handleClose}
      contentHeight={sheetHeight}
      footer={footer}
    >
      <Box>
        {data.map((item, index) => {
          const { label, action } = item
          return (
            <Box
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              height={60}
              backgroundColor="primaryBackground"
              borderBottomWidth={10}
              borderBottomColor="surface"
              borderRadius="m"
              justifyContent="center"
            >
              <Text variant="body2" textAlign="center" onPress={action}>
                {label}
              </Text>
            </Box>
          )
        })}
      </Box>
    </BottomModal>
  )
}

const styles = StyleSheet.create({
  cancelContainer: { backgroundColor: '#F0F0F5' },
  cancelText: { color: '#B3B4D6' },
})

export default memo(BottomActionsModal)
