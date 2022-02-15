import React, { memo, useCallback, useState } from 'react'
// import { Text, View } from 'react-native'
// import { Position } from 'geojson'
// import { reverseGeocode } from '../../../utils/location'
import Map from '../../../components/Map'

const ExplorerScreen = () => {
  const [mapCenter, setMapCenter] = useState([-122.419, 37.775])
  // const [markerCenter, setMarkerCenter] = useState([-122.419, 37.775])
  // const markerCenter = [-122.419, 37.775]
  //   const [locationName, setLocationName] = useState('')
  //   const [hasGPSLocation, setHasGPSLocation] = useState(false)

  // const onMapMoved = useCallback(async (newCoords?: Position) => {
  //   if (newCoords) {
  //     // setMarkerCenter(newCoords)

  //     const [longitude, latitude] = newCoords
  //     const [{ street, city }] = await reverseGeocode(latitude, longitude)
  //     const name = street && city ? [street, city].join(', ') : 'Loading...'
  //     //   setLocationName(name)
  //   }
  // }, [])

  const onDidFinishLoadingMap = useCallback(
    (latitude: number, longitude: number) => {
      console.log('onDidFinishLoadingMap:', [longitude, latitude])
      //   setHasGPSLocation(true)
      setMapCenter([longitude, latitude])
    },
    [],
  )

  //   useEffect(() => {
  //     setMapCenter([-122.419, 37.775])
  //   }, [])

  return (
    <Map
      maxZoomLevel={17}
      mapCenter={mapCenter}
      // onMapMoved={onMapMoved}
      onDidFinishLoadingMap={onDidFinishLoadingMap}
      // markerLocation={markerCenter}
      currentLocationEnabled
    />
  )
}
export default memo(ExplorerScreen)
