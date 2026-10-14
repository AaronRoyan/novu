import type { LocationObject } from 'expo-location';

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

type AddRunLocationParams = {
  runId: string;
  userId: string;
  location: LocationObject;
  distanceFromPreviousMeters: number;
};

type FinishRunParams = {
  runId: string;
  distanceMeters: number;
  durationSeconds: number;
};

export async function createRun(userId: string) {
  const { data, error } = await supabase
    .from('runs')
    .insert({
      user_id: userId,
      status: 'active',
    })
    .select('id, started_at')
    .single<RunRecord>();

  if (error) {
    throw error;
  }

  return data;
}

export async function addRunLocation({
  runId,
  userId,
  location,
  distanceFromPreviousMeters,
}: AddRunLocationParams) {
  const { coords } = location;
  const { error } = await supabase.from('run_locations').insert({
    run_id: runId,
    user_id: userId,
    recorded_at: new Date(location.timestamp).toISOString(),
    latitude: coords.latitude,
    longitude: coords.longitude,
    altitude: coords.altitude,
    accuracy: coords.accuracy,
    speed: coords.speed,
    heading: coords.heading,
    distance_from_previous_meters: distanceFromPreviousMeters,
  });

  if (error) {
    throw error;
  }
}

export async function finishRun({ runId, distanceMeters, durationSeconds }: FinishRunParams) {
  const { error } = await supabase
    .from('runs')
    .update({
      status: 'completed',
      ended_at: new Date().toISOString(),
      distance_meters: distanceMeters,
      duration_seconds: durationSeconds,
    })
    .eq('id', runId);

  if (error) {
    throw error;
  }
}

export async function getRecentRuns(userId: string, limit = 5) {
  const { data, error } = await supabase
    .from('runs')
    .select('id, status, started_at, ended_at, distance_meters, duration_seconds')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)
    .returns<RunHistoryRecord[]>();

  if (error) {
    throw error;
  }

  return data ?? [];
}
