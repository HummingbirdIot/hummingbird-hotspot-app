import { useSelector } from 'react-redux'
import {
  formatHotspotNameArray,
  truncateAddress,
} from '../../../utils/formatter'
import {
  AddressType,
  B58Address,
  HttpTransaction,
} from '../../../store/txns/txnsTypes'
import { RootState } from '../../../store/rootReducer'

/**
 * 获取两经纬度之间的距离
 * @param {number} e1 点1的东经, 单位:角度, 如果是西经则为负
 * @param {number} n1 点1的北纬, 单位:角度, 如果是南纬则为负
 * @param {number} e2
 * @param {number} n2
 */
export const getDistance = (e1: number, n1: number, e2: number, n2: number) => {
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
export const getDuration = (t: number) => {
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

export const useDescription = (
  address: B58Address,
  txn: HttpTransaction,
  {
    addressType,
    lng,
    lat,
  }: {
    addressType?: AddressType
    lng?: number
    lat?: number
  },
) => {
  const gateways = useSelector(
    (state: RootState) => state.hotspots.hotspotsData,
  )
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hash,
    fee,
    payer,
    payments,
    stakingFee,
    totalAmount,
    challenger,
    challengerLon,
    challengerLat,
    rewards,
    path,
    gateway,
  } = txn
  let description = ''
  let feeOrAmount = ''

  if (rewards && rewards[0]) {
    description = formatHotspotNameArray(
      gateways[rewards[0].gateway]?.hotspot.name || '',
    ).join(' ')
  } else if (gateway) {
    description = formatHotspotNameArray(
      gateways[gateway]?.hotspot.name || '',
    ).join(' ')
  }

  if (payments) {
    let symbol = '+'
    if (payer === address) {
      symbol = '-'
      description = `To @${truncateAddress(payments[0].payee, 16)}`
    } else {
      description = ''
      description = `From @${truncateAddress(payer, 16)}`
    }
    feeOrAmount = `${symbol} ${payments[0].amount}`
  } else if (fee) {
    const symbol = '-'
    // if (payer === address) {
    //   symbol = '-'
    // }
    if (fee.floatBalance) {
      feeOrAmount = `${symbol} ${
        ((stakingFee?.floatBalance || 0) + fee.floatBalance).toString() || '0'
      } DC`
    } else {
      feeOrAmount = `${symbol} ${
        (Number(stakingFee || 0) + fee).toString() || '0'
      } DC`
    }
    // console.log('balance:', feeOrAmount)
  } else if (totalAmount) {
    feeOrAmount = `+ ${totalAmount.floatBalance.toString() || '0'} HNT`
    // console.log('balance:', feeOrAmount)
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
      feeOrAmount = `~ ${dist.toFixed(3)} km`
      // console.log('distance:', feeOrAmount)
    }
  }

  return {
    description,
    feeOrAmount,
  }
}
