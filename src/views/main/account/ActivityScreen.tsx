import React, { memo, useState } from 'react'
import { ButtonGroup } from 'react-native-elements'
import { ColorSchemeName, useColorScheme } from 'react-native-appearance'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import Box from '../../../components/boxes/Box'
import ActivitiesList from '../../../components/lists/ActivityList/ListContainer'
import { useColors } from '../../../theme/themeHooks'
import { AccountFilterKeys } from '../../../store/txns/txnsTypes'
import DetailViewContainer from '../../../components/containers/DetailScreenContainer'
import { RootNavigationProp } from '../../navigation/rootNavigationTypes'
import { RootState } from '../../../store/rootReducer'

const ActivityScreen = () => {
  const navigation = useNavigation<RootNavigationProp>()
  const colorScheme: ColorSchemeName = useColorScheme()
  const { accountAddress: address } = useSelector(
    (state: RootState) => state.app.user,
  )

  const [selectedIndex, updateIndex] = useState(0)

  const [all, mining, payment, hotspot, pending] = AccountFilterKeys
  const buttons = [all, mining, payment, hotspot, pending]

  const { blueMain } = useColors()

  if (!address) {
    return <Box />
  }

  return (
    <DetailViewContainer
      title="Acitivity"
      goBack={() => {
        if (navigation.canGoBack()) {
          navigation.goBack()
        }
      }}
    >
      <Box
        flex={1}
        backgroundColor={
          colorScheme === 'light' ? 'surfaceContrast' : 'primaryBackground'
        }
      >
        <Box height={50}>
          <ButtonGroup
            onPress={updateIndex}
            selectedIndex={selectedIndex}
            buttons={buttons}
            containerStyle={{
              height: 36,
              backgroundColor: 'transparent',
              borderColor: blueMain,
            }}
            innerBorderStyle={{
              color: blueMain,
            }}
            selectedButtonStyle={{
              backgroundColor: blueMain,
              borderColor: blueMain,
            }}
            selectedTextStyle={{
              color: 'white',
            }}
            textStyle={{
              color: 'lightgray',
            }}
          />
        </Box>
        <Box
          flex={1}
          backgroundColor="white"
          borderTopStartRadius="l"
          borderTopEndRadius="l"
          style={{
            overflow: 'hidden',
          }}
        >
          <ActivitiesList
            address={address}
            filter={buttons[selectedIndex]}
            addressType="account"
          />
        </Box>
      </Box>
    </DetailViewContainer>
  )
}

export default memo(ActivityScreen)
