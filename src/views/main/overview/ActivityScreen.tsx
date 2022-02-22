/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { memo, useCallback, useEffect, useState } from 'react'
import { Linking, Platform, ScrollView } from 'react-native'
import { useSelector } from 'react-redux'
import { ButtonGroup, Header } from 'react-native-elements'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAsync } from 'react-async-hook'
import Box from '../../../components/Box'
import ActivitiesList from '../../../widgets/main/ActivitiesList/ListContainer'
import { useColors } from '../../../theme/themeHooks'
import {
  getLocation,
  getLocationPermission,
} from '../../../store/app/locationSlice'
import { RootState } from '../../../store/rootReducer'
import usePermissionManager from '../../../utils/hooks/usePermissionManager'
import { useAppDispatch } from '../../../store/store'
import useAlert from '../../../utils/hooks/useAlert'
import { getAddress } from '../../../utils/secureAccount'
import { AccountFilterKeys } from '../../../store/txns/txnsTypes'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ActivityScreen = ({ navigation }: any) => {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [address, setAccountAddress] = useState('')
  // const { showOKCancelAlert } = useAlert()
  const dispatch = useAppDispatch()
  // const { requestLocationPermission } = usePermissionManager()
  // const { currentLocation, permissionResponse, locationBlocked } = useSelector(
  //   (state: RootState) => state.location,
  // )

  const [selectedIndex, updateIndex] = useState(0)
  // const [coords, setUserCoords] = useState(
  //   currentLocation || { latitude: 0, longitude: 0 },
  // )

  // useEffect(() => {
  //   dispatch(getLocation()).then(() =>
  //     setUserCoords(currentLocation || { latitude: 0, longitude: 0 }),
  //   )
  // }, [currentLocation, dispatch])

  useAsync(async () => {
    const aacc = await getAddress()
    // console.log('OverviewScreen::address:', aacc)
    setAccountAddress(aacc || '')
  }, [])

  // const getLocation()

  // const checkLocation = useCallback(async () => {
  //   if (Platform.OS === 'ios') return true

  //   if (permissionResponse?.granted) {
  //     return true
  //   }

  //   if (!locationBlocked) {
  //     const response = await requestLocationPermission()
  //     if (response && response.granted) {
  //       return true
  //     }
  //   } else {
  //     const decision = await showOKCancelAlert({
  //       titleKey: 'permissions.location.title',
  //       messageKey: 'permissions.location.message',
  //       okKey: 'generic.go_to_settings',
  //     })
  //     if (decision) Linking.openSettings()
  //   }
  // }, [
  //   locationBlocked,
  //   permissionResponse?.granted,
  //   requestLocationPermission,
  //   showOKCancelAlert,
  // ])
  const [all, mining, payment, hotspot, pending] = AccountFilterKeys
  const buttons = [all, mining, payment, hotspot, pending]

  const { surfaceContrast } = useColors()

  if (!address) {
    return <Box />
  }

  return (
    <Box flex={1} style={{ backgroundColor: '#1a2637' }}>
      <Header
        backgroundColor={surfaceContrast}
        centerComponent={{
          text: 'Acitivity',
          // style: { fontSize: 20, color: '#fff' },
        }}
        leftComponent={{
          icon: 'arrow-back-ios',
          color: '#fff',
          onPress: () => {
            navigation.goBack()
          },
        }}
      />
      <Box flex={1} backgroundColor="primaryBackground">
        <ButtonGroup
          onPress={updateIndex}
          selectedIndex={selectedIndex}
          buttons={buttons}
          containerStyle={{ height: 36 }}
        />

        <Box
          flex={1}
          style={{
            paddingTop: 5,
            // paddingLeft: 10,
            // paddingRight: 10,
            paddingBottom: insets.bottom,
          }}
        >
          <ActivitiesList
            address={address}
            filter={buttons[selectedIndex]}
            addressType="account"
            // lng={coords.longitude}
            // lat={coords.latitude}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default memo(ActivityScreen)
