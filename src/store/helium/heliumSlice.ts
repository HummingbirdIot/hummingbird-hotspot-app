import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { OraclePrice } from '@helium/http'
import {
  getBlockHeight,
  getBlockStats,
  getCurrentOraclePrice,
  getPredictedOraclePrice,
  getStatCounts,
} from '../../utils/clients/appDataClient'
import { getCurrentPrices } from '../../utils/clients/coinGeckoClient'
import { getMakers, Maker } from '../../utils/clients/stakingClient'

export type HeliumDataState = {
  blockHeight?: number
  currentOraclePrice?: OraclePrice
  predictedOraclePrices: OraclePrice[]
  currentPrices?: Record<string, number>
  makers?: Maker[]
  hotspotCount?: number
  blockTime?: number
}
const initialState: HeliumDataState = {
  predictedOraclePrices: [],
  blockTime: 0,
}

export const fetchBlockHeight = createAsyncThunk<number>(
  'helium/blockHeight',
  async () => getBlockHeight(),
)

export const fetchCurrentOraclePrice = createAsyncThunk<OraclePrice>(
  'helium/currentOraclePrice',
  async () => getCurrentOraclePrice(),
)

export const fetchPredictedOraclePrice = createAsyncThunk<OraclePrice[]>(
  'helium/predictedOraclePrice',
  async () => getPredictedOraclePrice(),
)

export const fetchStats = createAsyncThunk('helium/stats', async () =>
  Promise.all([getStatCounts(), getBlockStats()]),
)

export const fetchInitialData = createAsyncThunk<HeliumDataState>(
  'helium/fetchInitialData',
  async () => {
    const vals = await Promise.all([
      getCurrentOraclePrice(),
      getPredictedOraclePrice(),
      getCurrentPrices(),
      getMakers(),
      getBlockHeight(),
    ])
    console.log('helium/fetchInitialData:', vals)
    const [
      currentOraclePrice,
      predictedOraclePrices,
      currentPrices,
      makers,
      blockHeight,
    ] = vals
    return {
      currentOraclePrice,
      predictedOraclePrices,
      currentPrices,
      makers,
      blockHeight,
    }
  },
)

export const fetchCurrentPrices = createAsyncThunk(
  'helium/fetchCurrentPrices',
  async () => getCurrentPrices(),
)

// This slice contains global helium data not specifically related to the current user
const heliumSlice = createSlice({
  name: 'helium',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchInitialData.fulfilled, (state, { payload }) => {
      state.currentOraclePrice = payload.currentOraclePrice
      state.predictedOraclePrices = payload.predictedOraclePrices
      state.currentPrices = payload.currentPrices
      state.makers = payload.makers
      state.blockHeight = payload.blockHeight
    })
    builder.addCase(fetchBlockHeight.fulfilled, (state, { payload }) => {
      // this is happening on an interval, only update if there's a change
      if (state.blockHeight !== payload) {
        state.blockHeight = payload
      }
    })
    builder.addCase(fetchCurrentOraclePrice.fulfilled, (state, { payload }) => {
      state.currentOraclePrice = payload
    })
    builder.addCase(
      fetchPredictedOraclePrice.fulfilled,
      (state, { payload }) => {
        state.predictedOraclePrices = payload
      },
    )
    builder.addCase(fetchStats.fulfilled, (state, { payload }) => {
      const [statCounts, blockStats] = payload
      state.hotspotCount = statCounts.hotspots
      state.blockTime = blockStats.lastDay.avg
    })
    builder.addCase(fetchCurrentPrices.fulfilled, (state, { payload }) => {
      state.currentPrices = payload
    })
    builder.addCase(fetchCurrentPrices.rejected, (state, error) => {
      console.log('fetchCurrentPrices::error:', error)
    })
  },
})

export default heliumSlice
