import React, { useCallback, useEffect, useState, memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useDebouncedCallback } from 'use-debounce/lib'
import Toast from 'react-native-simple-toast'
import { StyleSheet } from 'react-native'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { BarCodeScanningResult, Camera } from 'expo-camera'
import {
  RootNavigationProp,
  RootStackParamList,
} from '../navigation/rootNavigationTypes'
import Box from '../../components/boxes/Box'
import BackScreenContainer from '../../components/containers/BackScreenContainer'
import Text from '../../components/texts/Text'
import useHaptic from '../../utils/hooks/useHaptic'
import { wp } from '../../utils/layout'

const ScanQRCodeView = memo(
  ({
    handleScanned,
  }: {
    handleScanned: (data: string, type: string) => void
  }) => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null)

    useEffect(() => {
      ;(async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync()
        setHasPermission(status === 'granted')
      })()
    }, [])

    const handleBarCodeScanned = useDebouncedCallback(
      ({ data, type }: BarCodeScanningResult) => {
        console.log('handleBarCodeScanned:', data, type)
        handleScanned(data, type)
      },
    ).callback

    const camera = useMemo(() => {
      return (
        <Camera
          flashMode={Camera.Constants.FlashMode.auto}
          barCodeScannerSettings={{
            barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
          }}
          onBarCodeScanned={handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
          ratio="1:1"
          autoFocus
        />
      )
    }, [handleBarCodeScanned])

    if (hasPermission === null) {
      return (
        <Box flex={1} flexDirection="row" alignItems="center">
          <Text flex={1} color="white" fontSize={11} textAlign="center">
            Requesting for camera permission
          </Text>
        </Box>
      )
    }
    if (hasPermission === false) {
      return (
        <Box flex={1} flexDirection="row" alignItems="center">
          <Text flex={1} color="white" fontSize={14} textAlign="center">
            No access to camera
          </Text>
        </Box>
      )
    }

    return (
      <Box flex={1} flexDirection="column" justifyContent="flex-end">
        {camera}
      </Box>
    )
  },
)

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
