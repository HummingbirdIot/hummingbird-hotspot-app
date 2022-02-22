import Client, { Bucket, Hotspot, Network, PocReceiptsV1 } from '@helium/http'
import { heliumHttpClient } from '@helium/react-native-sdk'
import { Platform } from 'react-native'
import { getVersion } from 'react-native-device-info'
import { subDays } from 'date-fns'
import { Transaction } from '@helium/transactions'
import { getAddress } from '../secureAccount'
import { fromNow } from '../timeUtils'
import {
  AccountFilters,
  AccountFilterType,
  HotspotFilters,
  HotspotFilterType,
} from '../../store/txns/txnsTypes'

const MAX = 100000
const userAgent = `helium-hotspot-app-${getVersion()}-${Platform.OS}-js-client`

// let network = networkName === 'helium' ? Network.production : Network.stakejoy

const network = new Network({
  baseURL: 'https://helium-api.stakejoy.com',
  version: 1,
})
const client = new Client(network, {
  retry: 1,
  name: userAgent,
  userAgent,
})

const breadcrumbOpts = { type: 'HTTP Request', category: 'appDataClient' }

export const submitTxn = async (txn: string) => {
  return heliumHttpClient.transactions.submit(txn)
}

export const getHotspotDetails = async (address: string): Promise<Hotspot> => {
  return heliumHttpClient.hotspots.get(address)
}

export const configChainVars = async () => {
  const vars = await client.vars.getTransactionVars()
  Transaction.config(vars)
}

export const getAccount = async (address?: string) => {
  if (!address) return

  const { data } = await heliumHttpClient.accounts.get(address)
  return data
}

export const getBlockHeight = (params?: { maxTime?: string }) => {
  return heliumHttpClient.blocks.getHeight(params)
}

export const getBlockStats = () => {
  return client.blocks.stats()
}

export const getStatCounts = () => {
  return client.stats.counts()
}

export const getCurrentOraclePrice = async () => {
  return heliumHttpClient.oracle.getCurrentPrice()
}

export const getPredictedOraclePrice = async () => {
  return heliumHttpClient.oracle.getPredictedPrice()
}

export const hotspotOnChain = async (address: string) => {
  try {
    await getHotspotDetails(address)
    return true
  } catch (error) {
    return false
  }
}

export const getHotspots = async () => {
  console.log('getHotspots', breadcrumbOpts)
  const address = await getAddress()
  if (!address) return []
  // console.log('getHotspots::address:', address)

  try {
    const newHotspotList = await client.account(address).hotspots.list()
    // console.log('getHotspots::newHotspotList:', newHotspotList)
    return newHotspotList.takeJSON(MAX)
  } catch (error) {
    console.log('getHotspots::newHotspotList::error', error)
  }
}

const getRewardsRange = (numDaysBack: number) => {
  const startOfToday = new Date()
  startOfToday.setUTCHours(0, 0, 0, 0)
  const maxTime = startOfToday
  const minTime = subDays(startOfToday, numDaysBack)
  return { maxTime, minTime }
}

export const getAccountRewards = async (
  address: string,
  numDaysBack: number,
  bucket: Bucket = 'day',
) => {
  console.log('getAccountRewards', breadcrumbOpts)

  const list = await client
    .account(address) // '13YxjCpiGrbDtbthrPAH2zrJKCk5UajQHJRfqtSSmqTE8924Q65')
    .rewards.sum.list({ ...getRewardsRange(numDaysBack), bucket })
  return list.take(MAX)
}

export const getHotspotRewards = async (
  address: string,
  numDaysBack: number,
  bucket: Bucket = 'day',
) => {
  console.log('getHotspotRewards', breadcrumbOpts)

  const list = await client
    .hotspot(address)
    .rewards.sum.list({ ...getRewardsRange(numDaysBack), bucket })
  return list.take(MAX)
}

export const getValidatorRewards = async (
  address: string,
  numDaysBack: number,
  bucket: Bucket = 'day',
) => {
  console.log('getValidatorRewards', breadcrumbOpts)
  const list = await client
    .validator(address)
    .rewards.sum.list({ ...getRewardsRange(numDaysBack), bucket })
  return list.take(MAX)
}

export const getPendingTransactions = async (gateway: string) => {
  console.log('getPendingTransactions', breadcrumbOpts)
  return (await client.account(gateway).pendingTransactions.list()).data
}

export const getAccountActivityList = async (
  gateway: string,
  filterType: AccountFilterType,
  cursor: string | undefined = undefined,
) => {
  console.log('getAccountActivityList', breadcrumbOpts, !cursor)
  const params = {
    filterTypes: AccountFilters[filterType],
    cursor,
  }
  return client.account(gateway).activity.list(params)
}

export const getAccountRolesList = async (
  gateway: string,
  filterType: AccountFilterType,
  cursor: string | undefined = undefined,
) => {
  console.log('getAccountRolesList', breadcrumbOpts)
  const params = {
    filterTypes: AccountFilters[filterType],
    cursor,
  }
  return client.account(gateway).roles.list(params)
}

export const getHotspotActivityList = async (
  gateway: string,
  filterType: HotspotFilterType,
  cursor: string | undefined = undefined,
) => {
  console.log('getHotspotActivityList', breadcrumbOpts)
  const params = {
    filterTypes: HotspotFilters[filterType],
    cursor,
  }
  return client.hotspot(gateway).activity.list(params)
}

export const getHotspotRolesList = async (
  gateway: string,
  filterType: HotspotFilterType,
  cursor: string | undefined = undefined,
) => {
  console.log('getHotspotRolesList', breadcrumbOpts)
  const params = {
    filterTypes: HotspotFilters[filterType],
    cursor,
  }
  return client.hotspot(gateway).roles.list(params)
}

export const getWitnessesHotspots = async (address: string) => {
  console.log('getWitnessedHotspots', breadcrumbOpts)
  const list = await client.hotspot(address).witnesses.list()
  return list.take(MAX)
}

export const getWitnessedHotspots = async (address: string) => {
  console.log('getWitnessedHotspots', breadcrumbOpts)
  const list = await client.hotspot(address).witnessed.list()
  return list.take(MAX)
}

export const getChainVars = async (keys?: string[]) => {
  return heliumHttpClient.vars.get(keys)
}

export const getHotspotsLastChallengeActivity = async (
  gatewayAddress: string,
) => {
  const hotspotActivityList = await heliumHttpClient
    .hotspot(gatewayAddress)
    .activity.list({
      filterTypes: ['poc_receipts_v1', 'poc_request_v1'],
    })
  const [lastHotspotActivity] = hotspotActivityList
    ? await hotspotActivityList?.take(1)
    : []
  if (lastHotspotActivity && lastHotspotActivity.time) {
    const dateLastActive = new Date(lastHotspotActivity.time * 1000)
    return {
      block: (lastHotspotActivity as PocReceiptsV1).height,
      text: fromNow(dateLastActive)?.toUpperCase(),
    }
  }
  return {}
}
