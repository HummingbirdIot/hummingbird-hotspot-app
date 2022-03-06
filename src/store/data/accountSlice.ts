import { Account } from '@helium/http'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getAccount } from '../../utils/clients/heliumDataClient'
import { getSecureItem, setSecureItem } from '../../utils/secureData'
import { B58Address, Loading } from '../txns/txnsTypes'

type AccountData = {
  account?: Account
}

export type WatchingAddress = {
  address: B58Address
  alias: string
}

export type ApccountState = {
  isRestored: boolean
  account?: Account
  lastHNTBlance: string
  lastFiatBlance: string
  fetchAccountStatus: Loading
}
const initialState: ApccountState = {
  isRestored: false,
  fetchAccountStatus: 'idle',
  lastHNTBlance: '0.00000',
  lastFiatBlance: '0.00',
}

type Restore = {
  lastHNTBlance: string
  lastFiatBlance: string
  fetchAccountStatus: Loading
}

export const restoreAccountData = createAsyncThunk<Restore>(
  'account/restoreAccountData',
  async () => {
    const [lastHNTBlance, lastFiatBlance] = await Promise.all([
      getSecureItem('user.lastHNTBlance'),
      getSecureItem('user.lastFiatBlance'),
    ])

    return {
      lastHNTBlance: lastHNTBlance || '0.00000',
      lastFiatBlance: lastFiatBlance || '0.00',
      fetchAccountStatus: 'idle',
    } as unknown as Restore
  },
)

export const fetchAccount = createAsyncThunk<
  AccountData,
  { address: B58Address }
>('app/fetchAccount', async ({ address }) => {
  const data = await getAccount(address)
  return {
    account: data,
  }
})

const accountSlice = createSlice({
  name: 'account',
  initialState,
  reducers: {
    reset: () => {
      return { ...initialState, account: undefined }
    },
    updateAccount: (state, { payload }: PayloadAction<AccountData>) => {
      state.account = payload.account
    },
    updateFiat: (state, { payload: blance }: PayloadAction<string>) => {
      state.lastFiatBlance = blance
      setSecureItem('user.lastFiatBlance', blance)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(restoreAccountData.fulfilled, (state, { payload }) => {
      return { ...state, ...payload, isRestored: true }
    })
    builder.addCase(fetchAccount.pending, (state, _action) => {
      state.fetchAccountStatus = 'pending'
    })
    builder.addCase(fetchAccount.fulfilled, (state, { payload }) => {
      const blance =
        payload.account?.balance?.floatBalance.toString() || '0.00000'
      setSecureItem('user.lastHNTBlance', blance)
      state.fetchAccountStatus = 'fulfilled'
      state.account = payload.account
      state.lastHNTBlance = blance
    })
    builder.addCase(fetchAccount.rejected, (state, _action) => {
      state.fetchAccountStatus = 'rejected'
    })
  },
})

export default accountSlice
