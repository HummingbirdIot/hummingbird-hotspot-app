import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Sum } from '@helium/http'
import Balance, { CurrencyType, NetworkTokens } from '@helium/currency'
// import { getDayOfYear } from 'date-fns'
import {
  getAccountRewards,
  getHotspotRewards,
  // eslint-disable-next-line import/named
  getValidatorRewards,
} from '../../utils/clients/heliumDataClient'
import {
  CacheRecord,
  handleCacheRejected,
  handleCachePending,
  handleCacheFulfilled,
  hasValidCache,
} from '../../utils/cacheUtils'
import { getWalletExt } from '../../utils/clients/walletClient'

export type ChartTimelineValue = number // | 'YTD'
export type RewardsResource = 'accounts' | 'validators' | 'hotspots'

type FetchDetailsParams = {
  address: string
  numDays: ChartTimelineValue
  resource: RewardsResource
}

type GatewayRewardsData = {
  rewardSum?: Balance<NetworkTokens>
  rewards?: Sum[]
  // rewardsChange?: number
}

export type NetworkEarnings = {
  avg_rewards: number
  consensus: number
  hotspot_count: number
  securities: number
  total: number
  date: string
}

export type GatewayChartCache = CacheRecord<GatewayRewardsData>
export type GatewayAddress = string
export type GatewayRewardsRecord = Record<ChartTimelineValue, GatewayChartCache>
export type GatewayIndex<T> = Record<GatewayAddress, T>
export type RewardsData = GatewayIndex<GatewayRewardsRecord>

type RewardsState = {
  earnings: RewardsData
  networkHotspotEarnings: CacheRecord<{ data: NetworkEarnings[] }>
  networkHotspotEarningsLoaded: boolean
}
const initialState: RewardsState = {
  earnings: {},
  networkHotspotEarnings: { lastFetchedTimestamp: 0, loading: false, data: [] },
  networkHotspotEarningsLoaded: false,
}

export const fetchNetworkEarnings = createAsyncThunk<NetworkEarnings[]>(
  'rewards/fetchNetworkEarnings',
  async (_arg, { getState }) => {
    const {
      rewards: { networkHotspotEarnings },
    } = (await getState()) as {
      rewards: RewardsState
    }
    if (hasValidCache(networkHotspotEarnings, 30))
      return networkHotspotEarnings.data

    return getWalletExt('hotspots/earnings')
  },
)

export const fetchRewardsData = createAsyncThunk<
  GatewayRewardsData,
  FetchDetailsParams
>(
  'rewards/fetchRewardsData',
  async ({ address, numDays, resource }: FetchDetailsParams, { getState }) => {
    const currentState = (
      getState() as {
        rewards: {
          earnings: GatewayIndex<GatewayRewardsRecord>
        }
      }
    ).rewards
    const earnings = currentState.earnings[address] || {}
    const details = earnings[numDays]
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
    builder.addCase(fetchRewardsData.pending, (state, action) => {
      const { address, numDays } = action.meta.arg
      if (hasValidCache(state.earnings[address]?.[numDays])) return

      const prevDetails = state.earnings[address] || {}
      const prevState = prevDetails[numDays] || {}
      const nextState = handleCachePending(prevState)
      state.earnings[address] = {
        ...state.earnings[address],
        [numDays]: nextState,
      }
    })
    builder.addCase(fetchRewardsData.fulfilled, (state, action) => {
      const { address, numDays } = action.meta.arg
      if (hasValidCache(state.earnings[address]?.[numDays])) return

      state.earnings[address][numDays] = handleCacheFulfilled(action.payload)
    })
    builder.addCase(fetchRewardsData.rejected, (state, action) => {
      const { address, numDays } = action.meta.arg
      if (hasValidCache(state.earnings[address]?.[numDays])) return

      const prevDetails = state.earnings[address] || {}
      const prevState = prevDetails[numDays] || {}
      const nextState = handleCacheRejected(prevState)
      state.earnings[address] = {
        ...state.earnings[address],
        [numDays]: nextState,
      }
    })
    builder.addCase(fetchNetworkEarnings.pending, (state, _action) => {
      state.networkHotspotEarnings.loading = true
    })
    builder.addCase(fetchNetworkEarnings.fulfilled, (state, action) => {
      state.networkHotspotEarnings = handleCacheFulfilled({
        data: action.payload,
      })
      state.networkHotspotEarningsLoaded = true
    })
    builder.addCase(fetchNetworkEarnings.rejected, (state, _action) => {
      state.networkHotspotEarnings.loading = false
      state.networkHotspotEarningsLoaded = true
    })
  },
})

export default rewardsSlice
