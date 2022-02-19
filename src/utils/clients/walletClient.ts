import Config from 'react-native-config'
import { Platform } from 'react-native'
import { getVersion } from 'react-native-device-info'

const breadcrumbOpts = { type: 'HTTP Request', category: 'walletClient' }

const userAgent = `hummingbird-hotspot-app-${getVersion()}-${
  Platform.OS
}-wallet-client`
let network = 'stakejoy'

export const updateNetwork = (nextNetwork: string) => {
  network = nextNetwork
}

export const getWalletExt = async (url: string) => {
  // console.log(`walletClient::getWalletExt::httpRequest GET ${url}`, breadcrumbOpts)
  try {
    const baseUrl = Config.WALLET_API_BASE_URL.replace('/api', '/ext/api')
    const route = [baseUrl, url].join('/')

    const response = await fetch(route, {
      method: 'GET',
      headers: {
        network,
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'User-Agent': userAgent,
      },
    })

    if (!response.ok) {
      const errorMessage = `Bad response, status:${response.status} message:${response.statusText} GET url:${route}`
      console.log(errorMessage, breadcrumbOpts)
      throw new Error(errorMessage)
    }

    const text = await response.text()
    try {
      const json = JSON.parse(text)
      const responseData = json.data || json
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      responseData.serverDate = response.headers.map?.date
      return responseData
    } catch (err) {
      return text
    }
  } catch (error) {
    console.log('fetch failed', breadcrumbOpts)
    throw error
  }
}
