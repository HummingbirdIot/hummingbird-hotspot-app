import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { Hotspot, Witness } from '@helium/http'
import Balance, { NetworkTokens } from '@helium/currency'
import {
  getHotspotDetails,
  getHotspotRewards,
  getHotspots,
  getWitnessedHotspots,
} from '../../utils/clients/appDataClient'
import { LocationCoords } from '../../utils/location'
import {
  CacheRecord,
  handleCacheFulfilled,
  handleCachePending,
  handleCacheRejected,
  hasValidCache,
} from '../../utils/cacheUtils'
import { HotspotSyncStatus } from '../../views/main/hotspots/hotspotTypes'

export type Rewards = Record<string, Array<Balance<NetworkTokens>>>

type HotspotData = {
  witnesses?: Witness[]
  hotspot?: Hotspot
}
export type HotspotDetailCache = CacheRecord<HotspotData>
export type HotspotAddress = string
export type HotspotIndexed<T> = Record<HotspotAddress, T>

export type HotspotsSliceState = {
  hotspots: CacheRecord<{ data: Hotspot[] }>
  hotspotsObj: Record<string, Hotspot>
  location?: LocationCoords
  loadingRewards: boolean
  hotspotsLoaded: boolean
  failure: boolean
  syncStatuses: Record<string, CacheRecord<{ status: HotspotSyncStatus }>>
  rewards: Rewards
  hotspotData: HotspotIndexed<HotspotDetailCache>
  hotspotAddr: HotspotAddress
}

const initialState: HotspotsSliceState = {
  hotspots: { lastFetchedTimestamp: 0, loading: false, data: [] },
  hotspotsObj: {},
  loadingRewards: false,
  hotspotsLoaded: false,
  failure: false,
  syncStatuses: {},
  rewards: {},
  hotspotData: {},
  hotspotAddr: '',
}

export const fetchRewards = createAsyncThunk<
  Rewards,
  { address: string; numDays: number }
>('hotspots/fetchRewards', async ({ address, numDays = 1 }, { getState }) => {
  const state = ((await getState()) as { hotspots: HotspotsSliceState })
    .hotspots
  if (hasValidCache(state.rewards[address])) {
    return {
      [address]: state.rewards[address],
    }
  }
  const rewards = await getHotspotRewards(address, numDays)
  return {
    [address]: handleCacheFulfilled(
      rewards.map((reward) => reward.balanceTotal),
    ),
  }
})

export const fetchHotspotData = createAsyncThunk<HotspotData, string>(
  'hotspots/fetchHotspotData',
  async (address: string, { getState }) => {
    const state = (
      (await getState()) as {
        hotspots: HotspotsSliceState
      }
    ).hotspots
    const hotspotData = state.hotspotData[address] || {}
    if (hasValidCache(hotspotData)) {
      return hotspotData
    }

    const hotspot = state.hotspotsObj[address] || {}
    if (hasValidCache(hotspot)) {
      const witnesses = await getWitnessedHotspots(address)
      return {
        hotspot,
        witnesses,
      }
    }
    const data = await Promise.all([
      getHotspotDetails(address),
      getWitnessedHotspots(address),
    ])
    return {
      hotspot: data[0],
      witnesses: data[1],
    }
  },
)

// type WalletHotspot = Hotspot & { lat: string; lng: string }
export const fetchHotspotsData = createAsyncThunk(
  'hotspots/fetchHotspotsData',
  async (_arg, { getState }) => {
    const state = ((await getState()) as { hotspots: HotspotsSliceState })
      .hotspots
    if (hasValidCache(state.hotspots)) {
      return {
        hotspots: state.hotspots.data,
      }
    }

    return {
      hotspots: await getHotspots(),
    }
  },
)

const hotspotsToObj = (hotspots: Hotspot[]) =>
  hotspots.reduce((obj, hotspot) => {
    return {
      ...obj,
      [hotspot.address]: handleCacheFulfilled(hotspot),
    }
  }, {})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hotspotsSliceMigrations: any = {
  0: () => initialState, // migration for hotspots and followedHotspots moving to CacheRecord
}

const hotspotsSlice = createSlice({
  name: 'hotspots',
  initialState,
  reducers: {
    signOut: () => {
      return { ...initialState }
    },
    updateSyncStatus: (
      state,
      {
        payload: { address, status },
      }: { payload: { address: string; status: HotspotSyncStatus } },
    ) => {
      state.syncStatuses[address] = handleCacheFulfilled({
        status,
      })
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchHotspotsData.fulfilled, (state, action) => {
      const hotspots = action.payload.hotspots || []
      state.hotspotsObj = hotspotsToObj(hotspots)
      state.hotspots = handleCacheFulfilled({
        data: hotspots,
      })
      state.hotspotsLoaded = true
      state.failure = false
    })
    builder.addCase(fetchHotspotsData.rejected, (state, _action) => {
      state.loadingRewards = false
      state.hotspotsLoaded = true
      state.failure = true
    })
    builder.addCase(fetchRewards.rejected, (state, _action) => {
      state.loadingRewards = false
    })
    builder.addCase(fetchRewards.pending, (state, _action) => {
      state.loadingRewards = true
    })
    builder.addCase(fetchRewards.fulfilled, (state, action) => {
      state.rewards = {
        ...state.rewards,
        ...action.payload,
      }
      state.loadingRewards = false
    })
    builder.addCase(fetchHotspotData.pending, (state, action) => {
      const address = action.meta.arg
      const prevState = state.hotspotData[address] || {}
      const nextState = handleCachePending(prevState)
      state.hotspotData[address] = {
        ...state.hotspotData[address],
        ...nextState,
      }
    })
    builder.addCase(fetchHotspotData.fulfilled, (state, action) => {
      const address = action.meta.arg
      state.hotspotData[address] = handleCacheFulfilled(action.payload)
    })
    builder.addCase(fetchHotspotData.rejected, (state, action) => {
      const address = action.meta.arg
      const prevState = state.hotspotData[address] || {}
      const nextState = handleCacheRejected(prevState)
      state.hotspotData[address] = {
        ...state.hotspotData[address],
        ...nextState,
      }
    })
  },
})

export default hotspotsSlice
