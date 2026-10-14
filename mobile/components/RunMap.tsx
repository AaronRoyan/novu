import { useRef } from 'react';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import type { LatLng } from '../lib/runAnalysis';
import { theme } from '../theme/theme';

type RunMapProps = {
  /** One line per recorded segment (a pause starts a new one). */
  path: LatLng[][];
  /** Follow the runner's position instead of framing the whole route. */
  live?: boolean;
  style?: ViewStyle;
};

const EDGE_PADDING = { top: 56, right: 56, bottom: 56, left: 56 };

export function RunMap({ path, live = false, style }: RunMapProps) {
  const mapRef = useRef<MapView>(null);
  const coordinates = path.flat();
  const first = coordinates[0];
  const last = coordinates[coordinates.length - 1];

  const frameRoute = () => {
    if (!live && coordinates.length > 1) {
      mapRef.current?.fitToCoordinates(coordinates, { edgePadding: EDGE_PADDING, animated: false });
    }
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        mapType={Platform.OS === 'ios' ? 'mutedStandard' : 'standard'}
        showsUserLocation={live}
        followsUserLocation={live}
        showsCompass={false}
        showsPointsOfInterest={false}
        toolbarEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        userInterfaceStyle="light"
        onMapReady={frameRoute}
        initialRegion={
          first
            ? { latitude: first.latitude, longitude: first.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 }
            : undefined
        }
      >
        {path.map((line, index) => (
          <Polyline
            key={index}
            coordinates={line}
            strokeColor={theme.colors.primary}
            strokeWidth={5}
            lineCap="round"
            lineJoin="round"
          />
        ))}
        {first ? (
          <Marker coordinate={first} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.start} />
          </Marker>
        ) : null}
        {!live && last && coordinates.length > 1 ? (
          <Marker coordinate={last} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
            <View style={styles.finish} />
          </Marker>
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  start: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.background,
  },
  finish: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
});
