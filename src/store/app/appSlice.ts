import { Account } from '@helium/http'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getAccount } from '../../utils/clients/appDataClient'
import { currencyType } from '../../utils/i18n'
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
  unlinkAccount,
  endWatching,
  getLinkedAddress,
} from './secureData'
import { Intervals } from '../../utils/hooks/useAuthIntervals'
import { B58Address, Loading } from '../txns/txnsTypes'
// import OneSignal from 'react-native-onesignal'

const boolKeys = ['isPinRequired'] as const
type BooleanKey = typeof boolKeys[number]
const stringKeys = ['currencyType'] as const
type StringKey = typeof stringKeys[number]
type SettingsBag = Array<{ key: string; value: string }>

type AccountData = {
  account?: Account
}

export type WatchingAddress = {
  address: B58Address
  alias: string
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
    walletLinkToken?: string
    watchingAddresses: WatchingAddress[]
    accountAddress?: B58Address
    account?: Account
    lastHNTBlance: string
    lastFiatBlance: string
    fetchAccountStatus: Loading
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
    watchingAddresses: [],
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
    walletLinkToken?: string
    watchingAddresses: WatchingAddress[]
    accountAddress?: B58Address
    account?: Account
    lastHNTBlance: string
    lastFiatBlance: string
    fetchAccountStatus: Loading
  }
  settings: {
    isPinRequired: boolean
    authInterval: number
    currencyType?: string
  }
}

export const restoreAppSettings = createAsyncThunk<Restore>(
  'app/restoreAppSettings',
  async () => {
    const [
      isBackedUp,
      isWatcher,
      walletLinkToken,
      address,
      lastHNTBlance,
      lastFiatBlance,
      watchingAddressesJSON,

      isPinRequired,
      authInterval,
      // language,
      currency,
    ] = await Promise.all([
      getSecureItem('isBackedUp'),
      getSecureItem('user.isWatching'),
      getSecureItem('user.walletLinkToken'),
      getSecureItem('user.address'),
      getSecureItem('user.lastHNTBlance'),
      getSecureItem('user.lastFiatBlance'),
      getSecureItem('user.watchingAddressesJSON'),

      getSecureItem('settings.isPinRequired'),
      getSecureItem('settings.authInterval'),
      // getSecureItem('settings.language'),
      getSecureItem('settings.currencyType'),
    ])

    if (isBackedUp && address) {
      // 推送
      console.log('OneSignal.sendTags:', { address })
      // OneSignal.sendTags({ address })
      // Logger.setUser(address)
    }

    let watchingAddresses = []
    try {
      watchingAddresses = JSON.parse(watchingAddressesJSON || '[]') || []
    } catch (error) {
      watchingAddresses = []
    }

    console.log('watchingAddresses', watchingAddresses)

    return {
      isLocked: !!isPinRequired,
      user: {
        fetchAccountStatus: 'idle',
        isWatcher,
        walletLinkToken,
        lastHNTBlance: lastHNTBlance || '0.00000',
        lastFiatBlance: lastFiatBlance || '0.00',
        watchingAddresses,
        accountAddress: address || '',
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
    enableWatchMode: (state, { payload: address }: PayloadAction<string>) => {
      const account = state.user.watchingAddresses.find(
        (item) => item.address === address,
      )
      if (!account) {
        state.user.watchingAddresses = [
          ...state.user.watchingAddresses,
          {
            address,
            alias: address.slice(address.length - 4).toUpperCase(),
          },
        ]
      }
      setSecureItem(
        'user.watchingAddressesJSON',
        JSON.stringify(state.user.watchingAddresses),
      )
      setSecureItem('user.address', address)
      setSecureItem('user.isWatching', true)
      setSecureItem('isBackedUp', true)
      state.user.isWatcher = true
      state.user.accountAddress = address
    },
    storeWalletLinkToken: (
      state,
      { payload: token }: PayloadAction<string>,
    ) => {
      setSecureItem('user.isWatching', false)
      setSecureItem('user.address', '') // 清除之前的旧 Address
      setSecureItem('user.walletLinkToken', token).then(() =>
        getLinkedAddress().then((address) => {
          state.user.accountAddress = address as B58Address
          state.user.walletLinkToken = token
          state.user.isWatcher = false
          setSecureItem('isBackedUp', true)
        }),
      )
    },
    switchAccount: (state) => {
      state.isSettingUpHotspot = false
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
    signOut: (state) => {
      if (state.user.isWatcher) {
        endWatching()
      } else {
        unlinkAccount()
      }
      return {
        ...initialState,
        user: {
          ...initialState.user,
          watchingAddresses: state.user.watchingAddresses,
        },
        isRestored: true,
      }
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
