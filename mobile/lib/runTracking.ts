import { getDistanceMeters, type RunPoint } from './runAnalysis';
import { supabase } from './supabase';

export type RunRecord = {
  id: string;
  started_at: string;
};

export type RunHistoryRecord = {
  id: string;
  status: 'active' | 'completed' | 'discarded';
  started_at: string;
  ended_at: string | null;
  distance_meters: number;
  duration_seconds: number;
};

export type RunLocationRecord = {
  recorded_at: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
};

type FinishRunParams = {
  runId: string;
  distanceMeters: number;
  durationSeconds: number;
  endedAt: Date;
};

const RUN_COLUMNS = 'id, status, started_at, ended_at, distance_meters, duration_seconds';

/** Creates the run on the server. `startedAt` is when the run really began,
 * which can be earlier if the phone was offline at the start. */
export async function createRun(userId: string, startedAt: Date) {
  const { data, error } = await supabase
    .from('runs')
    .insert({
      user_id: userId,
      status: 'active',
      started_at: startedAt.toISOString(),
    })
    .select('id, started_at')
    .single<RunRecord>();

  if (error) {
    throw error;
  }

  return data;
}

/** Saves a batch of points in one request. `previous` is the last point
 * already saved, so the first new point's distance can be measured from it.
 * Points already on the server (same run and timestamp) are skipped, so a
 * batch retried after a lost response never creates duplicates. */
export async function addRunLocations(
  runId: string,
  userId: string,
  points: RunPoint[],
  previous: RunPoint | null,
) {
  if (points.length === 0) return;

  const rows = points.map((point, index) => {
    const before = index === 0 ? previous : points[index - 1];
    return {
      run_id: runId,
      user_id: userId,
      recorded_at: new Date(point.timestamp).toISOString(),
      latitude: point.latitude,
      longitude: point.longitude,
      altitude: point.altitude ?? null,
      accuracy: point.accuracy ?? null,
      speed: point.speed ?? null,
      heading: point.heading ?? null,
      distance_from_previous_meters: before ? getDistanceMeters(before, point) : 0,
    };
  });

  const { error } = await supabase
    .from('run_locations')
    .upsert(rows, { onConflict: 'run_id,recorded_at', ignoreDuplicates: true });

  if (error) {
    throw error;
  }
}

export async function finishRun({ runId, distanceMeters, durationSeconds, endedAt }: FinishRunParams) {
  const { error } = await supabase
    .from('runs')
    .update({
      status: 'completed',
      ended_at: endedAt.toISOString(),
      distance_meters: distanceMeters,
      duration_seconds: durationSeconds,
    })
    .eq('id', runId);

  if (error) {
    throw error;
  }
}

export async function deleteRun(runId: string) {
  const { error } = await supabase.from('runs').delete().eq('id', runId);

  if (error) {
    throw error;
  }
}

export async function getRecentRuns(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('runs')
    .select(RUN_COLUMNS)
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('started_at', { ascending: false })
    .limit(limit)
    .returns<RunHistoryRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getRun(runId: string) {
  const { data, error } = await supabase
    .from('runs')
    .select(RUN_COLUMNS)
    .eq('id', runId)
    .single<RunHistoryRecord>();

  if (error) {
    throw error;
  }

  return data;
}

export async function getRunLocations(runId: string) {
  const { data, error } = await supabase
    .from('run_locations')
    .select('recorded_at, latitude, longitude, altitude, accuracy, speed, heading')
    .eq('run_id', runId)
    .order('recorded_at', { ascending: true })
    .limit(20000)
    .returns<RunLocationRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}
