import { Hotspot } from '@helium/http'
import { useNavigation } from '@react-navigation/native'
import { useCallback, useEffect } from 'react'
import { Linking, Platform } from 'react-native'
import { useSelector } from 'react-redux'
import { useHotspotBle } from '@helium/react-native-sdk'
import usePermissionManager from './usePermissionManager'
import { RootState } from '../../store/rootReducer'
import { RootNavigationProp } from '../../views/navigation/rootNavigationTypes'
import useAlert from './useAlert'

const useActions = ({
  hotspot,
  locationName,
  setIsVisible,
}: {
  hotspot: Hotspot
  locationName: string
  setIsVisible: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const navigation = useNavigation<RootNavigationProp>()
  const { requestLocationPermission } = usePermissionManager()
  const { permissionResponse, locationBlocked } = useSelector(
    (state: RootState) => state.location,
  )
  const { showOKCancelAlert } = useAlert()
  const { enable, getState } = useHotspotBle()

  useEffect(() => {
    getState()
  }, [getState])

  const checkLocation = useCallback(async () => {
    if (Platform.OS === 'ios') return true

    if (permissionResponse?.granted) {
      return true
    }

    if (!locationBlocked) {
      const response = await requestLocationPermission()
      if (response && response.granted) {
        return true
      }
    } else {
      const decision = await showOKCancelAlert({
        titleKey: 'permissions.location.title',
        messageKey: 'permissions.location.message',
        okKey: 'generic.go_to_settings',
      })
      if (decision) Linking.openSettings()
    }
  }, [
    locationBlocked,
    permissionResponse?.granted,
    requestLocationPermission,
    showOKCancelAlert,
  ])

  const checkBluetooth = useCallback(async () => {
    const state = await getState()

    if (state === 'PoweredOn') {
      return true
    }

    if (Platform.OS === 'ios') {
      if (state === 'PoweredOff') {
        const decision = await showOKCancelAlert({
          titleKey: 'hotspot_setup.pair.alert_ble_off.title',
          messageKey: 'hotspot_setup.pair.alert_ble_off.body',
          okKey: 'generic.go_to_settings',
        })
        if (decision) Linking.openURL('App-Prefs:Bluetooth')
      } else {
        const decision = await showOKCancelAlert({
          titleKey: 'hotspot_setup.pair.alert_ble_off.title',
          messageKey: 'hotspot_setup.pair.alert_ble_off.body',
          okKey: 'generic.go_to_settings',
        })
        if (decision) Linking.openURL('app-settings:')
      }
    }
    if (Platform.OS === 'android') {
      await enable()
      return true
    }
  }, [enable, getState, showOKCancelAlert])

  const assertLocation = useCallback(async () => {
    if (!hotspot) return
    setIsVisible(false)
    await checkLocation()
    navigation.push('HotspotAssert', {
      hotspot,
      hotspotAddress: hotspot.address,
      gatewayAction: 'assertLocation',
      gain: hotspot.gain ? hotspot.gain / 10 : 1.2,
      elevation: hotspot.elevation || 0,
    })
  }, [hotspot, setIsVisible, checkLocation, navigation])

  const assertAntenna = async () => {
    // console.log('HotspotDetailScreen::assertAntenna::hotspot:', hotspot)
    if (hotspot) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { lng, lat, geocode, location } = hotspot
      if (lng && lat) {
        setIsVisible(false)
        await checkLocation()

        navigation.push('HotspotAssert', {
          hotspot,
          hotspotAddress: hotspot.address,
          locationName,
          coords: [lng, lat],
          currentLocation: location,
          gatewayAction: 'assertAntenna',
        })
      } else {
      }
    }
  }

  const setWiFi = async () => {
    if (!hotspot) return
    setIsVisible(false)
    await checkBluetooth()
    navigation.push('HotspotSetWiFi', {
      hotspotAddress: hotspot.address,
      gatewayAction: 'setWiFi',
    })
  }

  return {
    assertLocation,
    assertAntenna,
    setWiFi,
  }
}

export default useActions
