import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Hotspot, Witness } from '@helium/http'
import Balance, { NetworkTokens } from '@helium/currency'
import {
  getHotspotDetails,
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
import { B58Address } from '../txns/txnsTypes'

export type HotspotSyncStatus = 'full' | 'partial'
export type Rewards = Record<string, Array<Balance<NetworkTokens>>>

type HotspotDetail = {
  hotspot: Hotspot
  witnessed: Witness[]
  witnesses?: Witness[]
}
export type HotspotDetailCache = CacheRecord<HotspotDetail>
export type HotspotAddress = string
export type HotspotIndexed<T> = Record<HotspotAddress, T>

export type HotspotsSliceState = {
  hotspots: CacheRecord<{ data: B58Address[] }>
  connectedHotspotId: string
  location?: LocationCoords
  loadingRewards: boolean
  hotspotsLoaded: boolean
  failure: boolean
  syncStatuses: Record<string, CacheRecord<{ status: HotspotSyncStatus }>>
  hotspotsData: HotspotIndexed<HotspotDetailCache>
}

const initialState: HotspotsSliceState = {
  hotspots: { lastFetchedTimestamp: 0, loading: false, data: [] },
  connectedHotspotId: '',
  loadingRewards: false,
  hotspotsLoaded: false,
  failure: false,
  syncStatuses: {},
  hotspotsData: {},
}

export const fetchHotspotDetail = createAsyncThunk<HotspotDetail, string>(
  'hotspots/fetchHotspotDetail',
  async (address: string, { getState }) => {
    const state = (
      (await getState()) as {
        hotspots: HotspotsSliceState
      }
    ).hotspots
    const hotspotsData = state.hotspotsData[address] || {}
    const { hotspot, witnessed } = hotspotsData
    if (hasValidCache(hotspot)) {
      if (witnessed) {
        return {
          hotspot,
          witnesses: [],
          witnessed,
        }
      }
      return {
        hotspot,
        witnesses: [],
        witnessed: await getWitnessedHotspots(address),
      }
    }
    const data = await Promise.all([
      getHotspotDetails(address),
      getWitnessedHotspots(address),
    ])
    return {
      hotspot: data[0],
      witnesses: [],
      witnessed: data[1],
    }
  },
)

// type WalletHotspot = Hotspot & { lat: string; lng: string }
export const fetchHotspotsData = createAsyncThunk(
  'hotspots/fetchHotspotsData',
  async (_arg, { getState }) => {
    const state = ((await getState()) as { hotspots: HotspotsSliceState })
      .hotspots
    if (hasValidCache(state.hotspots) && state.hotspots.data?.length) {
      return {
        data: state.hotspots.data,
      }
    }
    const hotspots = (await getHotspots()) || []
    return {
      hotspots,
      data: hotspots.map((hotspot) => hotspot.address),
    }
  },
)

const hotspotsToObj = (
  hotspots: Hotspot[],
  stored: HotspotIndexed<HotspotDetailCache>,
) =>
  hotspots.reduce((obj, hotspot) => {
    return {
      ...obj,
      [hotspot.address]: handleCacheFulfilled({
        hotspot,
        witnesses: [],
        witnessed: obj[hotspot.address]?.witnessed || undefined,
      }),
    }
  }, stored || {})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hotspotsSliceMigrations: any = {
  0: () => initialState, // migration for hotspots and followedHotspots moving to CacheRecord
}

const hotspotsSlice = createSlice({
  name: 'hotspots',
  initialState,
  reducers: {
    signOut: (state) => {
      const { hotspotsData } = state
      return { ...initialState, hotspotsData }
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
    setConnectedHotspotId: (state, action: PayloadAction<string>) => {
      state.connectedHotspotId = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchHotspotsData.fulfilled, (state, action) => {
      const { hotspots, data } = action.payload
      if (hotspots) {
        state.hotspotsData = hotspotsToObj(
          hotspots || [],
          state.hotspotsData as HotspotIndexed<HotspotDetailCache>,
        )
      }
      state.hotspots = handleCacheFulfilled({ data })
      state.hotspotsLoaded = true
      state.failure = false
    })
    builder.addCase(fetchHotspotsData.rejected, (state, _action) => {
      state.loadingRewards = false
      state.hotspotsLoaded = true
      state.failure = true
    })
    builder.addCase(fetchHotspotDetail.pending, (state, action) => {
      const address = action.meta.arg
      const prevState = state.hotspotsData[address] || {}
      const nextState = handleCachePending(prevState)
      state.hotspotsData[address] = {
        ...state.hotspotsData[address],
        ...nextState,
      }
    })
    builder.addCase(fetchHotspotDetail.fulfilled, (state, action) => {
      const address = action.meta.arg
      state.hotspotsData[address] = handleCacheFulfilled(action.payload)
    })
    builder.addCase(fetchHotspotDetail.rejected, (state, action) => {
      const address = action.meta.arg
      const prevState = state.hotspotsData[address] || {}
      const nextState = handleCacheRejected(prevState)
      state.hotspotsData[address] = {
        ...state.hotspotsData[address],
        ...nextState,
      }
    })
  },
})

export default hotspotsSlice
