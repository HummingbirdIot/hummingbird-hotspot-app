import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useDebouncedCallback } from 'use-debounce/lib'
import Toast from 'react-native-simple-toast'
import {
  RootNavigationProp,
  RootStackParamList,
} from '../navigation/rootNavigationTypes'
import Box from '../../components/boxes/Box'
import BackScreenContainer from '../../components/containers/BackScreenContainer'
import Text from '../../components/texts/Text'
import useHaptic from '../../utils/hooks/useHaptic'
import ScanQRCodeView from './ScanQRCodeView'
import { wp } from '../../utils/layout'

type Route = RouteProp<RootStackParamList, 'ScanQRCode'>
const ScanQRCodeScreen = () => {
  const { t } = useTranslation()
  const nav = useNavigation<RootNavigationProp>()
  const {
    params: { title, pattern, callback },
  } = useRoute<Route>()
  const [scanned, setScanned] = useState(false)

  const { triggerNotification } = useHaptic()

  const handleBarCodeScanned = useDebouncedCallback(
    (data: string, type: string) => {
      if (scanned) return
      console.log(
        `Bar code with type ${type} and data ${data} has been scanned!`,
      )
      try {
        if (typeof pattern === 'function') {
          if (pattern(data)) {
            setScanned(true)
            callback(data)
            nav.pop()
          }
        } else if (typeof pattern === 'object' && pattern instanceof RegExp) {
          if (pattern.test(data)) {
            setScanned(true)
            callback(data)
            nav.pop()
          }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        if (error.message) {
          Toast.showWithGravity(error.message, Toast.LONG, Toast.CENTER)
        }
        triggerNotification('error')
      }
    },
    1000,
    { leading: true, trailing: false },
  )

  const handleClose = useCallback(() => {
    nav.pop()
  }, [nav])

  return (
    <BackScreenContainer
      flex={1}
      backgroundColor="primaryBackground"
      padding="xl"
      onClose={handleClose}
    >
      <Box flex={1} alignItems="center">
        <Box flex={2} alignItems="center" justifyContent="center">
          <Text variant="h4" textAlign="center">
            {title || t('Scan QRCode')}
          </Text>
        </Box>
        <Box flex={16} justifyContent="center">
          <Box
            flex={1}
            aspectRatio={1}
            backgroundColor="black"
            borderColor="secondaryBackground"
            borderWidth={3}
            borderRadius="xl"
            overflow="hidden"
            maxWidth={wp(70)}
            maxHeight={wp(70)}
          >
            <ScanQRCodeView handleScanned={handleBarCodeScanned.callback} />
          </Box>
        </Box>
        <Box flex={2} padding="xl" />
      </Box>
    </BackScreenContainer>
  )
}

export default ScanQRCodeScreen
