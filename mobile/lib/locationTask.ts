import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

import { appendSessionPoints, getActiveRun, type SessionPoint } from './runSession';
import { syncActiveRun } from './runSync';

// Location updates for a run arrive through this background task, so they keep
// coming while the screen is locked or another app is open. It must be defined
// at startup (see index.ts) so iOS can deliver updates to it at any time.

export const RUN_LOCATION_TASK = 'novu-run-location';

type PointsListener = (points: SessionPoint[]) => void;
const listeners = new Set<PointsListener>();

/** Called with each batch of new points while the app is running. */
export function onRunPoints(listener: PointsListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

TaskManager.defineTask<{ locations: Location.LocationObject[] }>(RUN_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('Run location task error', error.message);
    return;
  }

  const locations = data?.locations ?? [];
  const run = await getActiveRun();
  if (!run || run.status !== 'recording' || locations.length === 0) return;

  const points: SessionPoint[] = locations
    .filter((location) => location.timestamp >= run.startedAt)
    .map((location) => ({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
      heading: location.coords.heading,
      timestamp: location.timestamp,
      segment: run.segment,
    }));
  if (points.length === 0) return;

  await appendSessionPoints(points);
  listeners.forEach((listener) => listener(points));

  // Upload opportunistically; failures just wait for the next attempt.
  void syncActiveRun().catch(() => undefined);
});

export async function startRunTracking() {
  if (await Location.hasStartedLocationUpdatesAsync(RUN_LOCATION_TASK)) return;

  await Location.startLocationUpdatesAsync(RUN_LOCATION_TASK, {
    accuracy: Location.Accuracy.BestForNavigation,
    distanceInterval: 5,
    timeInterval: 5000,
    activityType: Location.ActivityType.Fitness,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Novu is recording your run',
      notificationBody: 'Tap to return to your run.',
      notificationColor: '#111111',
    },
  });
}

export async function stopRunTracking() {
  if (await Location.hasStartedLocationUpdatesAsync(RUN_LOCATION_TASK)) {
    await Location.stopLocationUpdatesAsync(RUN_LOCATION_TASK);
  }
}
