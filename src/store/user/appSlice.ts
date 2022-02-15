import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
  signOut,
} from '../../utils/secureAccount'
import { Intervals } from '../../features/moreTab/more/useAuthIntervals'
// import OneSignal from 'react-native-onesignal'

export type AppState = {
  isBackedUp: boolean
  isSettingUpHotspot: boolean
  isRestored: boolean
  isPinRequired: boolean
  authInterval: number
  lastIdle: number | null
  isLocked: boolean
  isRequestingPermission: boolean
  walletLinkToken?: string
}
const initialState: AppState = {
  isBackedUp: false,
  isSettingUpHotspot: false,
  isRestored: false,
  isPinRequired: false,
  authInterval: Intervals.IMMEDIATELY,
  lastIdle: null,
  isLocked: false,
  isRequestingPermission: false,
}

type Restore = {
  isBackedUp: boolean
  isPinRequired: boolean
  authInterval: number
  isLocked: boolean
  walletLinkToken?: string
}

export const restoreAppSettings = createAsyncThunk<Restore>(
  'app/restoreAppSettings',
  async () => {
    const [isBackedUp, isPinRequired, authInterval, walletLinkToken, address] =
      await Promise.all([
        getSecureItem('accountBackedUp'),
        getSecureItem('requirePin'),
        getSecureItem('authInterval'),
        getSecureItem('walletLinkToken'),
        getSecureItem('address'),
      ])
    if (isBackedUp && address) {
      // 推送
      console.log('OneSignal.sendTags:', { address })
      // OneSignal.sendTags({ address })
      // Logger.setUser(address)
    }
    return {
      isBackedUp,
      isPinRequired,
      authInterval: authInterval
        ? parseInt(authInterval, 10)
        : Intervals.IMMEDIATELY,
      isLocked: isPinRequired,
      walletLinkToken:
        walletLinkToken ||
        'eyJ0aW1lIjoxNjQ0Mzg4ODMyLCJhZGRyZXNzIjoiMTN1TTdndFZ4UFI1N1AzdWU5azVtS2ZlWURmZmZlc1o4b25naURBZGtFTHlXODN6bkJlIiwicmVxdWVzdEFwcElkIjoib3JnLm1ha2VyLmh1bW1pbmdiaXJkIiwic2lnbmluZ0FwcElkIjoiY29tLmhlbGl1bS5tb2JpbGUud2FsbGV0IiwiY2FsbGJhY2tVcmwiOiJodW1taW5nYmlyZHNjaGVtZTovLyIsImFwcE5hbWUiOiJIdW1taW5nYmlyZCIsInNpZ25hdHVyZSI6IjRHKzNKWGY0OVZYMlpCT2V1QWJYS0RZMW1jeGJwenV6OWJQdWV5NVk0VFRDSGFoeWtIU0xnRVNoRG5jeE1JRCtiOHY3NFdvK2NmbnpEZlFjTUgyM0JRPT0ifQ==',
    } as Restore
  },
)

// This slice contains data related to the state of the app
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    backupAccount: (state, action: PayloadAction<string>) => {
      setSecureItem('requirePin', true)
      setSecureItem('userPin', action.payload)
      state.isPinRequired = true
    },
    startHotspotSetup: (state) => {
      state.isSettingUpHotspot = false
    },
    signOut: () => {
      signOut()
      return { ...initialState, isRestored: true }
    },
    updateAuthInterval: (state, action: PayloadAction<number>) => {
      state.authInterval = action.payload
      setSecureItem('authInterval', action.payload.toString())
    },
    disablePin: (state) => {
      deleteSecureItem('requirePin')
      deleteSecureItem('userPin')
      state.isPinRequired = false
    },
    updateLastIdle: (state) => {
      state.lastIdle = Date.now()
    },
    storeWalletLinkToken: (
      state,
      { payload: token }: PayloadAction<string>,
    ) => {
      state.walletLinkToken = token
      setSecureItem('walletLinkToken', token)
    },
    lock: (state, action: PayloadAction<boolean>) => {
      state.isLocked = action.payload
      if (!state.isLocked) {
        state.lastIdle = null
      }
    },
    requestingPermission: (state, action: PayloadAction<boolean>) => {
      state.isRequestingPermission = action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(restoreAppSettings.fulfilled, (state, { payload }) => {
      return { ...state, ...payload, isRestored: true }
    })
  },
})

export default appSlice
