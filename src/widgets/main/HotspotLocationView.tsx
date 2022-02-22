import React, { memo, useEffect, useState } from 'react'
import { Button, Text } from 'react-native'
import MapboxGL from '@react-native-mapbox-gl/maps'
import Config from 'react-native-config'
import LocationIcon from '@assets/images/location-icon.svg'
import Box from '../../components/Box'

const defaultLngLat = [-122.419418, 37.774929] // San Francisco

const HotspotLocationView = ({
  mapCenter,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  locationName,
  assertLocation,
}: {
  mapCenter?: [number, number]
  locationName?: string
  assertLocation: () => Promise<void>
}) => {
  // console.log('HotspotLocationView::locationName:', locationName)
  const [isWaiting, setWaiting] = useState<boolean>(true)
  useEffect(() => {
    // Hide splash after 5 seconds, deal with the consequences?
    const timeout = setTimeout(() => setWaiting(false), 500)
    return () => clearInterval(timeout)
  }, [])

  if (!mapCenter) {
    return (
      <Box flex={1} justifyContent="center">
        <Text
          style={{
            textAlign: 'center',
            fontSize: 16,
            color: 'white',
          }}
        >
          This Hotspot haven&apos;t been asserted location yet
        </Text>
        <Button title="Assert Location" onPress={assertLocation} />
      </Box>
    )
  }

  if (isWaiting) {
    return <Box flex={1} justifyContent="center" />
  }

  return (
    <MapboxGL.MapView
      style={{ height: '100%' }}
      styleURL={Config.MAPBOX_STYLE_URL}
      logoEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}
      scrollEnabled={false}
      zoomEnabled={false}
      compassEnabled={false}
      //   onRegionDidChange={onRegionDidChange}
    >
      <MapboxGL.Camera
        defaultSettings={{
          centerCoordinate: mapCenter || defaultLngLat,
          zoomLevel: 12,
        }}
        maxZoomLevel={12}
      />
      <MapboxGL.PointAnnotation
        id="locationMarker"
        coordinate={mapCenter || defaultLngLat}
      >
        <LocationIcon color="white" />
      </MapboxGL.PointAnnotation>
    </MapboxGL.MapView>
  )
}

export default memo(HotspotLocationView)
