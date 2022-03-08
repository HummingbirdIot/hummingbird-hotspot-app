import React, { useEffect, useState, memo, useMemo } from 'react'
import { StyleSheet } from 'react-native'
import { useDebouncedCallback } from 'use-debounce/lib'
import { BarCodeScanner } from 'expo-barcode-scanner'
import { BarCodeScanningResult, Camera } from 'expo-camera'
import Box from '../../components/boxes/Box'
import Text from '../../components/texts/Text'

const ScanQRCodeView = ({
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
}

export default memo(ScanQRCodeView)
