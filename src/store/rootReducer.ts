import { combineReducers } from '@reduxjs/toolkit'
import { createMigrate, persistReducer } from 'redux-persist'
import AsyncStorage from '@react-native-community/async-storage'
import appSlice from './user/appSlice'
import locationSlice from './location/locationSlice'
import heliumDataSlice from './helium/heliumDataSlice'
import hotspotsSlice, {
  hotspotsSliceMigrations,
} from './hotspots/hotspotsSlice'

const hotspotsConfig = {
  key: hotspotsSlice.name,
  storage: AsyncStorage,
  blacklist: ['rewards'],
  version: 0,
  migrate: createMigrate(hotspotsSliceMigrations, { debug: false }),
}

const rootReducer = combineReducers({
  app: appSlice.reducer,
  location: locationSlice.reducer,
  hotspots: persistReducer(hotspotsConfig, hotspotsSlice.reducer),
  heliumData: heliumDataSlice.reducer,
})

export type RootState = ReturnType<typeof rootReducer>

export default rootReducer
