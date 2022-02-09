import Client, {
  Bucket,
  Hotspot,
  // NaturalDate,
  Network,
  // PocReceiptsV1,
  // Validator,
} from '@helium/http'
import { heliumHttpClient } from '@helium/react-native-sdk'
import { Platform } from 'react-native'
import { getVersion } from 'react-native-device-info'
import { subDays } from 'date-fns'
import { getAddress } from './secureAccount'

const MAX = 100000
const userAgent = `hummingbird-hotspot-app-${getVersion()}-${
  Platform.OS
}-js-client`

const client = new Client(Network.production, {
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

export const getAccount = async (address?: string) => {
  if (!address) return

  const { data } = await heliumHttpClient.accounts.get(address)
  return data
}

export const getBlockHeight = (params?: { maxTime?: string }) => {
  return heliumHttpClient.blocks.getHeight(params)
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

// export const getAddress = async () => {
//   console.log('getAddress', breadcrumbOpts)
//   return getSecureItem('address')
// }

export const getHotspots = async () => {
  // console.log('MyLOG::getHotspots', breadcrumbOpts)
  const address = await getAddress()
  if (!address) return []
  // console.log('MyLOG::getHotspots::address:', address)

  try {
    const newClient = client.account(address)
    // console.log('MyLOG::getHotspots::newClient:', newClient)
    const newHotspots = newClient.hotspots
    // console.log('MyLOG::getHotspots::newHotspots:', newHotspots)
    const newHotspotList = await newHotspots.list()
    // console.log('MyLOG::getHotspots::newHotspotList:', newHotspotList)
    return newHotspotList.takeJSON(MAX)
  } catch (error) {
    console.log('MyLOG::getHotspots::newHotspotList::error', error)
  }
}

const getRewardsRange = (numDaysBack: number) => {
  const startOfToday = new Date()
  startOfToday.setUTCHours(0, 0, 0, 0)
  const maxTime = startOfToday
  const minTime = subDays(startOfToday, numDaysBack)
  return { maxTime, minTime }
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
