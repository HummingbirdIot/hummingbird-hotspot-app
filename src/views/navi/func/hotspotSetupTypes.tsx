import { Hotspot } from '@helium/http'
import { StackNavigationProp } from '@react-navigation/stack'
import { HotspotType } from '../../../makers'

export type HotspotConnectStatus =
  | 'success'
  | 'no_device_found'
  | 'no_services_found'
  | 'invalid_onboarding_address'
  | 'no_onboarding_key'
  | 'service_unavailable'
  | 'details_fetch_failure'

type GatewayAction =
  | 'addGateway'
  | 'assertLocation'
  | 'assertAntenna'
  | 'setWiFi'

export type HotspotSetupStackParamList = {
  HotspotSetupSelectionScreen: { gatewayAction: GatewayAction }
  HotspotSetupEducationScreen: {
    hotspotType: HotspotType
    gatewayAction: GatewayAction
  }
  HotspotSetupExternalScreen: {
    hotspotType: HotspotType
    gatewayAction: GatewayAction
  }
  HotspotSetupExternalConfirmScreen: {
    addGatewayTxn: string
    hotspotType: HotspotType
    gatewayAction: GatewayAction
  }
  HotspotSetupInstructionsScreen: {
    slideIndex: number
    hotspotType: HotspotType
    gatewayAction: GatewayAction
  }
  HotspotSetupScanningScreen: {
    hotspotType: HotspotType
    gatewayAction: GatewayAction
  }
  HotspotSetupPickHotspotScreen: {
    hotspotType: HotspotType
    gatewayAction: GatewayAction
  }
  OnboardingErrorScreen: { connectStatus: HotspotConnectStatus }
  HotspotSetupPickWifiScreen: {
    networks: string[]
    connectedNetworks: string[]
    addGatewayTxn?: string
    hotspotAddress: string
    hotspotType: HotspotType
    gatewayAction: GatewayAction
  }
  FirmwareUpdateNeededScreen: {
    current: boolean
    minVersion: string
    deviceFirmwareVersion: string
  }
  HotspotSetupWifiScreen: {
    network: string
    addGatewayTxn?: string
    hotspotAddress: string
    hotspotType: HotspotType
    gatewayAction: GatewayAction
  }
  HotspotSetupWifiConnectingScreen: {
    network: string
    password: string
    addGatewayTxn?: string
    hotspotAddress: string
    hotspotType: HotspotType
    gatewayAction: GatewayAction
  }
  HotspotSetupLocationInfoScreen: {
    hotspotType: HotspotType
    addGatewayTxn?: string
    hotspotAddress: string
    gatewayAction: GatewayAction
  }
  HotspotSetupPickLocationScreen: {
    hotspotType: HotspotType
    addGatewayTxn?: string
    hotspotAddress: string
    gatewayAction: GatewayAction
    hotspot?: Hotspot
  }
  AntennaSetupScreen: {
    hotspotType: HotspotType
    hotspotAddress: string
    gatewayAction: GatewayAction
    addGatewayTxn?: string
    coords?: number[]
    locationName?: string
    hotspot?: Hotspot
  }
  HotspotSetupConfirmLocationScreen: {
    hotspotAddress: string
    gatewayAction: GatewayAction
    addGatewayTxn?: string
    elevation?: number
    gain?: number
    coords?: number[]
    locationName?: string
    hotspot?: Hotspot
  }
  HotspotSetupConfirmAntennaScreen: {
    hotspotAddress: string
    gatewayAction?: GatewayAction
    addGatewayTxn?: string
    elevation?: number
    gain?: number
    coords?: number[]
    locationName?: string
    hotspot?: Hotspot
  }
  HotspotSetupSkipLocationScreen: {
    addGatewayTxn?: string
    hotspotAddress: string
    elevation?: number
    gain?: number
  }
  HotspotTxnsProgressScreen: {
    addGatewayTxn?: string
    hotspotAddress: string
    elevation?: number
    gain?: number
    coords?: number[]
    locationName?: string
    currentLocation?: string
  }
  NotHotspotOwnerErrorScreen: undefined
  OwnedHotspotErrorScreen: undefined
  HotspotTxnsSubmitScreen: {
    assertTxn?: string
    gatewayTxn?: string
    gatewayAddress?: string
  }
}

export type HotspotSetupNavigationProp =
  StackNavigationProp<HotspotSetupStackParamList>
