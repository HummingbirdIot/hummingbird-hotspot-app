import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BleError, Device } from 'react-native-ble-plx'
import { useHotspotBle, useOnboarding } from '@helium/react-native-sdk'
import { uniq } from 'lodash'
import { useSelector } from 'react-redux'
import Box from '../../components/Box'
import HotspotPairingList from '../../components/HotspotPairingList'
import Text from '../../components/Text'
import {
  HotspotSetupNavigationProp,
  HotspotSetupStackParamList,
} from '../../views/navigation/features/hotspotSetupTypes'
import useAlert from '../../utils/hooks/useAlert'
import hotspotsSlice from '../../store/data/hotspotsSlice'
import { useAppDispatch } from '../../store/store'
import { RootState } from '../../store/rootReducer'

type Route = RouteProp<
  HotspotSetupStackParamList,
  'HotspotSetupPickHotspotScreen'
>
const HotspotSetupBluetoothSuccess = () => {
  const { t } = useTranslation()
  const [connectStatus, setConnectStatus] = useState<boolean>(false)
  const [connectingHotspotId, setConnectingHotspotId] = useState<string>('')

  const {
    params: { hotspotType, gatewayAction },
  } = useRoute<Route>()
  const navigation = useNavigation<HotspotSetupNavigationProp>()
  const {
    scannedDevices,
    connect,
    isConnected,
    checkFirmwareCurrent,
    readWifiNetworks,
    getOnboardingAddress,
    getDiagnosticInfo,
  } = useHotspotBle()

  const { getMinFirmware, getOnboardingRecord } = useOnboarding()
  const { showOKAlert } = useAlert()
  const dispatch = useAppDispatch()
  const {
    hotspots: { connectedHotspotId },
  } = useSelector((state: RootState) => state)

  const handleError = useCallback(
    async (e: unknown) => {
      setConnectStatus(false)
      setConnectingHotspotId('')
      dispatch(hotspotsSlice.actions.setConnectedHotspotId(''))
      const titleKey = 'generic.error'
      if ((e as BleError).toString !== undefined) {
        await showOKAlert({
          titleKey,
          messageKey: (e as BleError).toString(),
        })
      }
    },
    [dispatch, showOKAlert],
  )

  const handleConnect = useCallback(
    async (hotspot: Device) => {
      if (connectingHotspotId) return
      // connectAndConfigHotspot(hotspot)
      setConnectingHotspotId(hotspot.id)
      try {
        const connected = await isConnected()
        if (!connected) {
          await connect(hotspot)
        } else if (hotspot.id !== connectedHotspotId) {
          await connect(hotspot)
        }
        dispatch(hotspotsSlice.actions.setConnectedHotspotId(hotspot.id))
        setConnectStatus(true)
      } catch (e) {
        console.log('HotspotSetupBluetoothSuccess::handleConnect::error:', e)
        handleError(e)
      }
    },
    [
      connectingHotspotId,
      isConnected,
      connectedHotspotId,
      dispatch,
      connect,
      handleError,
    ],
  )

  useEffect(() => {
    const configureHotspot = async () => {
      if (connectStatus !== true) return

      try {
        // check firmware
        const minFirmware = await getMinFirmware()
        if (!minFirmware) return
        const firmwareDetails = await checkFirmwareCurrent(minFirmware)

        if (!firmwareDetails.current) {
          navigation.navigate('FirmwareUpdateNeededScreen', firmwareDetails)
          return
        }

        // scan for wifi networks
        const networks = uniq((await readWifiNetworks(false)) || [])
        const connectedNetworks = uniq((await readWifiNetworks(true)) || [])

        const hotspotAddress = await getOnboardingAddress()

        console.log('networks,', networks, connectedNetworks)
        const onboardingRecord = await getOnboardingRecord(hotspotAddress)
        if (!onboardingRecord) return

        // navigate to next screen
        if (gatewayAction === 'addGateway' || gatewayAction === 'setWiFi') {
          setConnectingHotspotId('')
          navigation.replace('HotspotSetupPickWifiScreen', {
            gatewayAction,
            networks,
            connectedNetworks,
            hotspotAddress,
            hotspotType,
          })
        }
      } catch (e) {
        console.log('HotspotSetupBluetoothSuccess::configureHotspot::error:', e)
        handleError(e)
      }
    }
    configureHotspot()
  }, [
    checkFirmwareCurrent,
    connectStatus,
    gatewayAction,
    getDiagnosticInfo,
    getMinFirmware,
    getOnboardingAddress,
    getOnboardingRecord,
    handleError,
    hotspotType,
    navigation,
    readWifiNetworks,
  ])

  return (
    <Box flex={1}>
      <Box padding="lx" backgroundColor="primaryBackground">
        <Text
          variant="h1"
          numberOfLines={1}
          adjustsFontSizeToFit
          marginBottom="m"
        >
          {t('hotspot_setup.ble_select.hotspots_found', {
            count: scannedDevices?.length,
          })}
        </Text>
        <Text variant="subtitle2">
          {t('hotspot_setup.ble_select.subtitle')}
        </Text>
      </Box>
      <Box
        flex={1}
        paddingHorizontal="lx"
        backgroundColor="secondaryBackground"
      >
        <HotspotPairingList
          hotspots={scannedDevices}
          onPress={handleConnect}
          connect={{ status: connectStatus, hotspotId: connectingHotspotId }}
        />
      </Box>
    </Box>
  )
}

export default HotspotSetupBluetoothSuccess
