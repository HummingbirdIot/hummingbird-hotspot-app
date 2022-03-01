import HotspotIcon from './hummingbird.svg'
import { MakerHotspot } from '../hotspotMakerTypes'
import ANTENNAS from './antennas'

const HUMMINGBIRD_H500 = {
  name: 'Hummingbird H500',
  icon: HotspotIcon,
  onboardType: 'BLE',
  translations: {
    en: {
      internal: [
        {
          title: '[title.1]',
          body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          button: '[next button - 1]',
        },
        {
          title: '[title.2]',
          body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          button: '[next button - 2]',
        },
        {
          title: '[title.3]',
          body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
          button: '[finish button]',
        },
      ],
    },
    ja: {},
    ko: {},
    zh: {},
  },
  antenna: {
    default: ANTENNAS.HUMMINGBIRD_H500,
  },
} as MakerHotspot

export default {
  HUMMINGBIRD_H500,
  HUMMINGBIRD_H500CN: {
    ...HUMMINGBIRD_H500,
    name: 'Hummingbird H500CN',
  },
}
