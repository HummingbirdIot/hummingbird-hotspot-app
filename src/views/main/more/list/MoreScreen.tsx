import React, {
  memo,
  ReactText,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, SectionList } from 'react-native'
import { useSelector } from 'react-redux'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { isEqual } from 'lodash'
import { Edge } from 'react-native-safe-area-context'
import { WalletLink } from '@helium/react-native-sdk'
import { useAsync } from 'react-async-hook'
import Config from 'react-native-config'
import SafeAreaBox from '../../../../components/SafeAreaBox'
import Text from '../../../../components/Text'
import { RootState } from '../../../../store/rootReducer'
import { useAppDispatch } from '../../../../store/store'
import appSlice from '../../../../store/user/appSlice'
import { MoreNavigationProp, MoreStackParamList } from '../moreTypes'
import {
  RootNavigationProp,
  RootStackParamList,
} from '../../../navigation/naviTypes'
import MoreListItem, { MoreListItemType } from './MoreListItem'
import useAuthIntervals from './useAuthIntervals'
import { useSpacing } from '../../../../theme/themeHooks'
import Box from '../../../../components/Box'
import { SUPPORTED_LANGUAGUES } from '../../../../utils/i18n/i18nTypes'
import { useLanguageContext } from '../../../../providers/LanguageProvider'
import { getSecureItem } from '../../../../utils/secureAccount'
import { clearMapCache } from '../../../../utils/mapUtils'
import Articles from '../../../../constants/articles'
import useAlert from '../../../../utils/hooks/useAlert'
import Security from '../../../../assets/images/security.svg'
import Learn from '../../../../assets/images/learn.svg'
// import Contact from '../../../../assets/images/account.svg'
import Account from '../../../../assets/images/account.svg'
import { SUPPORTED_CURRENCIES } from '../../../../utils/hooks/useCurrency'
import { updateSetting } from '../../../../store/account/accountSlice'

const Contact = Account

type Route = RouteProp<RootStackParamList & MoreStackParamList, 'MoreScreen'>
const MoreScreen = () => {
  const { t } = useTranslation()
  const { params } = useRoute<Route>()
  const dispatch = useAppDispatch()
  const app = useSelector((state: RootState) => state.app, isEqual)
  const authIntervals = useAuthIntervals()
  const navigation = useNavigation<MoreNavigationProp & RootNavigationProp>()
  const spacing = useSpacing()
  const { changeLanguage, language } = useLanguageContext()
  const [address, setAddress] = useState('')
  const { showOKCancelAlert } = useAlert()
  const account = useSelector((state: RootState) => state.account, isEqual)

  useAsync(async () => {
    const token = await getSecureItem('walletLinkToken')
    if (!token) return ''
    const parsedToken = WalletLink.parseWalletLinkToken(token)

    const truncatedAddress = [
      parsedToken.address.slice(0, 8),
      parsedToken.address.slice(-8),
    ].join('...')
    setAddress(truncatedAddress)
  }, [])

  useEffect(() => {
    if (!params?.pinVerifiedFor) return

    const { pinVerifiedFor } = params

    switch (pinVerifiedFor) {
      case 'disablePin':
        dispatch(appSlice.actions.disablePin())
        break
      case 'resetPin':
        navigation.push('AccountCreatePinScreen', { pinReset: true })
        break
    }
  }, [dispatch, params, navigation])

  const handleLanguageChange = useCallback(
    (lng: string) => {
      changeLanguage(lng)
    },
    [changeLanguage],
  )

  const handleCurrencyTypeChange = useCallback(
    (currencyType: string) => {
      dispatch(
        updateSetting({
          key: 'currencyType',
          value: currencyType,
        }),
      )
    },
    [dispatch],
  )

  const handlePinRequired = useCallback(
    (value?: boolean) => {
      if (!app.isPinRequired && value) {
        // toggling on
        navigation.push('AccountCreatePinScreen', { pinReset: true })
      }

      if (app.isPinRequired && !value) {
        // toggling off, confirm pin before turning off
        navigation.push('LockScreen', { requestType: 'disablePin' })
      }
    },
    [app.isPinRequired, navigation],
  )

  const handleResetPin = useCallback(() => {
    navigation.push('LockScreen', { requestType: 'resetPin' })
  }, [navigation])

  const handleSignOut = useCallback(() => {
    Alert.alert(
      t('more.sections.app.signOutAlert.title'),
      t('more.sections.app.signOutAlert.body'),
      [
        {
          text: t('generic.cancel'),
          style: 'cancel',
        },
        {
          text: t('more.sections.app.signOut'),
          style: 'destructive',
          onPress: () => {
            dispatch(appSlice.actions.signOut())
          },
        },
      ],
    )
  }, [t, dispatch])

  const handleIntervalSelected = useCallback(
    (value: ReactText) => {
      const number = typeof value === 'number' ? value : parseInt(value, 10)
      dispatch(appSlice.actions.updateAuthInterval(number))
    },
    [dispatch],
  )

  const handleClearMapCache = useCallback(async () => {
    const decision = await showOKCancelAlert({
      titleKey: 'more.sections.app.clearMapCacheAlert.title',
      messageKey: 'more.sections.app.clearMapCacheAlert.body',
    })
    if (!decision) return
    await clearMapCache()
  }, [showOKCancelAlert])

  const SectionData = useMemo(() => {
    let pin: MoreListItemType[] = [
      {
        title: t('more.sections.security.enablePin'),
        onToggle: handlePinRequired,
        value: app.isPinRequired,
      },
    ]

    if (app.isPinRequired) {
      pin = [
        ...pin,
        {
          title: t('more.sections.security.requirePin'),
          value: app.authInterval || '',
          select: {
            items: authIntervals,
            onValueSelect: handleIntervalSelected,
          },
        },
        {
          title: t('more.sections.security.resetPin'),
          onPress: handleResetPin,
        },
      ]
    }

    return [
      {
        title: t('more.sections.security.title'),
        icon: <Security />,
        data: pin,
      },
      {
        title: t('more.sections.learn.title'),
        icon: <Learn />,
        data: [
          {
            title: t('more.sections.learn.tokenEarnings'),
            openUrl: Articles.Token_Earnings,
          },
          {
            title: t('more.sections.learn.heliumtoken'),
            openUrl: Articles.Helium_Token,
          },
          {
            title: t('more.sections.learn.coverage'),
            openUrl: `${Config.EXPLORER_BASE_URL}/coverage`,
          },
          {
            title: t('more.sections.learn.troubleshooting'),
            openUrl: Articles.Docs_Root,
          },
        ] as MoreListItemType[],
        // footer: <DiscordItem />,
      },

      {
        title: 'Contact Us',
        icon: <Contact />,
        data: [
          {
            title: 'Twitter',
            openUrl: 'https://twitter.com/hummingbird_66',
          },
          {
            title: 'Telegram',
            openUrl: 'https://t.me/HummingbirdCommunity',
          },
          {
            title: 'Discord',
            openUrl: 'https://discord.com/invite/XVR7fRKaDd',
          },
        ],
      },
      {
        title: t('more.sections.app.title'),
        icon: <Account />,
        data: [
          {
            title: t('more.sections.app.language'),
            value: language,
            select: {
              items: SUPPORTED_LANGUAGUES,
              onValueSelect: handleLanguageChange,
            },
          },
          {
            title: t('more.sections.app.currency'),
            value: account.settings.currencyType || 'USD',
            select: {
              items: Object.keys(SUPPORTED_CURRENCIES).map((p) => {
                return {
                  label: `${p}  ${SUPPORTED_CURRENCIES[p]}`,
                  labelShort: p,
                  value: p,
                }
              }),
              onValueSelect: handleCurrencyTypeChange,
            },
          },
          {
            title: t('more.sections.app.clearMapCache'),
            onPress: handleClearMapCache,
          },
          {
            title: t('more.sections.app.signOutWithLink', { address }),
            onPress: handleSignOut,
            destructive: true,
          },
        ] as MoreListItemType[],
      },
    ]
  }, [
    t,
    handlePinRequired,
    app.isPinRequired,
    app.authInterval,
    language,
    handleLanguageChange,
    account.settings.currencyType,
    handleCurrencyTypeChange,
    handleClearMapCache,
    address,
    handleSignOut,
    authIntervals,
    handleIntervalSelected,
    handleResetPin,
  ])

  const contentContainer = useMemo(
    () => ({
      paddingHorizontal: spacing.m,
      paddingBottom: spacing.xxxl,
    }),
    [spacing.m, spacing.xxxl],
  )

  const renderItem = useCallback(
    ({ item, index, section }) => (
      <MoreListItem
        item={item}
        isTop={index === 0}
        isBottom={index === section.data.length - 1}
      />
    ),
    [],
  )

  const renderSectionHeader = useCallback(
    ({ section: { title, icon } }) => (
      <Box
        flexDirection="row"
        alignItems="center"
        paddingTop="l"
        paddingBottom="s"
        paddingHorizontal="xs"
        backgroundColor="primaryBackground"
      >
        {icon !== undefined && icon}
        <Text variant="body1" marginLeft="s">
          {title}
        </Text>
      </Box>
    ),
    [],
  )

  const renderSectionFooter = useCallback(
    ({ section: { footer } }) => footer,
    [],
  )

  const keyExtractor = useCallback((item, index) => item.title + index, [])

  const edges = useMemo(() => ['left', 'right', 'top'] as Edge[], [])
  return (
    <SafeAreaBox backgroundColor="primaryBackground" flex={1} edges={edges}>
      <Text variant="h3" marginVertical="m" paddingHorizontal="l">
        {t('more.title')}
      </Text>
      <SectionList
        contentContainerStyle={contentContainer}
        sections={SectionData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        renderSectionFooter={renderSectionFooter}
        initialNumToRender={100}
        // ^ Sometimes on initial page load there is a bug with SectionList
        // where it won't render all items right away. This seems to fix it.
      />
    </SafeAreaBox>
  )
}

export default memo(MoreScreen)
