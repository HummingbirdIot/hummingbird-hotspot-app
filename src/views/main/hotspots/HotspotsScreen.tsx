import React, { memo, useEffect, useState } from 'react'
import { ActivityIndicator, ScrollView } from 'react-native'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import Box from '../../../components/boxes/Box'
import { useAppDispatch } from '../../../store/store'
import { fetchHotspotsData } from '../../../store/data/hotspotsSlice'
import { RootState } from '../../../store/rootReducer'
// import useMount from '../../../utils/hooks/useMount'

import { RootNavigationProp } from '../../navigation/rootNavigationTypes'
import HotspotListItem from '../../../components/elements/HotspotListItem'
import TabViewContainer from '../../../components/containers/TabViewContainer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HotspotsScreen = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation()
  const navigation = useNavigation<RootNavigationProp>()

  const { accountAddress } = useSelector((state: RootState) => state.app.user)
  const { hotspots, hotspotsData, hotspotsLoaded } = useSelector(
    (state: RootState) => state.hotspots,
  )
  const dispatch = useAppDispatch()

  const [addresses, setAddrresses] = useState<string[]>(hotspots.data || [])

  useEffect(() => {
    setAddrresses(hotspots.data)
    // console.log('HotspotsScreen::hotspotAddresses:', hotspots.data)
  }, [hotspots.data])

  useEffect(() => {
    dispatch(fetchHotspotsData()).catch((error) =>
      console.log('HotspotsScreen::fetchHotspotsData:error:', error),
    )
  }, [accountAddress, dispatch])

  return (
    <TabViewContainer
      title="Hotspots"
      icons={[
        {
          name: 'add',
          onPress: () => navigation.navigate('HotspotSetup'),
        },
      ]}
    >
      <Box flex={1}>
        <ScrollView>
          {hotspotsLoaded ? (
            addresses.map((address) => (
              <HotspotListItem
                key={address}
                hotspot={hotspotsData[address].hotspot}
                navigation={navigation}
              />
            ))
          ) : (
            <ActivityIndicator size={200} />
          )}
        </ScrollView>
      </Box>
    </TabViewContainer>
  )
}

export default memo(HotspotsScreen)
