import React, { memo, useMemo, useState } from 'react'
import QRCode from 'react-qr-code'
import { Account } from '@helium/http'
import { useNavigation } from '@react-navigation/native'
import { ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Clipboard from '@react-native-community/clipboard'
import { useTranslation } from 'react-i18next'
import Box from '../../../components/Box'
import DashboardItem from './DashboardItem'
import {
  MainTabNavigationProp,
  RootNavigationProp,
} from '../../../views/navigation/naviTypes'
import BottomModal from '../../modals/BottomModal'
import { useColors, useSpacing } from '../../../theme/themeHooks'
import { Spacing } from '../../../theme/theme'
import Text from '../../../components/Text'
import useAlert from '../../../utils/hooks/useAlert'

const QR_CONTAINER_SIZE = 146

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Dashboard = ({ account }: { account?: Account }) => {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const spacing = useSpacing()
  const { primaryBackground, primaryText } = useColors()
  const padding = useMemo(() => 'm' as Spacing, [])
  const navigation = useNavigation<MainTabNavigationProp>()
  const rootNav = useNavigation<RootNavigationProp>()
  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const { showOKAlert } = useAlert()

  return (
    <Box>
      <Box
        padding="m"
        paddingBottom="s"
        flexDirection="row"
        justifyContent="space-around"
      >
        <DashboardItem.Number
          item="DC Balance"
          value={account?.dcBalance?.floatBalance.toFixed(5) || '0.00000'}
        />
        <DashboardItem.Number
          item="Staked Balance"
          value={account?.stakedBalance?.floatBalance.toFixed(5) || '0.00000'}
        />
      </Box>
      <Box
        flex={1}
        padding="m"
        paddingTop="s"
        flexDirection="row"
        justifyContent="space-around"
      >
        <DashboardItem.Number
          item="Hotspots"
          value={(account?.hotspotCount || 0).toString()}
          onPress={() => navigation.navigate('Hotspots')}
        />
        <DashboardItem.Number
          item="Validators"
          value={(account?.validatorCount || 0).toString()}
        />
        <DashboardItem.Icon
          name="qr-code"
          onPress={() => setModalVisible(true)}
        />
        <DashboardItem.Icon
          name="add"
          onPress={() => rootNav.navigate('HotspotSetup')}
        />
      </Box>
      <BottomModal
        title="Account Address"
        modalVisible={modalVisible}
        handleClose={() => setModalVisible(false)}
        contentHeight={320 + insets.bottom}
      >
        <Box flex={1} style={{ marginBottom: insets.bottom }}>
          <Box
            flex={1}
            flexDirection="row"
            justifyContent="center"
            alignItems="center"
          >
            {account ? (
              <QRCode
                size={QR_CONTAINER_SIZE - 2 * spacing[padding]}
                value={account.address}
                bgColor={primaryBackground}
                fgColor={primaryText}
              />
            ) : (
              <ActivityIndicator
                color="gray"
                size={QR_CONTAINER_SIZE - 2 * spacing[padding]}
              />
            )}
          </Box>
          <Text
            variant="body2"
            textAlign="center"
            marginBottom="xl"
            onPress={() => {
              if (account) {
                Clipboard.setString(account.address)
                showOKAlert({
                  titleKey: 'generic.success',
                  messageKey:
                    'account address has been copied to your clipboard.',
                })
              }
            }}
          >
            {account
              ? `${account.address}  [${t('click to copy')}]`
              : 'Loading Account Info...'}
          </Text>
        </Box>
      </BottomModal>
    </Box>
  )
}

export default memo(Dashboard)
