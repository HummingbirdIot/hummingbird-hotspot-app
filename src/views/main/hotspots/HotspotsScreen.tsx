import React, { memo, useEffect, useState } from 'react'
import { ScrollView } from 'react-native'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import Box from '../../../components/Box'
import { useAppDispatch } from '../../../store/store'
import { fetchHotspotsData } from '../../../store/data/hotspotsSlice'
import { RootState } from '../../../store/rootReducer'
import useMount from '../../../utils/hooks/useMount'

import { RootNavigationProp } from '../../navigation/naviTypes'
import HotspotListItem from './HotspotListItem'
import TabViewContainer from '../../../widgets/main/TabViewContainer'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const HotspotsScreen = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { t } = useTranslation()
  const navigation = useNavigation<RootNavigationProp>()

  const { hotspots, hotspotsData } = useSelector(
    (state: RootState) => state.hotspots,
  )
  const dispatch = useAppDispatch()

  const [addresses, setAddrresses] = useState<string[]>(hotspots.data || [])

  useEffect(() => {
    setAddrresses(hotspots.data)
    // console.log('HotspotsScreen::hotspotAddresses:', hotspots.data)
  }, [hotspots.data])

  useMount(() => {
    dispatch(fetchHotspotsData()).catch((error) =>
      console.log('HotspotsScreen::fetchHotspotsData:werror:', error),
    )
    // maybeGetLocation(false)
  })

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
          {addresses.map((address) => (
            <HotspotListItem
              key={address}
              hotspot={hotspotsData[address].hotspot}
              navigation={navigation}
            />
          ))}
        </ScrollView>
      </Box>
    </TabViewContainer>
  )
}

export default memo(HotspotsScreen)
