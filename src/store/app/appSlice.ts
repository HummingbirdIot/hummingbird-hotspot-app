import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { currencyType } from '../../utils/i18n'
import {
  deleteSecureItem,
  getSecureItem,
  setSecureItem,
  unlinkAccount,
  endWatching,
  getAddress,
  parseLinkedAddress,
} from '../../utils/secureData'
import { Intervals } from '../../utils/hooks/useAuthIntervals'
import { B58Address } from '../txns/txnsTypes'
// import OneSignal from 'react-native-onesignal'

const boolKeys = ['isPinRequired'] as const
type BooleanKey = typeof boolKeys[number]
const stringKeys = ['currencyType'] as const
type StringKey = typeof stringKeys[number]
type SettingsBag = Array<{ key: string; value: string }>

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
  }
  settings: {
    isPinRequired: boolean
    authInterval: number
    currencyType?: string
  }
}

export const restoreUserSettings = createAsyncThunk<Restore>(
  'app/restoreUserSettings',
  async () => {
    const [
      isBackedUp,

      isWatching,
      token,
      watchingAddressesJSON,
      address,

      isPinRequired,
      authInterval,
      // language,
      currency,
    ] = await Promise.all([
      getSecureItem('isBackedUp'),

      getSecureItem('user.isWatching'),
      getSecureItem('user.walletLinkToken'),
      getSecureItem('user.watchingAddressesJSON'),
      getAddress(),

      getSecureItem('settings.isPinRequired'),
      getSecureItem('settings.authInterval'),
      // getSecureItem('settings.language'),
      getSecureItem('settings.currencyType'),
    ])

    let isWatcher = false
    let walletLinkToken = ''
    let watchingAddresses: WatchingAddress[] = []
    let accountAddress = ''
    try {
      watchingAddresses = JSON.parse(watchingAddressesJSON || '[]') || []
    } catch (error) {
      watchingAddresses = []
    }

    if (isBackedUp) {
      if (token) {
        const addr = parseLinkedAddress(token)
        if (addr) {
          accountAddress = addr
          walletLinkToken = token
        } else {
          deleteSecureItem('user.walletLinkToken')
          walletLinkToken = ''
        }
      }

      if (address) {
        if (isWatching) {
          if (accountAddress === address) {
            setSecureItem('user.isWatching', false)
          } else {
            const account = watchingAddresses.find(
              (item) => item.address === address,
            )
            if (account) {
              isWatcher = true
              accountAddress = address
            } else {
              setSecureItem('user.isWatching', false)
              if (accountAddress) {
                setSecureItem('user.address', accountAddress)
              } else {
                deleteSecureItem('user.address')
              }
            }
          }
        }
      } else if (isWatching) {
        setSecureItem('user.isWatching', false)
      }

      if (accountAddress) {
        // 推送
        console.log('OneSignal.sendTags:', { accountAddress })
      }

      return {
        isLocked: !!isPinRequired,
        user: {
          isWatcher,
          walletLinkToken,
          accountAddress,
          watchingAddresses,
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
    }

    return {} as unknown as Restore
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

      state.user.accountAddress = address
      state.user.isWatcher = true
    },
    storeWalletLinkToken: (
      state,
      { payload: token }: PayloadAction<string>,
    ) => {
      const address = parseLinkedAddress(token)
      deleteSecureItem('user.address')
      setSecureItem('user.isWatching', false)
      deleteSecureItem('user.address').then(() => {
        setSecureItem('user.walletLinkToken', token)
        setSecureItem('user.address', address as B58Address)
        setSecureItem('isBackedUp', true)
      })

      state.user.accountAddress = address as B58Address
      state.user.walletLinkToken = token
      state.user.isWatcher = false
    },
    asOwner: (state) => {
      if (state.user.walletLinkToken) {
        const address = parseLinkedAddress(state.user.walletLinkToken)
        deleteSecureItem('user.address')
          .then(endWatching)
          .then(() => {
            setSecureItem('user.address', address as B58Address)
            setSecureItem('isBackedUp', true)
          })

        state.user.accountAddress = address as B58Address
        state.user.isWatcher = false
      }
    },
    unlinkAccount: (state) => {
      unlinkAccount().then(() => {
        setSecureItem('isBackedUp', true)
      })
      state.user.walletLinkToken = ''
      state.user.accountAddress = ''
      state.user.isWatcher = false
    },
    backupAccount: (state, action: PayloadAction<string>) => {
      setSecureItem('settings.isPinRequired', true)
      setSecureItem('settings.userPin', action.payload)
      state.settings.isPinRequired = true
    },
    startHotspotSetup: (state) => {
      state.isSettingUpHotspot = false
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
    builder.addCase(restoreUserSettings.fulfilled, (state, { payload }) => {
      // console.log('restoreUserSettings', payload)
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
  },
})

export default appSlice
