import React, { useCallback, useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useHotspotBle } from '@helium/react-native-sdk'
import BackScreenContainer from '../../../components/containers/BackScreenContainer'
import HotspotSetupBluetoothError from '../../../components/ble/HotspotSetupBluetoothError'
import HotspotSetupBluetoothSuccess from '../../../components/ble/HotspotSetupBluetoothSuccess'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'

const HotspotSetupPickHotspotScreen = () => {
  const { scannedDevices } = useHotspotBle()
  const rootNav = useNavigation<RootNavigationProp>()
  const handleClose = useCallback(() => rootNav.navigate('MainTabs'), [rootNav])

  const hotspotsFound = useMemo(
    () => !!scannedDevices.length,
    [scannedDevices.length],
  )

  if (hotspotsFound) {
    return (
      <BackScreenContainer
        backgroundColor="primaryBackground"
        padding="none"
        onClose={handleClose}
      >
        <HotspotSetupBluetoothSuccess />
      </BackScreenContainer>
    )
  }

  return (
    <BackScreenContainer
      backgroundColor="primaryBackground"
      onClose={handleClose}
    >
      <HotspotSetupBluetoothError />
    </BackScreenContainer>
  )
}

export default HotspotSetupPickHotspotScreen
