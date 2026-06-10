import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useAuth } from './useAuth';
import { analyzeRunPoints, type RunPoint } from '../lib/runAnalysis';
import { addRunLocation, createRun, finishRun } from '../lib/runTracking';

type RecordingStatus = 'idle' | 'starting' | 'recording' | 'stopping';

const LOCATION_DISTANCE_INTERVAL_METERS = 5;
const LOCATION_TIME_INTERVAL_MS = 5000;
const METERS_IN_KILOMETER = 1000;
const MIN_DISTANCE_FOR_PACE_METERS = 25;
const MAX_REASONABLE_PACE_SECONDS_PER_KM = 60 * 60;

function normalizeError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  if (typeof error === 'string' && error.length > 0) {
    return error;
  }

  return 'Something went wrong while recording your run.';
}

function getElapsedSeconds(startedAt: Date | null) {
  if (!startedAt) {
    return 0;
  }

  return Math.max(0, Math.round((Date.now() - startedAt.getTime()) / 1000));
}

export function formatRunDistance(distanceMeters: number) {
  if (distanceMeters < METERS_IN_KILOMETER) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / METERS_IN_KILOMETER).toFixed(2)} km`;
}

export function formatRunDuration(durationSeconds: number) {
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function formatRunPace(durationSeconds: number, distanceMeters: number) {
  if (durationSeconds <= 0 || distanceMeters < MIN_DISTANCE_FOR_PACE_METERS) {
    return '-- /km';
  }

  const paceSeconds = durationSeconds / (distanceMeters / METERS_IN_KILOMETER);

  if (!Number.isFinite(paceSeconds) || paceSeconds > MAX_REASONABLE_PACE_SECONDS_PER_KM) {
    return '-- /km';
  }

  const minutes = Math.floor(paceSeconds / 60);
  const seconds = Math.round(paceSeconds % 60);

  if (seconds === 60) {
    return `${minutes + 1}:00 /km`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
}

export function useRunRecorder() {
  const { user } = useAuth();
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [pointsRecorded, setPointsRecorded] = useState(0);
  const [lastLocation, setLastLocation] = useState<Location.LocationObject | null>(null);

  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const runIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<Date | null>(null);
  const rawLocationsRef = useRef<RunPoint[]>([]);
  const distanceRef = useRef(0);
  const pointsRecordedRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearWatch = useCallback(() => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
  }, []);

  const resetRunState = useCallback(() => {
    runIdRef.current = null;
    startedAtRef.current = null;
    rawLocationsRef.current = [];
    distanceRef.current = 0;
    pointsRecordedRef.current = 0;
    setDistanceMeters(0);
    setDurationSeconds(0);
    setPointsRecorded(0);
    setLastLocation(null);
  }, []);

  const persistLocation = useCallback(
    async (location: Location.LocationObject, runId: string, userId: string) => {
      const rawPoint: RunPoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        altitude: location.coords.altitude,
        accuracy: location.coords.accuracy,
        speed: location.coords.speed,
        heading: location.coords.heading,
        timestamp: location.timestamp,
      };
      const previousDistanceMeters = distanceRef.current;

      rawLocationsRef.current = [...rawLocationsRef.current, rawPoint];

      const analysis = analyzeRunPoints(rawLocationsRef.current);
      const distanceFromPreviousMeters = Math.max(
        0,
        analysis.distanceMeters - previousDistanceMeters,
      );

      distanceRef.current = analysis.distanceMeters;
      pointsRecordedRef.current = analysis.acceptedPoints;

      setDistanceMeters(distanceRef.current);
      setPointsRecorded(pointsRecordedRef.current);
      setLastLocation(location);

      await addRunLocation({
        runId,
        userId,
        location,
        distanceFromPreviousMeters,
      });
    },
    [],
  );

  const startRun = useCallback(async () => {
    if (!user) {
      setError('You need to be signed in before recording a run.');
      return;
    }

    if (status !== 'idle') {
      return;
    }

    setStatus('starting');
    setError(null);
    resetRunState();

    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();

      if (!granted) {
        throw new Error('Location permission is needed to record a run.');
      }

      const areServicesEnabled = await Location.hasServicesEnabledAsync();

      if (!areServicesEnabled) {
        throw new Error('Turn on location services to record a run.');
      }

      const firstLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const run = await createRun(user.id);
      const startedAt = new Date(run.started_at);

      runIdRef.current = run.id;
      startedAtRef.current = startedAt;

      await persistLocation(firstLocation, run.id, user.id);

      timerRef.current = setInterval(() => {
        setDurationSeconds(getElapsedSeconds(startedAtRef.current));
      }, 1000);

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: LOCATION_DISTANCE_INTERVAL_METERS,
          timeInterval: LOCATION_TIME_INTERVAL_MS,
        },
        (location) => {
          const activeRunId = runIdRef.current;

          if (!activeRunId || !user.id) {
            return;
          }

          void persistLocation(location, activeRunId, user.id).catch((locationError) => {
            console.error('Failed to save run location', locationError);
            setError(normalizeError(locationError));
          });
        },
      );

      setDurationSeconds(getElapsedSeconds(startedAt));
      setStatus('recording');
    } catch (startError) {
      console.error('Failed to start run recording', startError);
      clearTimer();
      clearWatch();
      resetRunState();
      setError(normalizeError(startError));
      setStatus('idle');
    }
  }, [clearTimer, clearWatch, persistLocation, resetRunState, status, user]);

  const stopRun = useCallback(async () => {
    if (status !== 'recording' || !runIdRef.current) {
      return;
    }

    setStatus('stopping');
    setError(null);
    clearTimer();
    clearWatch();

    const runId = runIdRef.current;
    const finalDurationSeconds = getElapsedSeconds(startedAtRef.current);

    try {
      await finishRun({
        runId,
        distanceMeters: distanceRef.current,
        durationSeconds: finalDurationSeconds,
      });

      setDurationSeconds(finalDurationSeconds);
      runIdRef.current = null;
      startedAtRef.current = null;
      rawLocationsRef.current = [];
      setStatus('idle');
    } catch (stopError) {
      console.error('Failed to finish run recording', stopError);
      setDurationSeconds(finalDurationSeconds);
      runIdRef.current = null;
      startedAtRef.current = null;
      rawLocationsRef.current = [];
      setError(`Run stopped locally, but the final save failed: ${normalizeError(stopError)}`);
      setStatus('idle');
    }
  }, [clearTimer, clearWatch, status]);

  useEffect(() => {
    return () => {
      clearTimer();
      clearWatch();
    };
  }, [clearTimer, clearWatch]);

  return {
    status,
    error,
    distanceMeters,
    durationSeconds,
    pointsRecorded,
    lastLocation,
    isRecording: status === 'recording',
    isBusy: status === 'starting' || status === 'stopping',
    startRun,
    stopRun,
  };
}
