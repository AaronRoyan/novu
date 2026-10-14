export type RunPoint = {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
  timestamp: number;
};

export type RunAnalysisOptions = {
  maxAccuracyMeters?: number;
  maxSpeedMetersPerSecond?: number;
  minMovementMeters?: number;
  pauseSpeedMetersPerSecond?: number;
  smoothingWindowSize?: number;
};

export type RunAnalysis = {
  distanceMeters: number;
  elapsedSeconds: number;
  movingSeconds: number;
  pauseSeconds: number;
  averagePaceSecondsPerKm: number | null;
  movingPaceSecondsPerKm: number | null;
  elevationGainMeters: number;
  elevationLossMeters: number;
  acceptedPoints: number;
  rejectedPoints: number;
};

const METERS_IN_KILOMETER = 1000;
const EARTH_RADIUS_METERS = 6371000;

const DEFAULT_OPTIONS: Required<RunAnalysisOptions> = {
  maxAccuracyMeters: 35,
  maxSpeedMetersPerSecond: 8.5,
  minMovementMeters: 3,
  pauseSpeedMetersPerSecond: 0.7,
  smoothingWindowSize: 3,
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function isValidPoint(point: RunPoint) {
  return (
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    Number.isFinite(point.timestamp) &&
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180
  );
}

function getPaceSecondsPerKm(durationSeconds: number, distanceMeters: number) {
  if (durationSeconds <= 0 || distanceMeters <= 0) {
    return null;
  }

  return durationSeconds / (distanceMeters / METERS_IN_KILOMETER);
}

export function getDistanceMeters(
  previous: Pick<RunPoint, 'latitude' | 'longitude'>,
  next: Pick<RunPoint, 'latitude' | 'longitude'>,
) {
  const latitudeDelta = toRadians(next.latitude - previous.latitude);
  const longitudeDelta = toRadians(next.longitude - previous.longitude);
  const previousLatitude = toRadians(previous.latitude);
  const nextLatitude = toRadians(next.latitude);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(previousLatitude) *
      Math.cos(nextLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

function smoothPoint(points: RunPoint[], windowSize: number): RunPoint {
  const window = points.slice(-windowSize);
  const totals = window.reduce(
    (nextTotals, point) => ({
      latitude: nextTotals.latitude + point.latitude,
      longitude: nextTotals.longitude + point.longitude,
      altitude:
        nextTotals.altitude +
        (typeof point.altitude === 'number' && Number.isFinite(point.altitude)
          ? point.altitude
          : 0),
      altitudeCount:
        nextTotals.altitudeCount +
        (typeof point.altitude === 'number' && Number.isFinite(point.altitude) ? 1 : 0),
    }),
    { latitude: 0, longitude: 0, altitude: 0, altitudeCount: 0 },
  );

  return {
    ...points[points.length - 1],
    latitude: totals.latitude / window.length,
    longitude: totals.longitude / window.length,
    altitude: totals.altitudeCount > 0 ? totals.altitude / totals.altitudeCount : null,
  };
}

export function analyzeRunPoints(points: RunPoint[], options: RunAnalysisOptions = {}): RunAnalysis {
  const settings = { ...DEFAULT_OPTIONS, ...options };
  const sortedPoints = [...points].sort((a, b) => a.timestamp - b.timestamp);
  const acceptedRawPoints: RunPoint[] = [];
  const smoothedPoints: RunPoint[] = [];

  let rejectedPoints = 0;
  let distanceMeters = 0;
  let movingSeconds = 0;
  let elevationGainMeters = 0;
  let elevationLossMeters = 0;
  let pendingElevationDeltaMeters = 0;

  for (const point of sortedPoints) {
    if (!isValidPoint(point)) {
      rejectedPoints += 1;
      continue;
    }

    if (
      typeof point.accuracy === 'number' &&
      Number.isFinite(point.accuracy) &&
      point.accuracy > settings.maxAccuracyMeters
    ) {
      rejectedPoints += 1;
      continue;
    }

    const previousRawPoint = acceptedRawPoints[acceptedRawPoints.length - 1];

    if (previousRawPoint) {
      const rawDurationSeconds = Math.max(0, (point.timestamp - previousRawPoint.timestamp) / 1000);

      if (rawDurationSeconds <= 0) {
        rejectedPoints += 1;
        continue;
      }

      const rawDistanceMeters = getDistanceMeters(previousRawPoint, point);
      const rawSpeedMetersPerSecond = rawDistanceMeters / rawDurationSeconds;

      if (rawSpeedMetersPerSecond > settings.maxSpeedMetersPerSecond) {
        rejectedPoints += 1;
        continue;
      }
    }

    acceptedRawPoints.push(point);
    const smoothedPoint = smoothPoint(acceptedRawPoints, settings.smoothingWindowSize);
    const previousSmoothedPoint = smoothedPoints[smoothedPoints.length - 1];
    smoothedPoints.push(smoothedPoint);

    if (!previousSmoothedPoint) {
      continue;
    }

    const durationSeconds = Math.max(
      0,
      (smoothedPoint.timestamp - previousSmoothedPoint.timestamp) / 1000,
    );
    const segmentDistanceMeters = getDistanceMeters(previousSmoothedPoint, smoothedPoint);
    const segmentSpeedMetersPerSecond =
      durationSeconds > 0 ? segmentDistanceMeters / durationSeconds : 0;
    const isMoving =
      segmentDistanceMeters >= settings.minMovementMeters &&
      segmentSpeedMetersPerSecond >= settings.pauseSpeedMetersPerSecond;

    if (!isMoving) {
      continue;
    }

    distanceMeters += segmentDistanceMeters;
    movingSeconds += durationSeconds;

    if (
      typeof previousSmoothedPoint.altitude === 'number' &&
      typeof smoothedPoint.altitude === 'number'
    ) {
      const altitudeDelta = smoothedPoint.altitude - previousSmoothedPoint.altitude;

      if (Math.abs(altitudeDelta) <= 10) {
        pendingElevationDeltaMeters += altitudeDelta;

        if (pendingElevationDeltaMeters >= 1) {
          elevationGainMeters += pendingElevationDeltaMeters;
          pendingElevationDeltaMeters = 0;
        } else if (pendingElevationDeltaMeters <= -1) {
          elevationLossMeters += Math.abs(pendingElevationDeltaMeters);
          pendingElevationDeltaMeters = 0;
        }
      }
    }
  }

  const elapsedSeconds =
    sortedPoints.length > 1
      ? Math.max(0, (sortedPoints[sortedPoints.length - 1].timestamp - sortedPoints[0].timestamp) / 1000)
      : 0;

  return {
    distanceMeters,
    elapsedSeconds,
    movingSeconds,
    pauseSeconds: Math.max(0, elapsedSeconds - movingSeconds),
    averagePaceSecondsPerKm: getPaceSecondsPerKm(elapsedSeconds, distanceMeters),
    movingPaceSecondsPerKm: getPaceSecondsPerKm(movingSeconds, distanceMeters),
    elevationGainMeters,
    elevationLossMeters,
    acceptedPoints: acceptedRawPoints.length,
    rejectedPoints,
  };
}
