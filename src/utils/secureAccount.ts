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
  'walletApiToken',
  'keypair',
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
  // return '13YxjCpiGrbDtbthrPAH2zrJKCk5UajQHJRfqtSSmqTE8924Q65'
  const token = await getSecureItem('walletLinkToken')
  if (!token) return
  const parsed = WalletLink.parseWalletLinkToken(token)
  if (!parsed?.address) return
  const { address } = parsed
  return address
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

const makeSignature = async (token: { address: string; time: number }) => {
  const stringifiedToken = JSON.stringify(token)
  const keypair = await getKeypair()
  if (!keypair) return
  const buffer = await keypair.sign(stringifiedToken)

  return buffer.toString('base64')
}

const makeWalletApiToken = async (address: string) => {
  const time = Math.floor(Date.now() / 1000)

  const token = {
    address,
    time,
  }

  const signature = await makeSignature(token)

  const signedToken = { ...token, signature }
  return Buffer.from(JSON.stringify(signedToken)).toString('base64')
}

export const getWalletApiToken = async () => {
  const existingToken = await getSecureItem('walletApiToken')
  if (existingToken) return existingToken

  // const address = await getSecureItem('address')
  const address = await getAddress()
  console.log('address', address)
  if (!address) return

  const apiToken = await makeWalletApiToken(address)
  console.log('apiToken', apiToken)
  await setSecureItem('walletApiToken', apiToken)
  return apiToken
}
