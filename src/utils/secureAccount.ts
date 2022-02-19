import { WalletLink } from '@helium/react-native-sdk'
import { Keypair } from '@helium/crypto-react-native'
import * as SecureStore from 'expo-secure-store'

type AccountStoreKey = BooleanKey | StringKey

const stringKeys = [
  'userPin',
  'authInterval',
  'language',
  'walletLinkToken',
  'address',
  'keypair',
  'currentHotspot',
] as const
type StringKey = typeof stringKeys[number]

const boolKeys = ['accountBackedUp', 'requirePin'] as const
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
  const address = await getSecureItem('address')
  if (address) return address
  const token = await getSecureItem('walletLinkToken')
  if (!token) return null
  const parsed = WalletLink.parseWalletLinkToken(token)
  if (!parsed?.address) return null
  await setSecureItem('address', parsed.address)
  return parsed.address
}

export const deleteSecureItem = async (key: AccountStoreKey) =>
  SecureStore.deleteItemAsync(key)

export const signOut = async () => {
  return Promise.all(
    [...stringKeys, ...boolKeys].map((key) => deleteSecureItem(key)),
  )
}

export const getKeypair = async (): Promise<Keypair | undefined> => {
  const keypairStr = await getSecureItem('keypair')
  if (keypairStr) {
    const keypairRaw = JSON.parse(keypairStr)
    return new Keypair(keypairRaw)
  }
}
