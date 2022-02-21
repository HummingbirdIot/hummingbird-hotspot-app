import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { differenceBy, unionBy, uniqBy } from 'lodash'
import { PendingTransaction } from '@helium/http'

import {
  Result,
  AccountActivityRecord,
  HotspotActivityRecord,
  TransactionList,
  RolesList,
  HttpTransaction,
  AccountRolesRecord,
  HotspotRolesRecord,
  AddressIndexed,
  HeadArgs,
  Role,
} from './txnsTypes'
import {
  fetchMoreRoles,
  fetchMoreTxns,
  fetchRolesHead,
  fetchTxnsHead,
  getActivityRecord,
  getRolesRecord,
} from './txnsHelper'
import { handleCacheFulfilled } from '../../utils/cacheUtils'

export type Roles = AddressIndexed<AccountRolesRecord | HotspotRolesRecord>
export type Activities = AddressIndexed<
  AccountActivityRecord | HotspotActivityRecord
>
export type TxnsState = {
  roles: Roles
  activities: Activities
  pending: Result<PendingTransaction>
  requestMore: boolean
  detailTxn?: HttpTransaction | PendingTransaction
  pendingAndFailded: PendingTransaction[]
}

const initialState: TxnsState = {
  roles: {},
  activities: {},
  pending: {
    data: [],
    status: 'idle',
    hasInitialLoad: false,
  },
  pendingAndFailded: [],
  requestMore: false,
}

const txnsSlice = createSlice({
  name: 'txns',
  initialState,
  reducers: {
    setActivityFilter: (state, action: PayloadAction<HeadArgs>) => {
      const { address, filter } = action.payload
      state.activities[address].filter = filter || 'all'
    },
    setRolesFilter: (state, action: PayloadAction<HeadArgs>) => {
      const { address, filter } = action.payload
      state.roles[address].filter = filter || 'all'
    },
    requestMore: (state) => {
      state.requestMore = true
    },
    addPendingTransaction: (
      state,
      action: PayloadAction<PendingTransaction>,
    ) => {
      state.pending.data.push(action.payload)
    },
    setDetailTxn: (
      state,
      action: PayloadAction<HttpTransaction | PendingTransaction>,
    ) => {
      state.detailTxn = action.payload
    },
    clearDetailTxn: (state) => {
      return { ...state, detailTxn: undefined }
    },
    signOut: () => {
      return { ...initialState }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchMoreTxns.pending,
      (
        state,
        {
          meta: {
            arg: { address, filter = 'all', addressType = 'hotspot' },
          },
        },
      ) => {
        const record = getActivityRecord(state.activities, address, addressType)
        record.txns[filter].status = 'pending'
      },
    )
    builder.addCase(
      fetchMoreTxns.rejected,
      (
        state,
        {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          error,
          meta: {
            arg: { address, filter = 'all', addressType = 'hotspot' },
          },
        },
      ) => {
        state.requestMore = false
        const record = getActivityRecord(state.activities, address, addressType)
        const obj = record.txns[filter]
        if (!obj.hasInitialLoad) {
          obj.hasInitialLoad = true
        }
        obj.status = 'more_rejected'
      },
    )
    builder.addCase(
      fetchMoreTxns.fulfilled,
      (
        state,
        {
          payload,
          meta: {
            arg: { address, filter = 'all', addressType = 'hotspot' },
          },
        },
      ) => {
        state.requestMore = false
        const record = getActivityRecord(state.activities, address, addressType)
        const obj = record.txns[filter]
        const nextTxns = uniqBy(
          [...obj.data, ...payload.data],
          (t) => (t as { hash: string }).hash,
        ).sort((a, b) => b.time - a.time)
        obj.data = nextTxns.filter(
          (txn) => txn !== undefined,
        ) as HttpTransaction[]
        // obj.cursor = payload.cursor
        obj.status = 'fulfilled'
        obj.hasInitialLoad = true
        record.txns[filter] = handleCacheFulfilled(obj)

        // remove any pending txns with the same hash
        state.pending.data = differenceBy(state.pending.data, nextTxns, 'hash')
        state.pendingAndFailded = differenceBy(
          state.pendingAndFailded,
          nextTxns,
          'hash',
        )
      },
    )

    builder.addCase(
      fetchTxnsHead.pending,
      (
        state,
        {
          meta: {
            arg: { address, filter = 'all', addressType = 'hotspot' },
          },
        },
      ) => {
        if (filter === 'pending') {
          state.pending.status = 'pending'
        } else {
          const record = getActivityRecord(
            state.activities,
            address,
            addressType,
          )
          record.txns[filter].status = 'pending'
        }
      },
    )
    builder.addCase(
      fetchTxnsHead.rejected,
      (
        state,
        {
          meta: {
            arg: { address, filter = 'all', addressType = 'hotspot' },
          },
        },
      ) => {
        if (filter === 'pending') {
          if (!state.pending.hasInitialLoad) {
            state.pending.hasInitialLoad = true
          }
          state.pending.status = 'rejected'
        } else {
          const record = getActivityRecord(
            state.activities,
            address,
            addressType,
          )
          const obj = record.txns[filter]
          obj.status = 'pending'
          if (!obj.hasInitialLoad) {
            obj.hasInitialLoad = true
          }
          obj.status = 'rejected'
        }
      },
    )
    builder.addCase(
      fetchTxnsHead.fulfilled,
      (
        state,
        {
          payload,
          meta: {
            arg: { address, filter = 'all', addressType = 'hotspot' },
          },
        },
      ) => {
        if (filter === 'pending') {
          const pending = payload as unknown as PendingTransaction[]
          const existingPending = state.pending.data
          const newPending = unionBy(pending, existingPending, 'hash')
          state.pendingAndFailded = newPending
          state.pending.status = 'fulfilled'
          state.pending.hasInitialLoad = true
          state.pending.data = newPending.filter(
            (txn) => txn !== undefined && txn.status === 'pending',
          )
        } else {
          const record = getActivityRecord(
            state.activities,
            address,
            addressType,
          )
          const obj = record.txns[filter]
          if (obj.hasInitialLoad) {
            obj.status = 'fulfilled'
            return
          }
          const txns = payload as TransactionList
          const nextTxns = txns.data
            .filter((txn) => txn !== undefined)
            .sort((a, b) => b.time - a.time)

          obj.data = nextTxns as HttpTransaction[]
          obj.cursor = txns.cursor
          obj.status = 'fulfilled'
          obj.hasInitialLoad = true
        }
      },
    )

    builder.addCase(
      fetchMoreRoles.pending,
      (
        state,
        {
          meta: {
            arg: { address, filter = 'all', addressType = 'hotspot' },
          },
        },
      ) => {
        const record = getRolesRecord(state.roles, address, addressType)
        record.txns[filter].status = 'pending'
      },
    )
    builder.addCase(
      fetchMoreRoles.rejected,
      (
        state,
        {
          meta: {
            arg: { address, filter = 'all', addressType = 'hotspot' },
          },
        },
      ) => {
        state.requestMore = false
        const record = getRolesRecord(state.roles, address, addressType)
        const obj = record.txns[filter]
        if (!obj.hasInitialLoad) {
          obj.hasInitialLoad = true
        }
        obj.status = 'more_rejected'
      },
    )
    builder.addCase(
      fetchMoreRoles.fulfilled,
      (
        state,
        {
          payload,
          meta: {
            arg: { address, filter = 'all', addressType = 'hotspot' },
          },
        },
      ) => {
        state.requestMore = false
        const record = getRolesRecord(state.roles, address, addressType)
        const obj = record.txns[filter]
        const nextTxns = uniqBy(
          [...obj.data, ...payload.data],
          (t) => (t as { hash: string }).hash,
        ).sort((a, b) => b.time - a.time)

        obj.data = nextTxns as Role[]
        obj.cursor = payload.cursor
        obj.status = 'fulfilled'
        obj.hasInitialLoad = true
        record.txns[filter] = handleCacheFulfilled(obj)
      },
    )

    builder.addCase(
      fetchRolesHead.pending,
      (
        state,
        {
          meta: {
            arg: { address, filter = 'all', addressType = 'hotspot' },
          },
        },
      ) => {
        const record = getRolesRecord(state.roles, address, addressType)
        record.txns[filter].status = 'pending'
      },
    )
    builder.addCase(
      fetchRolesHead.rejected,
      (
        state,
        {
          meta: {
            arg: { address, filter = 'all', addressType = 'hotspot' },
          },
        },
      ) => {
        const record = getRolesRecord(state.roles, address, addressType)
        const obj = record.txns[filter]
        if (!obj.hasInitialLoad) {
          obj.hasInitialLoad = true
        }
        obj.status = 'rejected'
      },
    )
    builder.addCase(
      fetchRolesHead.fulfilled,
      (
        state,
        {
          payload,
          meta: {
            arg: { address, filter = 'all', addressType = 'hotspot' },
          },
        },
      ) => {
        const record = getRolesRecord(state.roles, address, addressType)
        const obj = record.txns[filter]
        if (obj.hasInitialLoad) {
          obj.status = 'fulfilled'
          return
        }
        const txns = payload as RolesList
        const nextTxns = txns.data.sort((a, b) => b.time - a.time)

        obj.data = nextTxns as Role[]
        obj.cursor = txns.cursor
        obj.status = 'fulfilled'
        obj.hasInitialLoad = true
        record.txns[filter] = handleCacheFulfilled(obj)
      },
    )
  },
})

export default txnsSlice
