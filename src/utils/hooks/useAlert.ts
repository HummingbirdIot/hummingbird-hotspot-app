import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, AlertType } from 'react-native'

const useAlert = () => {
  const { t } = useTranslation()

  const showOKAlert = useCallback(
    (options: {
      titleKey: string
      messageKey?: string
      messageOptions?: Record<string, string>
      okKey?: string
    }): Promise<boolean> =>
      new Promise((resolve) => {
        const { titleKey, messageKey, messageOptions, okKey } = options
        const title = t(titleKey)
        const message = messageKey ? t(messageKey, messageOptions) : undefined
        Alert.alert(title, message, [
          {
            text: t(okKey || 'generic.ok'),
            onPress: () => resolve(true),
          },
        ])
      }),
    [t],
  )

  const showOKCancelAlert = useCallback(
    (options: {
      titleKey: string
      messageKey?: string
      messageOptions?: Record<string, string>
      okKey?: string
      cancelKey?: string
      cancelStyle?: 'destructive' | 'cancel'
    }): Promise<boolean> =>
      new Promise((resolve) => {
        const {
          titleKey,
          messageKey,
          messageOptions,
          okKey,
          cancelKey,
          cancelStyle = 'destructive',
        } = options
        const title = t(titleKey)
        const message = messageKey ? t(messageKey, messageOptions) : undefined
        Alert.alert(title, message, [
          {
            text: t(cancelKey || 'generic.cancel'),
            style: cancelStyle,
            onPress: () => resolve(false),
          },
          {
            text: t(okKey || 'generic.ok'),
            onPress: () => resolve(true),
          },
        ])
      }),
    [t],
  )

  const showInputAlert = useCallback(
    (options: {
      titleKey: string
      messageKey?: string
      messageOptions?: Record<string, string>
      okKey?: string
      cancelKey?: string
      cancelStyle?: 'destructive' | 'cancel'
      defaultValue?: string
      inputType?: Exclude<AlertType, 'default'>
    }): Promise<string> =>
      new Promise((resolve) => {
        const {
          titleKey,
          messageKey,
          messageOptions,
          okKey,
          cancelKey,
          cancelStyle = 'destructive',
          inputType = 'plain-text',
          defaultValue = '',
        } = options
        const title = t(titleKey)
        const message = messageKey ? t(messageKey, messageOptions) : undefined
        Alert.prompt(
          title,
          message,
          [
            {
              text: t(cancelKey || 'generic.cancel'),
              style: cancelStyle,
              onPress: () => resolve(''),
            },
            {
              text: t(okKey || 'generic.ok'),
              onPress: (value?: string) => resolve(value || ''),
            },
          ],
          inputType,
          defaultValue,
        )
      }),
    [t],
  )

  return { showOKCancelAlert, showOKAlert, showInputAlert }
}

export default useAlert
