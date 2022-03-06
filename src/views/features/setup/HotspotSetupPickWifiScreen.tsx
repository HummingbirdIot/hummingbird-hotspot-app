import React, { useCallback, useMemo, useState } from 'react'
import { FlatList } from 'react-native'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { uniq } from 'lodash'
import { useHotspotBle } from '@helium/react-native-sdk'
import { useSelector } from 'react-redux'
import BackScreen from '../../../components/containers/BackScreenContainer'
import Text from '../../../components/texts/Text'
import {
  FeaturesNavigationProp,
  FeaturesStackParamList,
} from '../../navigation/features/featuresNavigationTypes'
import Box from '../../../components/boxes/Box'
import CarotRight from '../../../assets/images/carot-right.svg'
import { useColors } from '../../../theme/themeHooks'
import { DebouncedButton } from '../../../components/buttons/Button'
import TouchableOpacityBox from '../../../components/boxes/TouchableOpacityBox'
import Checkmark from '../../../assets/images/check.svg'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'
import { getAddress } from '../../../utils/secureData'
import { getHotspotDetails } from '../../../utils/clients/heliumDataClient'
import { RootState } from '../../../store/rootReducer'
import useAlert from '../../../utils/hooks/useAlert'

const WifiItem = ({
  name,
  isFirst = false,
  isLast = false,
  icon = 'carot',
  onPress,
}: {
  name: string
  isFirst?: boolean
  isLast?: boolean
  icon?: 'carot' | 'check'
  onPress?: () => void
}) => {
  const colors = useColors()
  return (
    <TouchableOpacityBox
      onPress={onPress}
      backgroundColor="white"
      padding="m"
      marginBottom="xxxs"
      flexDirection="row"
      justifyContent="space-between"
      borderTopLeftRadius={isFirst ? 'm' : 'none'}
      borderTopRightRadius={isFirst ? 'm' : 'none'}
      borderBottomLeftRadius={isLast ? 'm' : 'none'}
      borderBottomRightRadius={isLast ? 'm' : 'none'}
    >
      <Text variant="body2" color="black">
        {name}
      </Text>
      {icon === 'carot' && <CarotRight color={colors.secondaryBackground} />}
      {icon === 'check' && <Checkmark />}
    </TouchableOpacityBox>
  )
}

type Route = RouteProp<FeaturesStackParamList, 'HotspotSetupPickWifiScreen'>
const HotspotSetupPickWifiScreen = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<FeaturesNavigationProp>()
  const rootNav = useNavigation<RootNavigationProp>()

  const {
    params: {
      networks,
      connectedNetworks,
      hotspotAddress,
      addGatewayTxn,
      hotspotType,
      gatewayAction,
    },
  } = useRoute<Route>()
  const { readWifiNetworks } = useHotspotBle()

  const [wifiNetworks, setWifiNetworks] = useState(networks)
  const [connectedWifiNetworks, setConnectedWifiNetworks] =
    useState(connectedNetworks)
  const [scanning, setScanning] = useState(false)
  const { showOKCancelAlert } = useAlert()
  const handleClose = useCallback(() => rootNav.navigate('MainTabs'), [rootNav])

  const { walletLinkToken: token, isWatcher } = useSelector(
    (state: RootState) => state.app.user,
  )

  console.log(
    'HotspotSetupPickWifiScreen::wifiNetworks:',
    wifiNetworks,
    connectedWifiNetworks,
  )

  const hasNetworks = useMemo(() => {
    if (!wifiNetworks?.length) return false
    return wifiNetworks.length > 0
  }, [wifiNetworks])

  const navNext = (network: string) => {
    navigation.navigate('HotspotSetupWifiFormScreen', {
      gatewayAction,
      network,
      hotspotAddress,
      addGatewayTxn,
      hotspotType,
    })
  }

  const navLoaction = useCallback(() => {
    navigation.navigate('HotspotSetupEnableLocationScreen', {
      hotspotAddress,
      addGatewayTxn,
      hotspotType,
      gatewayAction,
    })
  }, [addGatewayTxn, gatewayAction, hotspotAddress, hotspotType, navigation])

  const navSkip = useCallback(async () => {
    console.log(
      'gatewayActiongatewayActiongatewayActiongatewayAction',
      gatewayAction,
    )
    if (gatewayAction === 'setWiFi') {
      if (rootNav.canGoBack()) {
        rootNav.goBack()
      } else {
        rootNav.navigate('MainTabs')
      }
    } else {
      if (!token) {
        if (isWatcher) {
          const decision = await showOKCancelAlert({
            titleKey: 'Warning',
            okKey: 'Next',
            cancelKey: 'Back to Home',
            messageKey:
              'You are undering the WATCHING MODE now, will not allowed to complete any transation action.',
          })
          if (!decision) {
            rootNav.navigate('MainTabs')
          }
        } else return
      }
      const address = await getAddress()
      // console.log('HotspotSetupPickWifiScreen::navSkip::address:', address)
      try {
        const hotspot = await getHotspotDetails(hotspotAddress)

        if (hotspot && hotspot.owner === address) {
          navigation.replace('OwnedHotspotErrorScreen')
        } else if (hotspot && hotspot.owner !== address) {
          navigation.replace('NotHotspotOwnerErrorScreen')
        } else {
          navLoaction()
        }
      } catch (error) {
        navLoaction()
      }
    }
  }, [
    gatewayAction,
    rootNav,
    token,
    isWatcher,
    showOKCancelAlert,
    hotspotAddress,
    navigation,
    navLoaction,
  ])

  const scanForNetworks = async () => {
    setScanning(true)
    const newNetworks = uniq((await readWifiNetworks(false)) || [])
    const newConnectedNetworks = uniq((await readWifiNetworks(true)) || [])
    setScanning(false)
    setWifiNetworks(newNetworks)
    setConnectedWifiNetworks(newConnectedNetworks)
  }

  return (
    <BackScreen
      padding="none"
      backgroundColor="primaryBackground"
      onClose={handleClose}
    >
      <Box
        backgroundColor="primaryBackground"
        padding="m"
        paddingTop="xl"
        alignItems="center"
      >
        <Text
          variant="h1"
          textAlign="center"
          marginBottom="m"
          maxFontSizeMultiplier={1}
        >
          {t('hotspot_setup.wifi_scan.title')}
        </Text>
        <Text
          variant="subtitle1"
          textAlign="center"
          marginBottom="m"
          maxFontSizeMultiplier={1.1}
        >
          {t('hotspot_setup.wifi_scan.subtitle')}
        </Text>
        <DebouncedButton
          loading={scanning}
          onPress={scanForNetworks}
          title={t('hotspot_setup.wifi_scan.scan_networks')}
          variant="primary"
          height={50}
          width="90%"
          marginVertical="s"
          disabled={scanning}
          mode="contained"
        />
      </Box>
      <Box paddingHorizontal="l" flex={1} backgroundColor="secondaryBackground">
        <FlatList
          data={wifiNetworks}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Box marginTop="l">
              {connectedWifiNetworks.length > 0 && (
                <Box marginBottom="m">
                  <Text
                    variant="body1"
                    marginBottom="s"
                    maxFontSizeMultiplier={1.2}
                  >
                    {t('hotspot_setup.wifi_scan.saved_networks')}
                  </Text>
                  {connectedWifiNetworks.map((network, index) => (
                    <WifiItem
                      key={network}
                      name={network}
                      isFirst={index === 0}
                      isLast={index === connectedWifiNetworks.length - 1}
                      icon="check"
                      onPress={navSkip}
                    />
                  ))}
                </Box>
              )}
              <Text
                variant="body1"
                marginBottom="s"
                maxFontSizeMultiplier={1.2}
                visible={hasNetworks}
              >
                {t('hotspot_setup.wifi_scan.available_networks')}
              </Text>
            </Box>
          }
          renderItem={({ item, index }) => (
            <WifiItem
              name={item}
              isFirst={index === 0}
              isLast={index === wifiNetworks.length - 1}
              onPress={() => navNext(item)}
            />
          )}
          ListEmptyComponent={
            <Box margin="l">
              <Text
                variant="body1"
                marginBottom="l"
                textAlign="center"
                color="primaryText"
              >
                {t('hotspot_setup.wifi_scan.not_found_title')}
              </Text>
              <Text variant="body1" textAlign="center" color="primaryText">
                {t('hotspot_setup.wifi_scan.not_found_desc')}
              </Text>
            </Box>
          }
        />
        <DebouncedButton
          variant="primary"
          title={t('hotspot_setup.wifi_scan.ethernet')}
          marginVertical="m"
          onPress={navSkip}
        />
      </Box>
    </BackScreen>
  )
}

export default HotspotSetupPickWifiScreen
