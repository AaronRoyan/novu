import { Platform } from 'react-native';

export type RouteLocation = {
  latitude: number;
  longitude: number;
};

export type RouteCosting = 'auto' | 'bicycle' | 'pedestrian';

export type RouteManeuver = {
  instruction: string;
  length: number;
  time: number;
  type: number;
};

export type PlannedRoute = {
  distance: number;
  durationSeconds: number;
  units: string;
  shape: RouteLocation[];
  maneuvers: RouteManeuver[];
};

type ValhallaResponse = {
  error?: string;
  error_code?: number;
  trip?: {
    units: string;
    summary: {
      length: number;
      time: number;
    };
    legs: Array<{
      shape: string;
      maneuvers?: RouteManeuver[];
    }>;
  };
};

type PlanRouteOptions = {
  locations: RouteLocation[];
  costing?: RouteCosting;
  signal?: AbortSignal;
};

const defaultValhallaUrl = Platform.OS === 'android'
  ? 'http://10.0.2.2:8002'
  : 'http://localhost:8002';

export const valhallaUrl = (
  process.env.EXPO_PUBLIC_VALHALLA_URL || defaultValhallaUrl
).replace(/\/$/, '');

/** Decode Valhalla's six-decimal encoded polyline into map coordinates. */
export function decodePolyline6(encoded: string): RouteLocation[] {
  const coordinates: RouteLocation[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;

  const decodeValue = () => {
    let result = 0;
    let shift = 0;
    let byte: number;

    do {
      if (index >= encoded.length) {
        throw new Error('Invalid encoded route shape.');
      }

      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    return (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
  };

  while (index < encoded.length) {
    latitude += decodeValue();
    longitude += decodeValue();
    coordinates.push({
      latitude: latitude / 1e6,
      longitude: longitude / 1e6,
    });
  }

  return coordinates;
}

export async function planRoute({
  locations,
  costing = 'pedestrian',
  signal,
}: PlanRouteOptions): Promise<PlannedRoute> {
  if (locations.length < 2) {
    throw new Error('Route planning requires at least two locations.');
  }

  const response = await fetch(`${valhallaUrl}/route`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      locations: locations.map(({ latitude, longitude }) => ({
        lat: latitude,
        lon: longitude,
        type: 'break',
      })),
      costing,
      units: 'kilometers',
      language: 'en-US',
    }),
    signal,
  });

  const body = (await response.json()) as ValhallaResponse;

  if (!response.ok || !body.trip) {
    throw new Error(body.error || `Valhalla route request failed (${response.status}).`);
  }

  return {
    distance: body.trip.summary.length,
    durationSeconds: body.trip.summary.time,
    units: body.trip.units,
    shape: body.trip.legs.flatMap((leg) => decodePolyline6(leg.shape)),
    maneuvers: body.trip.legs.flatMap((leg) => leg.maneuvers ?? []),
  };
}

