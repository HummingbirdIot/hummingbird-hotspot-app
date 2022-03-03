import { Account } from '@helium/http'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getAccount } from '../../utils/clients/appDataClient'
import { currencyType } from '../../utils/i18n'
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
  signOut,
} from './secureData'
import { Intervals } from '../../utils/hooks/useAuthIntervals'
import { Loading } from '../txns/txnsTypes'
import addressMap from './addressMap'
// import OneSignal from 'react-native-onesignal'

const boolKeys = ['isPinRequired'] as const
type BooleanKey = typeof boolKeys[number]
const stringKeys = ['currencyType'] as const
type StringKey = typeof stringKeys[number]
type SettingsBag = Array<{ key: string; value: string }>

type AccountData = {
  account?: Account
}

export type AppState = {
  isBackedUp: boolean
  isRestored: boolean
  lastIdle: number | null
  isLocked: boolean
  isSettingUpHotspot: boolean
  isRequestingPermission: boolean
  user: {
    isWatcher: boolean
    xpCode?: string
    walletLinkToken?: string
    account?: Account
    fetchAccountStatus: Loading
    lastHNTBlance: string
    lastFiatBlance: string
  }
  settings: {
    isPinRequired: boolean
    authInterval: number
    network?: string
    // language?: string
    currencyType?: string
  }
}
const initialState: AppState = {
  isBackedUp: false,
  isSettingUpHotspot: false,
  isRestored: false,
  lastIdle: null,
  isLocked: false,
  isRequestingPermission: false,
  user: {
    isWatcher: false,
    fetchAccountStatus: 'idle',
    lastHNTBlance: '0.00000',
    lastFiatBlance: '0.00',
  },
  settings: {
    isPinRequired: false,
    authInterval: Intervals.IMMEDIATELY,
    currencyType,
  },
}

type Restore = {
  isBackedUp: boolean
  isLocked: boolean
  user: {
    isWatcher: boolean
    xpCode?: string
    walletLinkToken?: string
    account?: Account
    fetchAccountStatus: Loading
    lastHNTBlance: string
    lastFiatBlance: string
  }
  settings: {
    isPinRequired: boolean
    authInterval: number
    // language?: string
    currencyType?: string
  }
}

export const restoreAppSettings = createAsyncThunk<Restore>(
  'app/restoreAppSettings',
  async () => {
    console.log('restoreAppSettings A:', await getSecureItem('user.isWatcher'))
    const [
      isBackedUp,
      isWatcher,
      explorationCode,
      walletLinkToken,
      address,
      lastHNTBlance,
      lastFiatBlance,

      isPinRequired,
      authInterval,
      // language,
      currency,
    ] = await Promise.all([
      getSecureItem('isBackedUp'),
      getSecureItem('user.isWatcher'),
      getSecureItem('user.explorationCode'),
      getSecureItem('user.walletLinkToken'),
      getSecureItem('user.address'),
      getSecureItem('user.lastHNTBlance'),
      getSecureItem('user.lastFiatBlance'),

      getSecureItem('settings.isPinRequired'),
      getSecureItem('settings.authInterval'),
      // getSecureItem('settings.language'),
      getSecureItem('settings.currencyType'),
    ])

    console.log(
      'restoreAppSettings B:',
      isBackedUp,
      isWatcher,
      explorationCode,
      walletLinkToken,
      address,
      lastHNTBlance,
      lastFiatBlance,
    )

    if (isBackedUp && address) {
      // 推送
      console.log('OneSignal.sendTags:', { address })
      // OneSignal.sendTags({ address })
      // Logger.setUser(address)
    }
    return {
      isLocked: !!isPinRequired,
      user: {
        fetchAccountStatus: 'idle',
        isWatcher,
        explorationCode,
        walletLinkToken,
        lastHNTBlance: lastHNTBlance || '0.00000',
        lastFiatBlance: lastFiatBlance || '0.00',
      },
      settings: {
        isPinRequired: !!isPinRequired,
        authInterval: authInterval
          ? parseInt(authInterval, 10)
          : Intervals.IMMEDIATELY,
        // language,
        currencyType: currency || currencyType,
      },
    } as unknown as Restore
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
  setSecureItem(`settings.${key}`, value)
  return Promise.resolve([setting])
})

// This slice contains data related to the state of the app
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    enableWatchMode: (state, { payload: xpCode }: PayloadAction<string>) => {
      state.user.walletLinkToken = ''
      state.user.xpCode = xpCode
      state.user.isWatcher = true
      setSecureItem('user.walletLinkToken', '')
      setSecureItem('user.address', addressMap[xpCode])
      setSecureItem('user.explorationCode', xpCode)
      setSecureItem('user.isWatcher', true)
      setSecureItem('isBackedUp', true)
    },
    storeWalletLinkToken: (
      state,
      { payload: token }: PayloadAction<string>,
    ) => {
      state.user.isWatcher = false
      state.user.walletLinkToken = token
      setSecureItem('user.isWatcher', false)
      setSecureItem('user.address', '') // 清除之前的旧 Address
      setSecureItem('user.explorationCode', '')
      setSecureItem('user.walletLinkToken', token)
      setSecureItem('isBackedUp', true)
    },
    updateBlance: (state, { payload: blance }: PayloadAction<string>) => {
      state.user.lastHNTBlance = blance
      setSecureItem('user.lastHNTBlance', blance)
    },
    updateFiat: (state, { payload: blance }: PayloadAction<string>) => {
      state.user.lastFiatBlance = blance
      setSecureItem('user.lastFiatBlance', blance)
    },

    backupAccount: (state, action: PayloadAction<string>) => {
      setSecureItem('settings.isPinRequired', true)
      setSecureItem('settings.userPin', action.payload)
      state.settings.isPinRequired = true
    },
    startHotspotSetup: (state) => {
      state.isSettingUpHotspot = false
    },
    signOut: () => {
      signOut()
      return { ...initialState, isRestored: true }
    },
    updateAuthInterval: (state, action: PayloadAction<number>) => {
      state.settings.authInterval = action.payload
      setSecureItem('settings.authInterval', action.payload.toString())
    },
    disablePin: (state) => {
      deleteSecureItem('settings.isPinRequired')
      deleteSecureItem('settings.userPin')
      state.settings.isPinRequired = false
    },
    updateLastIdle: (state) => {
      state.lastIdle = Date.now()
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
      console.log('restoreAppSettings', payload)
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
      state.user.fetchAccountStatus = 'pending'
    })
    builder.addCase(fetchAccount.fulfilled, (state, { payload }) => {
      state.user.fetchAccountStatus = 'fulfilled'
      state.user.account = payload.account
    })
    builder.addCase(fetchAccount.rejected, (state, _action) => {
      state.user.fetchAccountStatus = 'rejected'
    })
  },
})

export default appSlice
