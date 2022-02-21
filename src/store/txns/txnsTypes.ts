import {
  PaymentV1,
  PaymentV2,
  RewardsV1,
  RewardsV2,
  AddGatewayV1,
  AssertLocationV1,
  UnknownTransaction,
  // SecurityExchangeV1,
  TransferValidatorStakeV1,
  UnstakeValidatorV1,
  TransferHotspotV2,
  TransferHotspotV1,
  TokenBurnV1,
  StakeValidatorV1,
  PocReceiptsV1,
  AnyTransaction,
  // StateChannelCloseV1,
} from '@helium/http'
import { StateChannelCloseV1 } from '@helium/http/build/models/Transaction'

export type Loading =
  | 'idle'
  | 'pending'
  | 'fulfilled'
  | 'rejected'
  | 'more_rejected'

export const TxnTypeKeys = [
  'rewards_v1',
  'rewards_v2',
  'payment_v1',
  'payment_v2',
  'add_gateway_v1',
  'assert_location_v1',
  'assert_location_v2',
  'transfer_hotspot_v1',
  'transfer_hotspot_v2',
  'token_burn_v1',
  'unstake_validator_v1',
  'stake_validator_v1',
  'transfer_validator_stake_v1',
] as const
export type TxnType = typeof TxnTypeKeys[number]

export const AccountFilterKeys = [
  'all',
  'mining',
  'payment',
  'hotspot',
  'burn',
  'validator',
  'pending',
] as const
export type AccountFilterType = typeof AccountFilterKeys[number]

export const AccountFilters = {
  all: ['all'],
  mining: ['rewards_v1', 'rewards_v2'],
  payment: ['payment_v1', 'payment_v2'],
  hotspot: [
    'add_gateway_v1',
    'assert_location_v1',
    'assert_location_v2',
    'transfer_hotspot_v1',
    'transfer_hotspot_v2',
  ],
  validator: [
    'unstake_validator_v1',
    'stake_validator_v1',
    'transfer_validator_stake_v1',
  ],
  burn: ['token_burn_v1'],
  pending: [],
} as Record<AccountFilterType, string[]>

export const HotspotFilterKeys = [
  'all',
  'rewards',
  'challenge_activity',
  'data_transfer',
  'challenge_construction',
  'consensus_group',
] as const
export type HotspotFilterType = typeof HotspotFilterKeys[number]

export const HotspotFilters = {
  all: [],
  rewards: ['rewards_v1', 'rewards_v2'],
  challenge_activity: ['poc_receipts_v1'],
  data_transfer: ['state_channel_close_v1'],
  challenge_construction: ['poc_request_v1'],
  consensus_group: ['consensus_group_v1'],
} as Record<HotspotFilterType, string[]>

export type FilterType = AccountFilterType | HotspotFilterType

export const Filters = {
  account: AccountFilters,
  hotspot: HotspotFilters,
}
export type AddressType = keyof typeof Filters

export type HttpTransaction = PaymentV1 &
  PaymentV2 &
  RewardsV1 &
  RewardsV2 &
  AddGatewayV1 &
  AssertLocationV1 &
  PocReceiptsV1 &
  TransferHotspotV1 &
  TransferHotspotV2 &
  TokenBurnV1 &
  StakeValidatorV1 &
  UnstakeValidatorV1 &
  TransferValidatorStakeV1 &
  // SecurityExchangeV1 &
  UnknownTransaction &
  StateChannelCloseV1

export type Role = {
  type: string
  time: number
  role: string
  height: number
  hash: string
}

export type TransactionList = {
  cursor: string | null
  data: AnyTransaction[]
  hasInitialLoad?: boolean
}

export type RolesList = {
  cursor: string | null
  data: Role[]
  hasInitialLoad?: boolean
}

export type Result<T> = {
  cursor?: string | null
  data: T[]
  status: Loading
  hasInitialLoad: boolean
}

export type AccountRecord<T> = {
  txns: {
    all: T
    hotspot: T
    mining: T
    payment: T
    burn: T
    validator: T
  }
  filter: FilterType
}

export type HotspotRecord<T> = {
  txns: {
    all: T
    rewards: T
    challenge_activity: T
    data_transfer: T
    challenge_construction: T
    consensus_group: T
  }
  filter: FilterType
}

export type AccountActivityRecord = AccountRecord<Result<HttpTransaction>>

export type HotspotActivityRecord = HotspotRecord<Result<HttpTransaction>>

export type AccountRolesRecord = AccountRecord<Result<Role>>

export type HotspotRolesRecord = HotspotRecord<Result<Role>>

export type B58Address = string
export type AddressIndexed<T> = Record<B58Address, T>

export type HeadArgs = {
  address: B58Address
  filter?: FilterType
  addressType?: AddressType
}

export type MoreArgs = {
  address: B58Address
  filter?: Exclude<FilterType, 'pending'>
  addressType?: AddressType
}
