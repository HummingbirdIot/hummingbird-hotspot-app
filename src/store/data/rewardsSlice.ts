import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Sum } from '@helium/http'
import Balance, { CurrencyType, NetworkTokens } from '@helium/currency'
// import { getDayOfYear } from 'date-fns'
import {
  getAccountRewards,
  getHotspotRewards,
  // eslint-disable-next-line import/named
  getValidatorRewards,
} from '../../utils/clients/appDataClient'
import {
  CacheRecord,
  handleCacheRejected,
  handleCachePending,
  handleCacheFulfilled,
  hasValidCache,
} from '../../utils/cacheUtils'
import { getWalletExt } from '../../utils/clients/walletClient'

// export type WalletReward = {
//   avg: number
//   gateway: string
//   max: number
//   median: number
//   min: number
//   stddev: number
//   sum: number
//   total: number
//   updated_at: string
// }

export type ChartTimelineValue = number // | 'YTD'
export type RewardsResource = 'accounts' | 'validators' | 'hotspots'

type FetchDetailsParams = {
  address: string
  numDays: ChartTimelineValue
  resource: RewardsResource
}

type GatewayChartData = {
  rewardSum?: Balance<NetworkTokens>
  rewards?: Sum[]
  // rewardsChange?: number
}

export type NetworkHotspotEarnings = {
  avg_rewards: number
  consensus: number
  hotspot_count: number
  securities: number
  total: number
  date: string
}

export type GatewayChartCache = CacheRecord<GatewayChartData>
export type GatewayAddress = string
export type GatewayChartRecord = Record<ChartTimelineValue, GatewayChartCache>
export type GatewayIndex<T> = Record<GatewayAddress, T>

type RewardsState = {
  chartData: GatewayIndex<GatewayChartRecord>
  accountEarnings: CacheRecord<{ data: NetworkHotspotEarnings[] }>
  accountEarningsLoaded: boolean
  networkHotspotEarnings: CacheRecord<{ data: NetworkHotspotEarnings[] }>
  networkHotspotEarningsLoaded: boolean
}
const initialState: RewardsState = {
  chartData: {},
  networkHotspotEarnings: { lastFetchedTimestamp: 0, loading: false, data: [] },
  accountEarnings: { lastFetchedTimestamp: 0, loading: false, data: [] },
  accountEarningsLoaded: false,
  networkHotspotEarningsLoaded: false,
}

export const fetchNetworkHotspotEarnings = createAsyncThunk<
  NetworkHotspotEarnings[]
>('rewards/fetchNetworkHotspotEarnings', async (_arg, { getState }) => {
  const {
    rewards: { networkHotspotEarnings },
  } = (await getState()) as {
    rewards: RewardsState
  }
  if (hasValidCache(networkHotspotEarnings, 30))
    return networkHotspotEarnings.data

  return getWalletExt('hotspots/earnings')
})

export const fetchChartData = createAsyncThunk<
  GatewayChartData,
  FetchDetailsParams
>(
  'rewards/fetchChartData',
  async ({ address, numDays, resource }: FetchDetailsParams, { getState }) => {
    const currentState = (
      getState() as {
        rewards: {
          chartData: GatewayIndex<GatewayChartRecord>
        }
      }
    ).rewards
    const chartData = currentState.chartData[address] || {}
    const details = chartData[numDays]
    if (hasValidCache(details)) {
      return details
    }

    const startDate = new Date()
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() - numDays)
    const [rewards]: [Sum[]] = await Promise.all([
      // eslint-disable-next-line no-nested-ternary
      resource === 'accounts'
        ? getAccountRewards(address, numDays)
        : resource === 'hotspots'
        ? getHotspotRewards(address, numDays)
        : getValidatorRewards(address, numDays),
    ])
    // console.log('rewardsrewardsrewardsrewardsrewardsrewards', rewards)

    // const rewardsChange = 0
    const selectedBalance = Balance.fromFloat(
      rewards.reduce((p, c) => p + c.total, 0),
      CurrencyType.networkToken,
    )

    return {
      rewardSum: selectedBalance,
      rewards,
      // rewardsChange,
    }
  },
)

// This slice contains data related to rewards
const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchChartData.pending, (state, action) => {
      const { address, numDays } = action.meta.arg
      if (hasValidCache(state.chartData[address]?.[numDays])) return

      const prevDetails = state.chartData[address] || {}
      const prevState = prevDetails[numDays] || {}
      const nextState = handleCachePending(prevState)
      state.chartData[address] = {
        ...state.chartData[address],
        [numDays]: nextState,
      }
    })
    builder.addCase(fetchChartData.fulfilled, (state, action) => {
      const { address, numDays } = action.meta.arg
      if (hasValidCache(state.chartData[address]?.[numDays])) return

      state.chartData[address][numDays] = handleCacheFulfilled(action.payload)
    })
    builder.addCase(fetchChartData.rejected, (state, action) => {
      const { address, numDays } = action.meta.arg
      if (hasValidCache(state.chartData[address]?.[numDays])) return

      const prevDetails = state.chartData[address] || {}
      const prevState = prevDetails[numDays] || {}
      const nextState = handleCacheRejected(prevState)
      state.chartData[address] = {
        ...state.chartData[address],
        [numDays]: nextState,
      }
    })
    builder.addCase(fetchNetworkHotspotEarnings.pending, (state, _action) => {
      state.networkHotspotEarnings.loading = true
    })
    builder.addCase(fetchNetworkHotspotEarnings.fulfilled, (state, action) => {
      state.networkHotspotEarnings = handleCacheFulfilled({
        data: action.payload,
      })
      state.networkHotspotEarningsLoaded = true
    })
    builder.addCase(fetchNetworkHotspotEarnings.rejected, (state, _action) => {
      state.networkHotspotEarnings.loading = false
      state.networkHotspotEarningsLoaded = true
    })
  },
})

export default rewardsSlice
