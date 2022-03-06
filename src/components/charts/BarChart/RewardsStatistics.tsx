import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { Sum } from '@helium/http'
import { addMinutes } from 'date-fns'
// import Box from '../../components/Box'

import { useAppDispatch } from '../../../store/store'
import { RootState } from '../../../store/rootReducer'
import {
  fetchRewardsData,
  fetchNetworkEarnings,
  RewardsResource,
} from '../../../store/data/rewardsSlice'
import usePrevious from '../../../utils/hooks/usePrevious'
import RewardsChart from '../StatisticsChart/RewardsChart'

export const getRewardRewardsData = (
  rewardData: Sum[] | undefined,
  numDays: number | undefined,
) => {
  if (!rewardData || !numDays) return []

  return rewardData
    .map((r) => {
      const utcOffset = new Date().getTimezoneOffset()
      const offsetDate = addMinutes(new Date(r.timestamp), utcOffset)
      return {
        up: parseFloat(r.total.toFixed(2)),
        down: 0,
        label: offsetDate.toISOString(),
        showTime: false,
        id: `reward-${r.timestamp}`,
      }
    })
    .reverse()
}

const RewardsStatistics = ({
  address,
  resource,
}: {
  address: string
  resource: RewardsResource
}) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const earnings =
    useSelector((state: RootState) => state.rewards.earnings[address]) || {}

  const [timelineValue, setTimelineValue] = useState(7)
  const [timelineIndex, setTimelineIndex] = useState(2)

  const {
    rewards,
    rewardSum,
    // rewardsChange,
    loading = true,
  } = earnings[timelineValue] || {}
  const rewardRewardsData = useMemo(() => {
    const data = getRewardRewardsData(rewards, timelineValue)
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
        fetchRewardsData({
          address,
          numDays: value,
          resource,
        }),
      )
    },
    [address, dispatch, resource],
  )

  // console.log('Root::rewardRewardsData:', rewardRewardsData)

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

    dispatch(fetchNetworkEarnings())

    dispatch(
      fetchRewardsData({
        address,
        numDays: timelineValue,
        resource,
      }),
    )
  }, [address, dispatch, listIndex, prevListIndex, resource, timelineValue])

  return (
    <RewardsChart
      title={t('hotspot_details.reward_title')}
      number={rewardSum?.floatBalance.toFixed(2)}
      // change={rewardsChange}
      data={rewardRewardsData}
      networkHotspotEarnings={networkHotspotEarnings}
      loading={loading || !networkHotspotEarningsLoaded}
      onTimelineChanged={onTimelineChanged}
      timelineIndex={timelineIndex}
      timelineValue={timelineValue}
    />
  )
}

export default memo(RewardsStatistics)
