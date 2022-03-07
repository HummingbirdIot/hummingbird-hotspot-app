import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { Camera } from 'expo-camera'
import {
  BarCodeScanner,
  BarCodeScannerResult,
  usePermissions,
} from 'expo-barcode-scanner'
import { useDebouncedCallback } from 'use-debounce/lib'
import {
  RootNavigationProp,
  RootStackParamList,
} from '../../navigation/rootNavigationTypes'
import Box from '../../../components/boxes/Box'
import BackScreenContainer from '../../../components/containers/BackScreenContainer'
import Text from '../../../components/texts/Text'

type Route = RouteProp<RootStackParamList, 'ScanQRCode'>
const ScanQRCodeScreen = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation()
  const nav = useNavigation<RootNavigationProp>()
  const {
    params: { pattern, callback },
  } = useRoute<Route>()

  const [perms] = usePermissions({
    request: true,
  })

  const handleBarCodeScanned = useDebouncedCallback(
    (result: BarCodeScannerResult) => {
      console.log('BarCodeScannerResult', result)
      if (typeof pattern === 'function') {
        if (pattern(result.data)) {
          callback(result.data)
          nav.pop()
        }
      } else if (typeof pattern === 'object' && pattern instanceof RegExp) {
        if (pattern.test(result.data)) {
          callback(result.data)
          nav.pop()
        }
      } else {
        callback(result.data)
        nav.pop()
      }
      // try {
      //   handleBarCode(result, 'add_gateway', {
      //     hotspotType: params.hotspotType,
      //   })
      //   triggerNotification('success')
      //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
      // } catch (error: any) {
      //   if (error.message) {
      //     Toast.showWithGravity(error.message, Toast.LONG, Toast.CENTER)
      //   }
      //   triggerNotification('error')
      // }
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
        <Box flex={6}>
          {perms?.granted ? (
            <Box
              marginTop="m"
              borderRadius="xl"
              overflow="hidden"
              width="100%"
              aspectRatio={1}
              backgroundColor="black"
            >
              <Camera
                barCodeScannerSettings={{
                  barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
                }}
                onBarCodeScanned={handleBarCodeScanned.callback}
                ratio="1:1"
                style={StyleSheet.absoluteFill}
              />
            </Box>
          ) : (
            <Text variant="body1">No Perms</Text>
          )}
        </Box>
        <Box flex={4} width="100%" padding="xl" />
      </Box>
    </BackScreenContainer>
  )
}

export default ScanQRCodeScreen
