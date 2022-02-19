import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Hotspot } from '@helium/http'
import Box from '../../components/Box'

import { useAppDispatch } from '../../store/store'
import { RootState } from '../../store/rootReducer'
import { getRewardChartData } from '../charts/RewardsHelper'
import {
  fetchChartData,
  fetchNetworkHotspotEarnings,
} from '../../store/rewards/rewardsSlice'
import usePrevious from '../../utils/hooks/usePrevious'
import { fetchHotspotData } from '../../store/hotspotDetails/hotspotDetailsSlice'
import HotspotDetailChart from '../charts/HotspotDetailChart'

const HotspotStatistics = ({ hotspot }: { hotspot: Hotspot }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const { address } = hotspot
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
      <Box flex={2} justifyContent="center" alignItems="center">
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
    </Box>
  )
}

export default memo(HotspotStatistics)
