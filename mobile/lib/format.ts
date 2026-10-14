const METERS_IN_KILOMETER = 1000;
const MAX_REASONABLE_PACE_SECONDS_PER_KM = 60 * 60;

const pad = (value: number) => value.toString().padStart(2, '0');

export function formatDistance(distanceMeters: number) {
  if (distanceMeters < METERS_IN_KILOMETER) {
    return `${Math.round(distanceMeters)} m`;
  }

  return `${(distanceMeters / METERS_IN_KILOMETER).toFixed(2)} km`;
}

/** Kilometres with two decimals and no unit, for big readouts. */
export function formatKilometers(distanceMeters: number) {
  return (distanceMeters / METERS_IN_KILOMETER).toFixed(2);
}

export function formatDuration(totalSeconds: number) {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${minutes}:${pad(rest)}`;
}

/** Pace from a time and a distance, e.g. 5:43 /km. Dashes until it means something. */
export function formatPace(seconds: number, distanceMeters: number, unit = ' /km') {
  if (seconds <= 0 || distanceMeters < 25) {
    return `--${unit}`;
  }

  const paceSeconds = seconds / (distanceMeters / METERS_IN_KILOMETER);

  if (!Number.isFinite(paceSeconds) || paceSeconds > MAX_REASONABLE_PACE_SECONDS_PER_KM) {
    return `--${unit}`;
  }

  const rounded = Math.round(paceSeconds);
  return `${Math.floor(rounded / 60)}:${pad(rounded % 60)}${unit}`;
}

export function formatRunDate(value: string | number) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}
