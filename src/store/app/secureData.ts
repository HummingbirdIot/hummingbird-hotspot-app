import { WalletLink } from '@helium/react-native-sdk'
// import { Keypair } from '@helium/crypto-react-native'
import * as SecureStore from 'expo-secure-store'

type AccountStoreKey = BooleanKey | StringKey | JSONKey

const userKeys = ['user.address', 'user.lastHNTBlance', 'user.lastFiatBlance']
const settingKeys = [
  'settings.userPin',
  'settings.authInterval',
  'settings.language',
  'settings.currencyType',
]
const stringKeys = [
  ...userKeys,
  ...settingKeys,
  'user.walletLinkToken',
] as const
type StringKey = typeof stringKeys[number]
const jsonKeys = ['user.watchingAddressesJSON'] as const
type JSONKey = typeof jsonKeys[number]

const boolKeys = [
  'isBackedUp',
  'user.isWatching',
  'settings.isPinRequired',
] as const
type BooleanKey = typeof boolKeys[number]

export const setSecureItem = async (
  key: AccountStoreKey,
  val: string | boolean,
) => SecureStore.setItemAsync(key, String(val))

export async function getSecureItem(key: BooleanKey): Promise<boolean>
export async function getSecureItem(
  key: StringKey | JSONKey,
): Promise<string | null>
export async function getSecureItem(key: AccountStoreKey) {
  const item = await SecureStore.getItemAsync(key)
  if (boolKeys.find((bk) => key === bk)) {
    return item === 'true'
  }
  return item
}

export const isWatching = async () => {
  const isWatcher = await getSecureItem('user.isWatching')
  return !!isWatcher
}

export const isLinkedIn = async () => {
  const token = await getSecureItem('user.walletLinkToken')
  return !!token
}

export const isAsWatcher = isWatching

export const isAsOwner = async () => {
  const isWatcher = await isWatching()
  if (isWatcher) return false
  const isOwner = await isLinkedIn()
  return isOwner
}

export const isSignedIn = async () => {
  const isWatcher = await isWatching()
  if (isWatcher) return true
  const isOwner = await isLinkedIn()
  return isOwner
}

export const getWatchingAddress = async () => {
  if (await isWatching()) {
    const address = await getSecureItem('user.address')
    if (address) return address
  }
  return null
}

export const parseLinkedAddress = (token: string) => {
  const parsed = WalletLink.parseWalletLinkToken(token)
  if (!parsed?.address) return null
  return parsed.address
}

export const getLinkedAddress = async () => {
  const token = await getSecureItem('user.walletLinkToken')
  if (!token) return null
  return parseLinkedAddress(token)
}

export const getAddress = async () => {
  let address = await getSecureItem('user.address')
  if (address) return address
  address = await getWatchingAddress()
  if (address) {
    setSecureItem('user.address', address)
    return address
  }
  address = await getLinkedAddress()
  if (address) {
    setSecureItem('user.address', address)
    return address
  }
  return null
}

export const deleteSecureItem = async (key: AccountStoreKey) =>
  SecureStore.deleteItemAsync(key)

const signOut = async () => {
  return Promise.all(
    [...userKeys, 'isBackedUp'].map((key) => deleteSecureItem(key)),
  )
}

export const unlinkAccount = async () => {
  await deleteSecureItem('user.walletLinkToken')
  return signOut()
}

export const endWatching = async () => {
  await setSecureItem('user.isWatching', false)
  return signOut()
}
