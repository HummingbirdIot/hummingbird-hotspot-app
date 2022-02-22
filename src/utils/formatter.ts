import { Maker } from '@helium/onboarding'
import { B58Address } from 'src/store/txns/txnsTypes'

export const HELIUM_OLD_MAKER_ADDRESS =
  '14fzfjFcHpDR1rTH8BNPvSi5dKBbgxaDnmsVPbCjuq9ENjpZbxh'

export const HUMMINGBIRD_MAKER_ADDRESS =
  '14DdSjvEkBQ46xQ24LAtHwQkAeoUUZHfGCosgJe33nRQ6rZwPG3'

export const formatHotspotName = (name: string) => {
  return name.split('-').map((str) => {
    return str.replace(/^\w/, (c) => c.toLocaleUpperCase())
  })
}

export const formatHotspotTitle = (name: string) => {
  return name
    .split('-')
    .filter((s, i) => i !== 1)
    .map((str) => {
      return str[0].toLocaleUpperCase()
    })
    .join('')
}

export const getMakerName = (
  payer: B58Address | undefined,
  makers: Maker[] | undefined,
) => {
  if (payer === HUMMINGBIRD_MAKER_ADDRESS) {
    return 'Hummingbird'
  }
  if (payer === HELIUM_OLD_MAKER_ADDRESS) {
    // special case for old Helium Hotspots
    return 'Helium'
  }
  return makers?.find((m) => m.address === payer)?.name || 'Unknown Maker'
}

export const truncateAddress = (
  address: string,
  startKeep = 10,
  endKeep = 7,
) => {
  // console.log('truncateAddress::address:', address)
  const start = address.slice(0, startKeep)
  const end = address.slice(address.length - endKeep)
  return `${start}...${end}`
}
