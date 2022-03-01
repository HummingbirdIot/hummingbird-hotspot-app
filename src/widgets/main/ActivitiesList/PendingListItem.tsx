/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo } from 'react'
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
import { useDescription } from './itemFormatter'

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

const ListItem = ({ activity }: { activity: PendingTransaction }) => {
  const { hash, createdAt, txn, type } = activity
  const icon = getTxnIconPath({ type })
  const color = getTxnTypeColor(type)
  const { description, feeOrAmount } = useDescription('', txn, {})

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
              {getTxnTypeName(activity.type, 'hotspot')}
            </Text>
            {description ? (
              <Text style={{ fontSize: 12, color: 'gray' }}>{description}</Text>
            ) : null}
            {feeOrAmount ? (
              <Text style={{ fontSize: 12, color }}>{feeOrAmount}</Text>
            ) : null}
          </Box>
          <Box flexDirection="column" justifyContent="center">
            <Text style={{ fontSize: 12, color }}>
              {/* {getDuration(new Date(activity.createdAt).getTime())} */}
              待处理
            </Text>
          </Box>
        </Box>
      </ListItemComponent.Content>
    </ListItemComponent>
  )
}

export default memo(ListItem)
