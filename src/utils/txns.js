import { groupBy } from 'lodash'

const CONFIG = {
  state_channel_open_v1: { color: '#22CAAC', name: 'State Channel Open' },
  price_oracle_v1: { color: '#292929', name: 'Price Oracle' },
  state_channel_close_v1: {
    color: '#22CAAC',
    hotspotContextName: 'Transferred Packets',
    name: 'State Channel Close',
  },
  payment_v1: { color: '#1D91F8', name: 'Payment' },
  payment_v2: { color: '#1D91F8', name: 'Payment' },
  poc_request_v1: {
    color: '#A667F6',
    name: 'PoC Challenge',
    hotspotContextName: 'Constructed Challenge',
    tooltip: 'Proof of Coverage Challenge',
  },
  poc_receipts_v1: {
    color: '#1D91F8',
    name: 'PoC Receipt',
    tooltip: 'Proof of Coverage Receipt',
  },
  poc_receipts_v2: {
    color: '#1D91F8',
    name: 'PoC Receipt',
    tooltip: 'Proof of Coverage Receipt',
  },
  rewards_v1: {
    color: '#A667F6',
    name: 'Mining Reward',
    accountContextName: 'Received Mining Rewards',
    hotspotContextName: 'Received Mining Rewards',
    validatorContextName: 'Received Mining Rewards',
    tooltip: 'Mining Reward (v1)',
  },
  rewards_v2: {
    color: '#A667F6',
    name: 'Mining Reward',
    accountContextName: 'Received Mining Rewards',
    hotspotContextName: 'Received Mining Rewards',
    validatorContextName: 'Received Mining Rewards',
    tooltip: 'Mining Reward (v2)',
  },
  rewards_v3: {
    color: '#A667F6',
    name: 'Mining Reward',
    accountContextName: 'Received Mining Rewards',
    hotspotContextName: 'Received Mining Rewards',
    validatorContextName: 'Received Mining Rewards',
    tooltip: 'Mining Reward (v3)',
  },
  consensus_group_v1: {
    color: '#FF6666',
    name: 'Consensus Election',
    hotspotContextName: 'Participated in Consensus',
    tooltip: 'Consensus Election',
  },
  transfer_hotspot_v1: {
    color: '#D3293D',
    name: 'Transfer Hotspot',
    tooltip: 'Hotspot Transfer Confirmation Transaction',
  },
  poc_challengers: {
    color: '#A667F6',
    name: 'Challenger',
    hotspotContextName: 'Challenged Beaconer',
    tooltip: 'PoC challenger',
  },
  poc_challengees: {
    color: '#1D91F8',
    name: 'Beacon',
    hotspotContextName: 'Broadcasted Beacon',
    tooltip: 'PoC challengee',
  },
  assert_location_v1: {
    color: '#93D30B',
    name: 'Assert Location',
    hotspotContextName: 'Asserted Location',
    tooltip: 'Assert Location Transaction (v1)',
  },
  assert_location_v2: {
    color: '#93D30B',
    name: 'Assert Location',
    hotspotContextName: 'Updated Hotspot',
    tooltip: 'Assert Location Transaction (v2)',
  },
  add_gateway_v1: {
    color: '#29D391',
    name: 'Add Hotspot',
    hotspotContextName: 'Added to Blockchain',
    tooltip: 'Add Gateway Transaction',
  },
  poc_witnesses: {
    color: '#FCC945',
    name: 'Witness',
    hotspotContextName: 'Witnessed Beacon',
    tooltip: 'PoC witness',
  },
  poc_witnesses_valid: {
    color: '#FCC945',
    name: 'Witness',
    hotspotContextName: 'Witnessed Beacon',
    tooltip: 'PoC witness (Valid)',
  },
  poc_witnesses_invalid: {
    color: '#617095',
    name: 'Witness',
    hotspotContextName: 'Witnessed Beacon (Invalid)',
    tooltip: 'PoC witness (Invalid)',
  },
  securities: {
    color: '#9AE8C9',
    name: 'Security Token Reward',
    tooltip: 'Mining Reward for Security Token holders',
  },
  stake_validator_v1: {
    color: '#7830D3',
    name: 'Stake Validator',
    accountContextName: 'Staked Validator',
    validatorContextName: 'Received Stake',
  },
  unstake_validator_v1: {
    color: '#FF6666',
    name: 'Unstake Validator',
    accountContextName: 'Unstaked Validator',
    validatorContextName: 'Unstaked',
  },
  transfer_validator_stake_v1: {
    color: '#A667F6',
    name: 'Transfer Stake',
    accountContextName: 'Stake Transferred',
    validatorContextName: 'Stake Transferred',
  },
  receive_transferred_stake: {
    color: '#A667F6',
    name: 'Receive Transfer Stake',
    accountContextName: 'Received Transferred Stake',
    validatorContextName: 'Received Transferred Stake',
  },
  send_transferred_stake: {
    color: '#A667F6',
    name: 'Send Transfer Stake',
    accountContextName: 'Transferred Stake',
    validatorContextName: 'Sent Transferred Stake',
  },
  validator_heartbeat_v1: {
    color: '#A667F6',
    name: 'Validator Heartbeat',
    validatorContextName: 'Produced Heartbeat',
  },
  token_burn_v1: { color: '#F49F3B', name: 'Token Burn' },
  default: { color: '#474DFF' },
}

export const getTxnIconPath = (txn) => {
  // TODO: abstract this function into the CONFIG above and make it take into account both roles _and_ types, with iconPath as a new field for each txn type/role defined in the CONFIG
  const { role, type } = txn

  switch (type) {
    case 'rewards_v1':
    case 'rewards_v2':
    case 'rewards_v3': {
      return 'received_rewards'
    }
    case 'payment_v1':
    case 'payment_v2': {
      if (role === 'payee') {
        return 'payment_received'
      }
      if (role === 'payer') {
        return 'payment_sent'
      }
      return 'payment'
    }
    case 'assert_location_v1':
    case 'assert_location_v2': {
      return 'assert_location'
    }
    case 'add_gateway_v1': {
      return 'add_hotspot'
    }
    case 'poc_request_v1': {
      return 'poc_challenger'
    }
    case 'poc_receipts_v1':
    case 'poc_receipts_v2': {
      if (role === 'witness') {
        return 'poc_witness'
      }
      if (role === 'challengee') {
        return 'poc_challengee'
      }
      if (role === 'challenger') {
        return 'poc_challenger'
      }
      return 'poc_witness'
    }
    case 'token_burn_v1': {
      return 'token_burn'
    }
    case 'stake_validator_v1': {
      return 'staked_validator'
    }
    case 'unstake_validator_v1': {
      return 'unstake_validator'
    }
    case 'transfer_validator_stake_v1': {
      return 'transferred_stake'
    }
    case 'validator_heartbeat_v1': {
      return 'validator_heartbeat'
    }
    case 'state_channel_open_v1': {
      return 'state_channel_open'
    }
    case 'state_channel_close_v1': {
      return 'state_channel_close'
    }
    case 'transfer_hotspot_v1': {
      return 'transfer_hotspot'
    }
    default: {
      return null
    }
  }
}

export const getTxnTypeName = (id, context = 'block') => {
  if (context === 'hotspot')
    return CONFIG[id]?.hotspotContextName || CONFIG[id]?.name || id
  if (context === 'account')
    return CONFIG[id]?.accountContextName || CONFIG[id]?.name || id
  if (context === 'validator')
    return CONFIG[id]?.validatorContextName || CONFIG[id]?.name || id
  return CONFIG[id]?.name || id
}

export const getTxnTypeColor = (id) => {
  return (CONFIG[id] || CONFIG.default).color
}

export const getTxnTypeTooltip = (id) => {
  return CONFIG[id]?.tooltip
}

export const splitTransactionsByTypes = (txns) => {
  const obj = groupBy(txns, 'type')
  const arr = Object.keys(obj)
    .map((type) => ({ type, txns: obj[type] }))
    .sort((a, b) => b.txns.length - a.txns.length)
  return arr
}

export const formattedTxnHash = (hash) => {
  // TODO add optional truncation amount
  return `${hash.slice(0, 5)}...${hash.slice(-5)}`
}

export const getPocReceiptRole = (role) => {
  if (role === 'challenger') {
    return 'poc_challengers'
  }

  if (role === 'challengee') {
    return 'poc_challengees'
  }

  if (role === 'witness') {
    return 'poc_witnesses_valid'
  }

  // TODO: blocked by: https://github.com/helium/blockchain-http/issues/376
  // if (role === 'witness_invalid') {
  //   return 'poc_witnesses_invalid'
  // }

  return 'poc_receipts_v1'
}

// temporary workaround for above TODO comment
export const getPocReceiptRoleFromFullTxn = (txn, address) => {
  if (txn.challenger === address) {
    return 'poc_challengers'
  }

  if (txn.path.some((p) => p.challengee === address)) {
    return 'poc_challengees'
  }

  if (
    txn.path.some((p) =>
      p.witnesses.some((w) => w.gateway === address && w.isValid),
    )
  ) {
    return 'poc_witnesses_valid'
  }

  return 'poc_witnesses_invalid'
}

export const getStakeTransferRole = (txn, address) => {
  if (txn.oldAddress === address) {
    return 'send_transferred_stake'
  }

  return 'receive_transferred_stake'
}

export const getHumanReadableInvalidReason = (rawInvalidReason) => {
  switch (rawInvalidReason) {
    case 'witness_too_close': {
      return 'Witness too close'
    }
    case 'witness_rssi_too_high': {
      return 'Witness RSSI too high'
    }
    case 'witness_on_incorrect_channel': {
      return 'Witness on incorrect channel'
    }
    case 'witness_rssi_below_lower_bound': {
      return 'Witness RSSI below lower bound'
    }
    default: {
      return `${rawInvalidReason}`
    }
  }
}
