import { addRunLocations, createRun, deleteRun, finishRun } from './runTracking';
import { clearActiveRun, getActiveRun, getSessionPoints, updateActiveRun } from './runSession';

const BATCH_SIZE = 200;
const MIN_INTERVAL_MS = 15_000;

let inFlight: Promise<void> | null = null;
let lastAttempt = 0;

async function upload() {
  const run = await getActiveRun();
  if (!run) return;

  let { runId } = run;
  if (!runId) {
    const created = await createRun(run.userId, new Date(run.startedAt));
    runId = created.id;
    await updateActiveRun({ runId });
  }

  const points = await getSessionPoints();
  let uploaded = run.uploadedPoints;
  while (uploaded < points.length) {
    const batch = points.slice(uploaded, uploaded + BATCH_SIZE);
    await addRunLocations(runId, run.userId, batch, uploaded > 0 ? points[uploaded - 1] : null);
    uploaded += batch.length;
    await updateActiveRun({ uploadedPoints: uploaded });
  }
}

/**
 * Uploads whatever of the run in progress isn't on the server yet. Safe to
 * call often: only one upload runs at a time, and calls within 15 seconds of
 * the last attempt are skipped unless `force` is set. Throws when offline;
 * the points stay on the phone for the next attempt.
 */
export function syncActiveRun({ force = false } = {}) {
  if (inFlight) return inFlight;
  if (!force && Date.now() - lastAttempt < MIN_INTERVAL_MS) return Promise.resolve();

  lastAttempt = Date.now();
  inFlight = upload().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

/**
 * Completes a run whose status is already 'finishing': uploads the remaining
 * points, marks it completed, then clears it from the phone. Returns the
 * server id, or throws (e.g. offline) and leaves everything to retry later.
 */
export async function completeFinishedRun() {
  await syncActiveRun({ force: true });
  const run = await getActiveRun();
  if (!run || run.status !== 'finishing' || !run.runId || run.endedAt === null) {
    throw new Error('There is no finished run to save.');
  }

  await finishRun({
    runId: run.runId,
    distanceMeters: run.distanceMeters ?? 0,
    durationSeconds: run.durationSeconds ?? 0,
    endedAt: new Date(run.endedAt),
  });
  await clearActiveRun();
  return run.runId;
}

/** Throws away the run in progress, including anything already uploaded. */
export async function discardActiveRun() {
  const run = await getActiveRun();
  await clearActiveRun();
  if (run?.runId) {
    await deleteRun(run.runId).catch((error) => console.warn('Could not delete discarded run', error));
  }
}
