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

export type GatewayAction =
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
  HotspotTxnsConfirmExternalScreen: {
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
  HotspotSetupWifiFormScreen: {
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
  HotspotSetupEnableLocationScreen: {
    hotspotType: HotspotType
    addGatewayTxn?: string
    hotspotAddress: string
    gatewayAction: GatewayAction
  }
  HotspotAssertPickLocationScreen: {
    hotspotType: HotspotType
    addGatewayTxn?: string
    hotspotAddress: string
    gatewayAction: GatewayAction
    hotspot?: Hotspot
  }
  HotspotAssertPickAntennaScreen: {
    hotspotType: HotspotType
    hotspotAddress: string
    gatewayAction: GatewayAction
    addGatewayTxn?: string
    coords?: number[]
    locationName?: string
    hotspot?: Hotspot
  }
  HotspotAssertConfirmLocationScreen: {
    hotspotAddress: string
    gatewayAction: GatewayAction
    addGatewayTxn?: string
    elevation?: number
    gain?: number
    coords?: number[]
    locationName?: string
    hotspot?: Hotspot
  }
  HotspotAssertConfirmAntennaScreen: {
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
    gatewayAction?: GatewayAction
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
    cancelled?: number
  }
  HotspotTxnsDemoScreen: {
    action: Exclude<GatewayAction, 'setWiFi'>
  }
}

export type HotspotSetupNavigationProp =
  StackNavigationProp<HotspotSetupStackParamList>
