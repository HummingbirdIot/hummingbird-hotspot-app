import { combineReducers } from '@reduxjs/toolkit'
import { persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-community/async-storage'
import appSlice from './app/appSlice'
import locationSlice from './app/locationSlice'
import hntSlice from './hnt/hntSlice'
import hotspotsSlice from './data/hotspotsSlice'
import rewardsSlice from './data/rewardsSlice'
import txnsSlice from './txns/txnsSlice'

const config = {
  app: {
    key: appSlice.name,
    storage: AsyncStorage,
    blacklist: [],
  },
  // hotspots: {
  //   key: hotspotsSlice.name,
  //   storage: AsyncStorage,
  //   blacklist: [
  //     'hotspotsObj',
  //     'loadingRewards',
  //     'hotspotsLoaded',
  //     'failure',
  //     'syncStatuses',
  //     'rewards',
  //     'failure',
  //   ],
  //   version: 0,
  //   migrate: createMigrate(hotspotsSliceMigrations, { debug: false }),
  // },
}

const rootReducer = combineReducers({
  app: persistReducer(config.app, appSlice.reducer),
  location: locationSlice.reducer,
  // hotspots: persistReducer(config.hotspots, hotspotsSlice.reducer),
  hotspots: hotspotsSlice.reducer,
  rewards: rewardsSlice.reducer,
  hnt: hntSlice.reducer,
  txns: txnsSlice.reducer,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
