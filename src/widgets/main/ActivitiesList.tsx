import React, { memo, useEffect, useState } from 'react'
import { Avatar, ListItem, Text } from 'react-native-elements'
import { useSelector } from 'react-redux'
import { ActivityIndicator } from 'react-native'
import {
  getTxnIconPath,
  getTxnTypeColor,
  getTxnTypeName,
} from '../../utils/txns'
// import { getHotspotActivityList } from '../../utils/clients/appDataClient'
// import useMount from '../../utils/hooks/useMount'
import Box from '../../components/Box'
import { RootState } from '../../store/rootReducer'
import { HttpTransaction } from '../../store/txns/txnsTypes'
import { useAppDispatch } from '../../store/store'
import { fetchMoreTxns, fetchTxnsHead } from '../../store/txns/txnsHelper'

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

const ActivitiesList = ({
  address,
  lng,
  lat,
}: {
  address: string
  lng: number
  lat: number
}) => {
  const state = useSelector((root: RootState) => root.txns.activities)
  const cursor = state[address]?.txns.all.cursor
  const dispatch = useAppDispatch()

  const [activities, setActivitiesList] = useState<Array<HttpTransaction>>(
    state[address]?.txns.all.data || [],
  )

  useEffect(() => {
    // console.log('ActivitiesList::txns.all.data:', state[address]?.txns.all.data)
    if (state[address]?.txns.all.data.length) {
      setActivitiesList(state[address]?.txns.all.data)
    }
  }, [activities.length, address, state])

  useEffect(() => {
    dispatch(fetchTxnsHead({ address }))
      .then(() => {
        if (cursor) {
          dispatch(fetchMoreTxns({ address })).catch((error) =>
            console.error('ActivitiesList::fetchMoreTxns::error:', error),
          )
        }
      })
      .catch((error) =>
        console.error('ActivitiesList::fetchTxnsHead::error:', error),
      )
  }, [address, cursor, dispatch])

  // console.log('ActivitiesList::activities:', activities)
  if (state[address]?.txns.all.status !== 'fulfilled') {
  }

  return (
    <>
      {state[address]?.txns.all.status === 'pending' && (
        <Box justifyContent="center">
          <ActivityIndicator
            color="#687A8C"
            size={activities && activities.length ? 30 : 100}
          />
        </Box>
      )}
      <>
        {activities
          .filter((activity) => activity !== undefined)
          .map((activity) => {
            const icon = getTxnIconPath(activity)
            const color = getTxnTypeColor(activity.type)
            let desc = ''
            if (activity.fee) {
              desc = `- ${
                (
                  (activity?.stakingFee.floatBalance || 0) +
                  activity.fee.floatBalance
                ).toString() || '0'
              } DC`
              // console.log('balance:', desc)
            } else if (activity.totalAmount) {
              desc = `+ ${
                activity.totalAmount.floatBalance.toString() || '0'
              } HNT`
              // console.log('balance:', desc)
            } else if (
              activity.challenger !== address &&
              activity.challengerLon !== undefined &&
              activity.challengerLat !== undefined
            ) {
              const dist = getDistance(
                activity.challengerLon || 0,
                activity.challengerLat || 0,
                lng || 0,
                lat || 0,
                // activity.path[0].challengeeLon || 0,
                // activity.path[0].challengeeLat || 0,
              )
              if (dist) {
                desc = `~ ${dist.toFixed(3)} km`
                // console.log('distance:', desc)
              }
            } else if (activity.type === 'state_channel_close_v1') {
              // console.log('ActivitiesList::PointedActivity::state_channel_close_v1:', activity)
              // console.log(
              //   'ActivitiesList::PointedActivity::summaries:',
              //   activity.stateChannel.summaries,
              // )
              let numPackets = 0
              let numDcs = 0
              activity.stateChannel.summaries.forEach(
                (summary: { numPackets: number; numDcs: number }) => {
                  numPackets += summary.numPackets || 0
                  numDcs += summary.numDcs || 0
                },
              )
              desc = `${numPackets} packets | ${numDcs} DC`
            }
            return (
              <ListItem key={activity.hash} bottomDivider>
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
                <ListItem.Content>
                  <Box flexDirection="row">
                    <Box flex={1}>
                      <Text style={{ fontSize: 16, fontWeight: '500' }}>
                        {getTxnTypeName(activity.type, 'hotspot')}
                      </Text>
                      {desc ? (
                        <Text style={{ fontSize: 12, color }}>{desc}</Text>
                      ) : null}
                    </Box>
                    <Box flexDirection="column" justifyContent="center">
                      <Text style={{ fontSize: 12, color }}>
                        {getDuration(activity.time)}
                      </Text>
                    </Box>
                  </Box>
                </ListItem.Content>
              </ListItem>
            )
          })}
      </>
    </>
  )
}

export default memo(ActivitiesList)
