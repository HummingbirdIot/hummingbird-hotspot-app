import { createAsyncThunk } from '@reduxjs/toolkit'
import { PendingTransaction } from '@helium/http'
import { WritableDraft } from 'immer/dist/internal'
import {
  AccountFilterType,
  HotspotFilterType,
  Result,
  AccountActivityRecord,
  HotspotActivityRecord,
  TransactionList,
  HttpTransaction,
  AccountRolesRecord,
  HotspotRolesRecord,
  AddressIndexed,
  MoreArgs,
  HeadArgs,
  B58Address,
  AddressType,
  RolesList,
} from './txnsTypes'
import {
  getAccountActivityList,
  getAccountRolesList,
  getHotspotActivityList,
  getHotspotRolesList,
  getPendingTransactions,
} from '../../utils/clients/heliumDataClient'
import { hasValidCache } from '../../utils/cacheUtils'

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
}

export function newResult() {
  return {
    data: [],
    status: 'idle',
    hasInitialLoad: false,
  }
}

export function newAccountRecord() {
  return {
    txns: {
      all: newResult(),
      hotspot: newResult(),
      mining: newResult(),
      payment: newResult(),
      burn: newResult(),
      validator: newResult(),
    },
    filter: 'all',
  } as AccountActivityRecord | AccountRolesRecord
}

export function newHotspotRecord() {
  return {
    txns: {
      all: newResult(),
      rewards: newResult(),
      challenge_activity: newResult(),
      data_transfer: newResult(),
      challenge_construction: newResult(),
      consensus_group: newResult(),
    },
    filter: 'all',
  } as HotspotActivityRecord | HotspotRolesRecord
}

export function getRecord(
  subState: WritableDraft<Roles | Activities>,
  { address, addressType }: MoreArgs,
) {
  if (addressType === 'account') {
    if (!subState[address]) {
      // eslint-disable-next-line no-param-reassign
      subState[address] = newAccountRecord()
    }
    // const filterType = filter as Exclude<AccountFilterType, 'pending'>
    return subState[address] as AccountActivityRecord | AccountRolesRecord
    // .txns[filterType || 'all']
  }
  if (!subState[address]) {
    // eslint-disable-next-line no-param-reassign
    subState[address] = newAccountRecord()
  }
  // const filterType = filter as HotspotFilterType
  return subState[address] as HotspotActivityRecord | HotspotRolesRecord // .txns [ filterType || 'all']
}

export function getActivityRecord(
  activities: WritableDraft<Activities>,
  address: B58Address,
  addressType: AddressType,
) {
  return getRecord(activities, {
    address,
    addressType,
  }) as AccountActivityRecord & HotspotActivityRecord
}

export function getRolesRecord(
  roles: WritableDraft<Roles>,
  address: B58Address,
  addressType: AddressType,
) {
  return getRecord(roles, {
    address,
    addressType,
  }) as AccountRolesRecord & HotspotRolesRecord
}

export const fetchMoreTxns = createAsyncThunk<TransactionList, MoreArgs>(
  'txns/fetchMoreTxns',
  async (
    { address, filter = 'all', addressType = 'hotspot' },
    { getState },
  ) => {
    if (addressType === 'account') {
      const filterType = filter as Exclude<AccountFilterType, 'pending'>
      const obj = (
        (
          getState() as {
            txns: TxnsState
          }
        ).txns.activities[address] as AccountActivityRecord
      ).txns[filterType]

      if (!obj.cursor) {
        throw new Error(`Cannot fetch more for filter ${filter} - no cursor`)
      }
      if (hasValidCache(obj, 0.5) && obj.data.length) {
        return obj as TransactionList
      }

      return getAccountActivityList(
        address,
        filterType,
        obj.cursor,
      ) as unknown as Promise<TransactionList>
    }
    const filterType = filter as HotspotFilterType
    const obj = (
      (
        getState() as {
          txns: TxnsState
        }
      ).txns.activities[address] as HotspotActivityRecord
    ).txns[filterType]

    if (!obj?.cursor) {
      throw new Error(`Cannot fetch more for filter ${filter} - no cursor`)
    }
    if (hasValidCache(obj, 0.5) && obj.data.length) {
      return obj as TransactionList
    }

    return getHotspotActivityList(
      address,
      filterType,
      obj.cursor,
    ) as unknown as Promise<TransactionList>
  },
)

export const fetchTxnsPending = (address: B58Address) => {
  return fetchTxnsHead({ address, filter: 'pending', addressType: 'account' })
}

export const fetchTxnsHead = createAsyncThunk<
  TransactionList | PendingTransaction[],
  HeadArgs
>(
  'txns/fetchTxnsHead',
  async (
    { address, filter = 'all', addressType = 'hotspot' },
    { getState },
  ) => {
    if (filter === 'pending') {
      return getPendingTransactions(address) as unknown as PendingTransaction[]
    }
    if (addressType === 'account') {
      const filterType = filter as Exclude<AccountFilterType, 'pending'>
      // const { hasInitialLoad, cursor, data } = (
      //   (
      //     getState() as {
      //       txns: TxnsState
      //     }
      //   ).txns.activities[address] as AccountActivityRecord
      // ).txns[filterType] as TransactionList

      // if (hasInitialLoad) {
      //   return {
      //     cursor,
      //     data,
      //   }
      // }
      return getAccountActivityList(
        address,
        filterType,
      ) as unknown as Promise<TransactionList>
    }
    const filterType = filter as HotspotFilterType
    const { cursor, data } = (
      (
        getState() as {
          txns: TxnsState
        }
      ).txns.activities[address] as HotspotActivityRecord
    ).txns[filterType]

    if (cursor) {
      return {
        cursor,
        data,
      }
    }
    return getHotspotActivityList(
      address,
      filterType,
    ) as unknown as Promise<TransactionList>
  },
)

export const fetchMoreRoles = createAsyncThunk<RolesList, MoreArgs>(
  'txns/fetchMoreRoles',
  async (
    { address, filter = 'all', addressType = 'hotspot' },
    { getState },
  ) => {
    if (addressType === 'account') {
      const filterType = filter as Exclude<AccountFilterType, 'pending'>
      const { cursor } = (
        (
          getState() as {
            txns: TxnsState
          }
        ).txns.roles[address] as AccountRolesRecord
      ).txns[filterType]

      if (!cursor) {
        throw new Error(`Cannot fetch more for filter ${filter} - no cursor`)
      }

      return getAccountRolesList(
        address,
        filterType,
        cursor,
      ) as unknown as Promise<RolesList>
    }
    const filterType = filter as HotspotFilterType
    const { cursor } = (
      (
        getState() as {
          txns: TxnsState
        }
      ).txns.roles[address] as HotspotRolesRecord
    ).txns[filterType]

    if (!cursor) {
      throw new Error(`Cannot fetch more for filter ${filter} - no cursor`)
    }

    return getHotspotRolesList(
      address,
      filterType,
      cursor,
    ) as unknown as Promise<RolesList>
  },
)

export const fetchRolesHead = createAsyncThunk<RolesList, MoreArgs>(
  'txns/fetchRolesHead',
  async ({ address, filter = 'all', addressType = 'hotspot' }) => {
    if (addressType === 'account') {
      const filterType = filter as AccountFilterType
      return getAccountRolesList(
        address,
        filterType,
      ) as unknown as Promise<RolesList>
    }
    const filterType = filter as HotspotFilterType
    return getHotspotRolesList(
      address,
      filterType,
    ) as unknown as Promise<RolesList>
  },
)
