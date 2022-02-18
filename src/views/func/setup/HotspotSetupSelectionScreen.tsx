import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import React, { memo, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList } from 'react-native-gesture-handler'
import { Edge } from 'react-native-safe-area-context'
import { Linking, Platform } from 'react-native'
import { useHotspotBle } from '@helium/react-native-sdk'
import { useSelector } from 'react-redux'
import usePermissionManager from '../../../utils/usePermissionManager'
import BackScreen from '../../../components/BackScreen'
import Box from '../../../components/Box'
import Text from '../../../components/Text'
import HotspotSetupSelectionListItem from '../../../widgets/func/HotspotSetupSelectionListItem'
import {
  HotspotSetupNavigationProp,
  HotspotSetupStackParamList,
} from '../../navi/func/hotspotSetupTypes'
import {
  HotspotType,
  HotspotModelKeys,
  HotspotMakerModels,
} from '../../../makers'
import { useBorderRadii } from '../../../theme/themeHooks'
import useAlert from '../../../utils/useAlert'
import { RootState } from '../../../store/rootReducer'
import { getLocationPermission } from '../../../store/location/locationSlice'
import { useAppDispatch } from '../../../store/store'

const ItemSeparatorComponent = () => (
  <Box height={1} backgroundColor="primaryBackground" />
)

type Route = RouteProp<
  HotspotSetupStackParamList,
  'HotspotSetupSelectionScreen'
>
const HotspotSetupSelectionScreen = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<HotspotSetupNavigationProp>()
  const edges = useMemo((): Edge[] => ['top', 'left', 'right'], [])
  const radii = useBorderRadii()

  const { params } = useRoute<Route>()
  const { enable, getState } = useHotspotBle()
  const { showOKCancelAlert } = useAlert()
  const dispatch = useAppDispatch()
  const { requestLocationPermission } = usePermissionManager()
  const { permissionResponse, locationBlocked } = useSelector(
    (state: RootState) => state.location,
  )

  useEffect(() => {
    getState()
    dispatch(getLocationPermission())
  }, [dispatch, getState])

  const checkBluetooth = useCallback(async () => {
    const state = await getState()

    if (state === 'PoweredOn') {
      return true
    }

    if (Platform.OS === 'ios') {
      if (state === 'PoweredOff') {
        const decision = await showOKCancelAlert({
          titleKey: 'hotspot_setup.pair.alert_ble_off.title',
          messageKey: 'hotspot_setup.pair.alert_ble_off.body',
          okKey: 'generic.go_to_settings',
        })
        if (decision) Linking.openURL('App-Prefs:Bluetooth')
      } else {
        const decision = await showOKCancelAlert({
          titleKey: 'hotspot_setup.pair.alert_ble_off.title',
          messageKey: 'hotspot_setup.pair.alert_ble_off.body',
          okKey: 'generic.go_to_settings',
        })
        if (decision) Linking.openURL('app-settings:')
      }
    }
    if (Platform.OS === 'android') {
      await enable()
      return true
    }
  }, [enable, getState, showOKCancelAlert])

  const checkLocation = useCallback(async () => {
    if (Platform.OS === 'ios') return true

    if (permissionResponse?.granted) {
      return true
    }

    if (!locationBlocked) {
      const response = await requestLocationPermission()
      if (response && response.granted) {
        return true
      }
    } else {
      const decision = await showOKCancelAlert({
        titleKey: 'permissions.location.title',
        messageKey: 'permissions.location.message',
        okKey: 'generic.go_to_settings',
      })
      if (decision) Linking.openSettings()
    }
  }, [
    locationBlocked,
    permissionResponse?.granted,
    requestLocationPermission,
    showOKCancelAlert,
  ])

  const handlePress = useCallback(
    (hotspotType: HotspotType) => async () => {
      const { onboardType } = HotspotMakerModels[hotspotType]
      console.log(
        'HotspotSetupSelectionScreen::onboardType:',
        hotspotType,
        onboardType,
      )
      if (onboardType === 'BLE') {
        // navigation.push('HotspotSetupEducationScreen', {
        //   hotspotType,
        //   ...params,
        // })
        await checkBluetooth()
        await checkLocation()
        navigation.push('HotspotSetupScanningScreen', {
          ...params,
          hotspotType,
        })
      } else {
        navigation.push('HotspotSetupExternalScreen', {
          hotspotType,
          ...params,
        })
      }
    },
    [checkBluetooth, checkLocation, navigation, params],
  )

  const keyExtractor = useCallback((item) => item, [])

  const data = useMemo(() => {
    return HotspotModelKeys
  }, [])

  const renderItem = useCallback(
    ({ item, index }) => {
      const isFirst = index === 0
      const isLast = index === data.length - 1
      return (
        <HotspotSetupSelectionListItem
          isFirst={isFirst}
          isLast={isLast}
          hotspotType={item}
          onPress={handlePress(item)}
        />
      )
    },
    [data.length, handlePress],
  )

  const flatListStyle = useMemo(() => {
    return { flex: 1, borderRadius: radii.m }
  }, [radii.m])

  return (
    <BackScreen
      backgroundColor="primaryBackground"
      paddingTop="m"
      padding="lx"
      hideBack
      onClose={navigation.goBack}
      edges={edges}
    >
      <Text variant="h1" numberOfLines={2} adjustsFontSizeToFit>
        {t('hotspot_setup.selection.title')}
      </Text>
      <Text
        variant="subtitle1"
        maxFontSizeMultiplier={1}
        numberOfLines={2}
        adjustsFontSizeToFit
        marginVertical="l"
      >
        {t('hotspot_setup.selection.subtitle')}
      </Text>

      <FlatList
        style={flatListStyle}
        ItemSeparatorComponent={ItemSeparatorComponent}
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListFooterComponent={<Box height={32} />}
      />
    </BackScreen>
  )
}

export default memo(HotspotSetupSelectionScreen)
