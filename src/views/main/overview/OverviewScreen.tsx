import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import { useTranslation } from 'react-i18next'
import { useAsync } from 'react-async-hook'
import { useSelector } from 'react-redux'
import { Account } from '@helium/http'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getAddress } from '../../../utils/secureAccount'
import { useSpacing } from '../../../theme/themeHooks'
import { Spacing } from '../../../theme/theme'
import Box from '../../../components/Box'

import { useAppDispatch } from '../../../store/store'
import { RootState } from '../../../store/rootReducer'
import { getRewardChartData } from './details/RewardsHelper'
import {
  fetchChartData,
  fetchNetworkHotspotEarnings,
} from '../../../store/rewards/rewardsSlice'
import { getAccount } from '../../../utils/appDataClient'
import usePrevious from '../../../utils/usePrevious'
import { fetchHotspotData } from '../../../store/hotspotDetails/hotspotDetailsSlice'
import HotspotDetailChart from './details/HotspotDetailChart'
import Text from '../../../components/Text'

const QR_CONTAINER_SIZE = 146

const OverviewScreen = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const spacing = useSpacing()
  const padding = useMemo(() => 'm' as Spacing, [])
  const [accountAddress, setAccountAddress] = useState('')
  const [account, setAccount] = useState<Account>()

  console.log('Root::account:', account)

  useEffect(() => {
    getAccount(accountAddress).then(setAccount)
  }, [accountAddress])

  useAsync(async () => {
    const aa = await getAddress()
    // console.log('MyLOG::accountAddress:', typeof account, account)
    setAccountAddress(aa || '')
  }, [])

  const address = '11YPyV6YZQ2MJ3R8dRpUxSWFwwNkYMXHJNkWBhZSccjaCDVgV2e'
  // const address = accountAddress
  const hotspotChartData =
    useSelector((state: RootState) => state.rewards.chartData[address]) || {}
  const [timelineValue, setTimelineValue] = useState(7)
  const [timelineIndex, setTimelineIndex] = useState(2)
  const {
    rewards,
    rewardSum,
    rewardsChange,
    loading = true,
  } = hotspotChartData[timelineValue] || {}
  const rewardChartData = useMemo(() => {
    const data = getRewardChartData(rewards, timelineValue)
    return data || []
  }, [timelineValue, rewards])

  const networkHotspotEarnings = useSelector(
    (state: RootState) => state.rewards.networkHotspotEarnings.data,
  )
  const networkHotspotEarningsLoaded = useSelector(
    (state: RootState) => state.rewards.networkHotspotEarningsLoaded,
  )
  const onTimelineChanged = useCallback(
    (value, index) => {
      setTimelineValue(value)
      setTimelineIndex(index)

      dispatch(
        fetchChartData({
          address,
          numDays: value,
          resource: 'accounts',
        }),
      )
    },
    [address, dispatch],
  )

  // console.log('Root::rewardChartData:', rewardChartData)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [listIndex, setListIndex] = useState(-1)
  const prevListIndex = usePrevious(listIndex)
  // load hotspot data
  useEffect(() => {
    if (
      !address ||
      listIndex === 0 ||
      (listIndex === 1 && prevListIndex === 1) ||
      (listIndex === -1 && prevListIndex === -1)
    ) {
      return
    }
    dispatch(fetchHotspotData(address))
    dispatch(fetchNetworkHotspotEarnings())

    dispatch(
      fetchChartData({
        address,
        numDays: timelineValue,
        resource: 'accounts',
      }),
    )
  }, [address, dispatch, listIndex, prevListIndex, timelineValue])

  return (
    <Box flex={1}>
      <SafeAreaView style={{ flex: 1 }}>
        <Box flex={1} padding="l">
          <Text>address: {accountAddress}</Text>
          <Text>
            balance: {account?.balance?.floatBalance || '0'}{' '}
            {account?.balance?.type.ticker}
          </Text>
          <Text>
            dcBalance: {account?.dcBalance?.floatBalance || 0}{' '}
            {account?.dcBalance?.type.ticker}
          </Text>
          <Text>
            stakedBalance: {account?.stakedBalance?.floatBalance || 0}{' '}
            {account?.stakedBalance?.type.ticker}
          </Text>
          <Text>hotspotCount: {account?.hotspotCount || 0}</Text>
          <Text>validatorCount: {account?.validatorCount || 0}</Text>
        </Box>
        <Box flex={1} flexDirection="row" justifyContent="center">
          <QRCode
            size={QR_CONTAINER_SIZE - 2 * spacing[padding]}
            value={accountAddress}
          />
        </Box>
        <Box flex={2} justifyContent="center" alignItems="center" padding="l">
          <HotspotDetailChart
            title={t('hotspot_details.reward_title')}
            number={rewardSum?.floatBalance.toFixed(2)}
            change={rewardsChange}
            data={rewardChartData}
            networkHotspotEarnings={networkHotspotEarnings}
            loading={loading || !networkHotspotEarningsLoaded}
            onTimelineChanged={onTimelineChanged}
            timelineIndex={timelineIndex}
            timelineValue={timelineValue}
          />
        </Box>
      </SafeAreaView>
    </Box>
  )
}

export default memo(OverviewScreen)
