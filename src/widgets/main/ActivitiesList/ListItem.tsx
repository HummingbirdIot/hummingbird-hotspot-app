import React, { memo } from 'react'
import { useSelector } from 'react-redux'
import {
  Avatar,
  ListItem as ListItemComponent,
  Text,
} from 'react-native-elements'
import { PendingTransaction } from '@helium/http'
import {
  getTxnIconPath,
  getTxnTypeColor,
  getTxnTypeName,
} from '../../../utils/txns'
import Box from '../../../components/Box'
import { AddressType, HttpTransaction } from '../../../store/txns/txnsTypes'
import { RootState } from '../../../store/rootReducer'
import { formatHotspotName } from '../../../utils/formatter'

/**
 * 获取两经纬度之间的距离
 * @param {number} e1 点1的东经, 单位:角度, 如果是西经则为负
 * @param {number} n1 点1的北纬, 单位:角度, 如果是南纬则为负
 * @param {number} e2
 * @param {number} n2
 */
const getDistance = (e1: number, n1: number, e2: number, n2: number) => {
  const R = 6371

  const { sin, cos, asin, PI, hypot } = Math

  /** 根据经纬度获取点的坐标 */

  const getPoint = (e: number, n: number) => {
    // eslint-disable-next-line no-param-reassign
    e *= PI / 180
    // eslint-disable-next-line no-param-reassign
    n *= PI / 180
    // 这里 R* 被去掉, 相当于先求单位圆上两点的距, 最后会再将这个距离放大 R 倍
    return { x: cos(n) * cos(e), y: cos(n) * sin(e), z: sin(n) }
  }

  const a = getPoint(e1, n1)
  const b = getPoint(e2, n2)
  const c = hypot(a.x - b.x, a.y - b.y, a.z - b.z)
  const r = asin(c / 2) * 2 * R

  return r / 1000
}

const m = 60
const h = m * 60
const d = h * 24
const w = d * 7
const getDuration = (t: number) => {
  const now = Date.now() / 1000
  const past = now - t
  // console.log(past)
  if (past > w) {
    return `${Math.floor(past / w)} w`
  }
  if (past > d) {
    return `${Math.floor(past / d)} d`
  }
  if (past > h) {
    return `${Math.floor(past / h)} h`
  }
  if (past > m) {
    return `${Math.floor(past / m)} m`
  }
  return 'now'
}

const ListItem = ({
  address,
  activity,
  addressType,
  lng,
  lat,
}: {
  address: string
  activity: HttpTransaction & PendingTransaction
  addressType: AddressType
  lng: number | undefined
  lat: number | undefined
}) => {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hash,
    type,
    fee,
    payer,
    stakingFee,
    totalAmount,
    challenger,
    challengerLon,
    challengerLat,
    path,
    stateChannel,
    time,
    gateway,
  } = activity
  const gateways = useSelector((state: RootState) => state.hotspots.hotspotsObj)
  const icon = getTxnIconPath(activity)
  const color = getTxnTypeColor(type)
  let desc = ''
  if (fee) {
    let symbol = '+'
    if (payer === address) {
      symbol = '-'
    }
    desc = `${symbol} ${
      ((stakingFee?.floatBalance || 0) + fee.floatBalance).toString() || '0'
    } DC`
    // console.log('balance:', desc)
  } else if (totalAmount) {
    desc = `+ ${totalAmount.floatBalance.toString() || '0'} HNT`
    // console.log('balance:', desc)
  } else if (
    addressType === 'hotspot' &&
    challenger !== address &&
    challengerLon !== undefined &&
    challengerLat !== undefined
  ) {
    const dist = getDistance(
      challengerLon || 0,
      challengerLat || 0,
      lng || path[0].challengeeLon || 0,
      lat || path[0].challengeeLat || 0,
    )
    if (dist) {
      desc = `~ ${dist.toFixed(3)} km`
      // console.log('distance:', desc)
    }
  } else if (type === 'state_channel_close_v1') {
    // console.log('ActivitiesList::PointedActivity::state_channel_close_v1:', activity)
    // console.log(
    //   'ActivitiesList::PointedActivity::summaries:',
    //   stateChannel.summaries,
    // )
    let numPackets = 0
    let numDcs = 0
    stateChannel.summaries.forEach(
      (summary: { numPackets: number; numDcs: number }) => {
        numPackets += summary.numPackets || 0
        numDcs += summary.numDcs || 0
      },
    )
    desc = `${numPackets} packets | ${numDcs} DC`
  }
  return (
    <ListItemComponent bottomDivider>
      <Avatar
        rounded
        source={{
          uri: icon || '',
          //   Platform.OS === 'ios'
          //     ? icon || ''
          //     : `asset:/icons/activity/${icon}.svg` || '',
        }}
        containerStyle={{
          backgroundColor: 'white',
        }}
      />
      <ListItemComponent.Content>
        <Box flexDirection="row">
          <Box flex={1}>
            <Text style={{ fontSize: 16, fontWeight: '500' }}>
              {getTxnTypeName(type, 'hotspot')}
            </Text>
            {gateway ? (
              <Text style={{ fontSize: 12, color: 'gray' }}>
                {formatHotspotName(gateways[gateway]?.name || '').join(' ')}
              </Text>
            ) : null}
            {desc ? <Text style={{ fontSize: 12, color }}>{desc}</Text> : null}
          </Box>
          <Box flexDirection="column" justifyContent="center">
            <Text style={{ fontSize: 12, color }}>{getDuration(time)}</Text>
          </Box>
        </Box>
      </ListItemComponent.Content>
    </ListItemComponent>
  )
}

export default memo(ListItem)
