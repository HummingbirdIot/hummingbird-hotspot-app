import { LOCATION_FOREGROUND, askAsync, PermissionType } from 'expo-permissions'
import { useCallback } from 'react'
import locationSlice from '../../store/app/locationSlice'
import { useAppDispatch } from '../../store/store'
import appSlice from '../../store/app/appSlice'
import useAlert from './useAlert'

const usePermissionManager = () => {
  const { showOKCancelAlert } = useAlert()
  const dispatch = useAppDispatch()

  const requestPermission = useCallback(
    async (type: PermissionType) => {
      dispatch(appSlice.actions.requestingPermission(true))
      const response = await askAsync(type)
      dispatch(appSlice.actions.requestingPermission(false))
      return response
    },
    [dispatch],
  )

  const requestLocationPermission = useCallback(
    async (showAlert = true) => {
      if (showAlert) {
        const decision = await showOKCancelAlert({
          titleKey: 'permissions.location.title',
          messageKey: 'permissions.location.message',
        })
        if (!decision) return false
      }

      const response = await requestPermission(LOCATION_FOREGROUND)
      dispatch(locationSlice.actions.updateLocationPermission(response))
      return response
    },
    [dispatch, requestPermission, showOKCancelAlert],
  )

  return { requestLocationPermission, requestPermission }
}
export default usePermissionManager
