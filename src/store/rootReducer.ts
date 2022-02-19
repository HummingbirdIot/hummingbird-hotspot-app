import { combineReducers } from '@reduxjs/toolkit'
import { createMigrate, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-community/async-storage'
import appSlice from './app/appSlice'
import locationSlice from './app/locationSlice'
import heliumSlice from './helium/heliumSlice'
import hotspotsSlice, { hotspotsSliceMigrations } from './user/hotspotsSlice'
import rewardsSlice from './user/rewardsSlice'

const config = {
  app: {
    key: appSlice.name,
    storage: AsyncStorage,
    blacklist: [],
  },
}

const hotspotsConfig = {
  key: hotspotsSlice.name,
  storage: AsyncStorage,
  blacklist: ['rewards'],
  version: 0,
  migrate: createMigrate(hotspotsSliceMigrations, { debug: false }),
}

const rootReducer = combineReducers({
  app: persistReducer(config.app, appSlice.reducer),
  hotspots: persistReducer(hotspotsConfig, hotspotsSlice.reducer),

  location: locationSlice.reducer,
  helium: heliumSlice.reducer,
  rewards: rewardsSlice.reducer,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
