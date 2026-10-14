import AsyncStorage from '@react-native-async-storage/async-storage';

import type { RunPoint } from './runAnalysis';

// The run in progress lives on the phone first and is uploaded when there is
// a connection, so a dead zone, a locked screen or a closed app never loses it.

const RUN_KEY = 'novu.activeRun';
const POINTS_KEY = 'novu.activeRun.points';

/** A recorded GPS point. `segment` increases after every pause, so the
 * distance never draws a straight line across the time spent paused. */
export type SessionPoint = RunPoint & { segment: number };

export type ActiveRun = {
  localId: string;
  userId: string;
  /** The run's id on the server, once it has been created there. */
  runId: string | null;
  startedAt: number;
  status: 'recording' | 'paused' | 'finishing';
  segment: number;
  pausedAt: number | null;
  /** Total time spent paused, excluding a pause still in progress. */
  pausedMs: number;
  /** How many of the stored points are already saved on the server. */
  uploadedPoints: number;
  /** Set once the run is finished; the final save may still be pending. */
  endedAt: number | null;
  distanceMeters: number | null;
  durationSeconds: number | null;
};

// Every read-modify-write goes through one queue so the background location
// task and the screen can't overwrite each other's changes.
let queue: Promise<unknown> = Promise.resolve();

function serialize<T>(work: () => Promise<T>): Promise<T> {
  const next = queue.then(work, work);
  queue = next.catch(() => undefined);
  return next;
}

async function readJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function getActiveRun() {
  return serialize(() => readJson<ActiveRun>(RUN_KEY));
}

export function getSessionPoints() {
  return serialize(async () => (await readJson<SessionPoint[]>(POINTS_KEY)) ?? []);
}

export function beginActiveRun(run: ActiveRun) {
  return serialize(() =>
    AsyncStorage.multiSet([
      [RUN_KEY, JSON.stringify(run)],
      [POINTS_KEY, JSON.stringify([])],
    ]),
  );
}

export function updateActiveRun(patch: Partial<ActiveRun> | ((run: ActiveRun) => Partial<ActiveRun>)) {
  return serialize(async () => {
    const run = await readJson<ActiveRun>(RUN_KEY);
    if (!run) return null;
    const next = { ...run, ...(typeof patch === 'function' ? patch(run) : patch) };
    await AsyncStorage.setItem(RUN_KEY, JSON.stringify(next));
    return next;
  });
}

export function appendSessionPoints(points: SessionPoint[]) {
  return serialize(async () => {
    const existing = (await readJson<SessionPoint[]>(POINTS_KEY)) ?? [];
    const next = existing.concat(points);
    await AsyncStorage.setItem(POINTS_KEY, JSON.stringify(next));
    return next.length;
  });
}

export function clearActiveRun() {
  return serialize(() => AsyncStorage.multiRemove([RUN_KEY, POINTS_KEY]));
}

/** Time on the clock so far, not counting pauses. */
export function getElapsedSeconds(run: ActiveRun, now = Date.now()) {
  const end = run.endedAt ?? now;
  const currentPause = run.status === 'paused' && run.pausedAt ? end - run.pausedAt : 0;
  return Math.max(0, Math.round((end - run.startedAt - run.pausedMs - currentPause) / 1000));
}

export function createLocalId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
