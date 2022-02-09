import React, { memo, useCallback, useState } from 'react'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { useTranslation } from 'react-i18next'
// import { useRoute } from '@react-navigation/native'
// import AddIcon from '@assets/images/add.svg'
import { Linking } from 'react-native'
import { useAsync } from 'react-async-hook'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/rootReducer'
import { useAppDispatch } from '../../../store/store'
import { fetchHotspotsData } from '../../../store/hotspots/hotspotsSlice'
import Box from '../../../components/Box'
import Text from '../../../components/Text'
// import Button from '../../../components/Button'
// import { RootNavigationProp } from '../../../navigation/main/tabTypes'
import useMount from '../../../utils/useMount'
import { EXPLORER_BASE_URL } from '../../../utils/config'
import { getAddress } from '../../../utils/secureAccount'

const HotspotsScreen = () => {
  const { t } = useTranslation()
  // const navigation = useNavigation<RootNavigationProp>()
  const [accountAddress, setAccountAddress] = useState('')

  // const route = useRoute()
  // console.log('MyLOG::HotspotsScreen::route:', route)

  const dispatch = useAppDispatch()

  useAsync(async () => {
    const account = await getAddress()
    console.log('MyLOG::accountAddress:', typeof account, account)
    setAccountAddress(account || '')
  }, [])

  const hotspots = useSelector(
    (state: RootState) => state.hotspots.hotspots.data,
  )
  console.log('MyLOG::HotspotsScreen::hotspots:', hotspots)

  useMount(() => {
    dispatch(fetchHotspotsData())
    // maybeGetLocation(false)
  })

  // const addHotspot = useCallback(() => navigation.push('HotspotSetup'), [
  //   navigation,
  // ])

  // const assertHotspot = useCallback(() => navigation.push('HotspotAssert'), [
  //   navigation,
  // ])

  const openExplorer = useCallback(
    () => Linking.openURL(`${EXPLORER_BASE_URL}/accounts/${accountAddress}`),
    [accountAddress],
  )

  return (
    <Box backgroundColor="primaryBackground" flex={1}>
      <BottomSheetModalProvider>
        <Box
          padding="l"
          flex={1}
          justifyContent="center"
          backgroundColor="primaryBackground"
        >
          <Text variant="h2">Hello Ruff</Text>
          <Text variant="body1" marginTop="ms">
            {/* {t('hotspots.empty.body')} */}
            accountAddress: {accountAddress}
          </Text>

          <Text variant="body1" marginTop="l">
            {t('hotspots.view_activity')}
            <Text variant="body1" color="primary" onPress={openExplorer}>
              {t('hotspots.explorer')}
            </Text>
            {t('generic.period')}
          </Text>
        </Box>
      </BottomSheetModalProvider>
    </Box>
  )
}

export default memo(HotspotsScreen)
