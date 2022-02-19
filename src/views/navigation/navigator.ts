import React from 'react'
import { NavigationContainerRef } from '@react-navigation/native'
import { LockScreenRequestType } from './naviTypes'
import { AppLink, HotspotLink } from '../../providers/appLinkTypes'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const navigationRef = React.createRef<NavigationContainerRef<any>>()

const lock = (params: {
  requestType: LockScreenRequestType
  scanResult: AppLink
}) => {
  navigationRef.current?.navigate('LockScreen', params)
}

const send = (params: { scanResult: AppLink }) => {
  navigationRef.current?.navigate('Send', params)
}

const viewHotspot = (address: string) => {
  navigationRef.current?.navigate('HotspotsScreen', {
    address,
    resource: 'hotspot',
  })
}

const viewValidator = (address: string) => {
  navigationRef.current?.navigate('HotspotsScreen', {
    address,
    resource: 'validator',
  })
}

const confirmAddGateway = (addGatewayTxn: string) => {
  const params = {
    gatewayAction: 'addGateway',
    addGatewayTxn,
  }

  navigationRef.current?.navigate('HotspotSetup', {
    screen: 'HotspotTxnsConfirmExternalScreen',
    params,
  })
}

const submitGatewayTxns = (params: HotspotLink) => {
  navigationRef.current?.navigate('HotspotSetup', {
    screen: 'HotspotTxnsSubmitScreen',
    params,
  })
}

const submitTransferTxn = (params: HotspotLink) => {
  navigationRef.current?.navigate('TransferHotspot', params)
}

const goToMainTabs = () => {
  navigationRef.current?.navigate('MainTabs')
}

export default {
  lock,
  send,
  viewHotspot,
  viewValidator,
  confirmAddGateway,
  submitGatewayTxns,
  submitTransferTxn,
  goToMainTabs,
}
