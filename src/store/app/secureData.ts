import { WalletLink } from '@helium/react-native-sdk'
// import { Keypair } from '@helium/crypto-react-native'
import * as SecureStore from 'expo-secure-store'

type AccountStoreKey = BooleanKey | StringKey

const stringKeys = [
  'user.explorationCode',
  'user.walletLinkToken',
  'user.address',
  'user.lastHNTBlance',
  'user.lastFiatBlance',

  'settings.userPin',
  'settings.authInterval',
  'settings.language',
  'settings.currencyType',
  // 'keypair',
  // 'hotspots/currentHotspot',
] as const
type StringKey = typeof stringKeys[number]

const boolKeys = [
  'isBackedUp',
  'user.isViewOnly',
  'settings.isPinRequired',
] as const
type BooleanKey = typeof boolKeys[number]

export const setSecureItem = async (
  key: AccountStoreKey,
  val: string | boolean,
) => SecureStore.setItemAsync(key, String(val))

export async function getSecureItem(key: BooleanKey): Promise<boolean>
export async function getSecureItem(key: StringKey): Promise<string | null>
export async function getSecureItem(key: AccountStoreKey) {
  const item = await SecureStore.getItemAsync(key)
  if (boolKeys.find((bk) => key === bk)) {
    return item === 'true'
  }
  return item
}

export const getAddress = async () => {
  const address = await getSecureItem('user.address')
  if (address) return address
  const token = await getSecureItem('user.walletLinkToken')
  if (!token) return null
  const parsed = WalletLink.parseWalletLinkToken(token)
  if (!parsed?.address) return null
  await setSecureItem('user.address', parsed.address)
  return parsed.address
}

export const deleteSecureItem = async (key: AccountStoreKey) =>
  SecureStore.deleteItemAsync(key)

export const signOut = async () => {
  return Promise.all(
    [...stringKeys, ...boolKeys].map((key) => deleteSecureItem(key)),
  )
}
