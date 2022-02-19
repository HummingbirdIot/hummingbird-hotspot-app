import { Account } from '@helium/http'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getAccount } from '../../utils/clients/appDataClient'
import { currencyType } from '../../utils/i18n'
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
  signOut,
} from '../../utils/secureAccount'
import { Intervals } from '../../views/main/more/list/useAuthIntervals'
import { Loading } from '../user/txnsTypes'
// import OneSignal from 'react-native-onesignal'

const boolKeys = ['convertHntToCurrency'] as const
type BooleanKey = typeof boolKeys[number]
const stringKeys = ['currencyType'] as const
type StringKey = typeof stringKeys[number]
type SettingsBag = Array<{ key: string; value: string }>

type AccountData = {
  account?: Account
}

export type AppState = {
  account?: Account
  fetchAccountStatus: Loading
  isBackedUp: boolean
  isSettingUpHotspot: boolean
  isRestored: boolean
  isPinRequired: boolean
  authInterval: number
  lastIdle: number | null
  isLocked: boolean
  isRequestingPermission: boolean
  walletLinkToken?: string
  settings: {
    // isFleetModeEnabled?: boolean
    // hasFleetModeAutoEnabled?: boolean
    convertHntToCurrency?: boolean
    // showHiddenHotspots?: boolean
    // hiddenAddresses?: string
    // network?: string
    currencyType?: string
  }
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
  settings: { currencyType },
  fetchAccountStatus: 'idle',
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
      walletLinkToken,
    } as Restore
  },
)

export const fetchAccount = createAsyncThunk<AccountData>(
  'app/fetchAccount',
  async () => {
    const data = await getAccount()
    return {
      account: data,
    }
  },
)

export const updateSetting = createAsyncThunk<
  SettingsBag,
  { key: BooleanKey | StringKey; value: boolean | string }
>('app/updateSetting', async ({ key, value }) => {
  const setting = {
    key,
    value: String(value),
  }
  // return postWallet('accounts/settings', setting)
  return Promise.resolve([setting])
})

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
    builder.addCase(
      updateSetting.pending,
      (
        state,
        {
          meta: {
            arg: { key, value },
          },
        },
      ) => {
        if (boolKeys.includes(key as BooleanKey)) {
          state.settings[key as BooleanKey] = value as boolean
        } else if (stringKeys.includes(key as StringKey)) {
          state.settings[key as StringKey] = value as string
        }
      },
    )
    builder.addCase(fetchAccount.pending, (state, _action) => {
      state.fetchAccountStatus = 'pending'
    })
    builder.addCase(fetchAccount.fulfilled, (state, { payload }) => {
      state.fetchAccountStatus = 'fulfilled'
      state.account = payload.account
    })
    builder.addCase(fetchAccount.rejected, (state, _action) => {
      state.fetchAccountStatus = 'rejected'
    })
  },
})

export default appSlice
