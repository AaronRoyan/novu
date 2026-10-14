import * as Location from 'expo-location';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { useAuth } from './useAuth';
import { onRunPoints, startRunTracking, stopRunTracking } from '../lib/locationTask';
import { analyzeSegments } from '../lib/runAnalysis';
import {
  beginActiveRun,
  createLocalId,
  getActiveRun,
  getElapsedSeconds,
  getSessionPoints,
  updateActiveRun,
  type ActiveRun,
  type SessionPoint,
} from '../lib/runSession';
import { completeFinishedRun, discardActiveRun, syncActiveRun } from '../lib/runSync';

export type RecorderStatus = 'loading' | 'idle' | 'starting' | 'recording' | 'paused' | 'finishing';

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

  return 'Something went wrong while recording your run.';
}

/**
 * The run in progress. Recording happens in a background location task and
 * is stored on the phone first (lib/runSession), so this hook only mirrors
 * that state: it survives the screen locking, losing signal, and the app being
 * closed and reopened mid-run.
 */
export function useRunRecorder() {
  const { user } = useAuth();
  const [run, setRun] = useState<ActiveRun | null>(null);
  const [points, setPoints] = useState<SessionPoint[]>([]);
  const [status, setStatus] = useState<RecorderStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const reload = useCallback(async () => {
    const stored = await getActiveRun();

    if (!stored || stored.userId !== user?.id) {
      setRun(null);
      setPoints([]);
      setStatus('idle');
      return null;
    }

    setRun(stored);
    setPoints(await getSessionPoints());
    setStatus(stored.status);
    return stored;
  }, [user?.id]);

  // Restore a run left in progress (e.g. the app was closed mid-run).
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const stored = await reload();
      if (cancelled || !stored) return;

      if (stored.status === 'recording') {
        setNotice('Your run in progress was restored.');
        await startRunTracking().catch((startError) => setError(normalizeError(startError)));
      } else if (stored.status === 'finishing') {
        await completeFinishedRun()
          .then(() => reload())
          .catch(() => setNotice('Your last run is saved on this phone and will upload when you are online.'));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reload]);

  // New points from the background task.
  useEffect(
    () =>
      onRunPoints((newPoints) => {
        setPoints((current) => current.concat(newPoints));
        // Uploads update the stored run in the background; keep the counts fresh.
        void getActiveRun().then((stored) => stored && setRun(stored));
      }),
    [],
  );

  // Back in the foreground: pick up anything recorded meanwhile and upload.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      // The location permission prompt also bounces the app through 'active';
      // don't reload over a run that is still starting.
      if (state !== 'active' || statusRef.current === 'starting') return;
      void reload().then((stored) => {
        if (stored?.status === 'finishing') {
          void completeFinishedRun()
            .then(() => reload())
            .catch(() => undefined);
        } else if (stored) {
          void syncActiveRun().catch(() => undefined);
        }
      });
    });

    return () => subscription.remove();
  }, [reload]);

  // Tick the clock while recording.
  useEffect(() => {
    if (status !== 'recording') return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [status]);

  const summary = useMemo(() => analyzeSegments(points), [points]);
  const elapsedSeconds = run ? getElapsedSeconds(run, now) : 0;

  const start = useCallback(async () => {
    if (!user) {
      setError('You need to be signed in before recording a run.');
      return;
    }
    if (status !== 'idle') return;

    setStatus('starting');
    setError(null);
    setNotice(null);

    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        throw new Error('Location permission is needed to record a run. You can turn it on in Settings.');
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        throw new Error('Turn on Location Services to record a run.');
      }

      const next: ActiveRun = {
        localId: createLocalId(),
        userId: user.id,
        runId: null,
        startedAt: Date.now(),
        status: 'recording',
        segment: 0,
        pausedAt: null,
        pausedMs: 0,
        uploadedPoints: 0,
        endedAt: null,
        distanceMeters: null,
        durationSeconds: null,
      };
      await beginActiveRun(next);
      await startRunTracking();
      setRun(next);
      setPoints([]);
      setNow(Date.now());
      setStatus('recording');

      // Create the run on the server now if there is a connection.
      void syncActiveRun({ force: true }).catch(() => undefined);
    } catch (startError) {
      console.error('Failed to start run recording', startError);
      await stopRunTracking().catch(() => undefined);
      await discardActiveRun().catch(() => undefined);
      setRun(null);
      setError(normalizeError(startError));
      setStatus('idle');
    }
  }, [status, user]);

  const pause = useCallback(async () => {
    if (status !== 'recording') return;
    const pausedAt = Date.now();
    const next = await updateActiveRun({ status: 'paused', pausedAt });
    await stopRunTracking().catch(() => undefined);
    setRun(next);
    setNow(pausedAt);
    setStatus('paused');
  }, [status]);

  const resume = useCallback(async () => {
    if (status !== 'paused') return;
    const resumedAt = Date.now();
    const next = await updateActiveRun((current) => ({
      status: 'recording',
      pausedMs: current.pausedMs + (current.pausedAt ? resumedAt - current.pausedAt : 0),
      pausedAt: null,
      segment: current.segment + 1,
    }));

    try {
      await startRunTracking();
    } catch (resumeError) {
      setError(normalizeError(resumeError));
    }
    setRun(next);
    setNow(resumedAt);
    setStatus('recording');
  }, [status]);

  /** Finishes the run. Resolves with the server id once saved, or null if it
   * is waiting on the phone for a connection. */
  const finish = useCallback(async (): Promise<string | null> => {
    if (status !== 'recording' && status !== 'paused') return null;

    setError(null);
    await stopRunTracking().catch(() => undefined);
    const endedAt = Date.now();
    const finalPoints = await getSessionPoints();
    const finalSummary = analyzeSegments(finalPoints);
    const next = await updateActiveRun((current) => {
      const stopped = { ...current, endedAt };
      return {
        status: 'finishing',
        endedAt,
        // Count a pause still in progress as paused time.
        pausedMs: current.pausedMs + (current.status === 'paused' && current.pausedAt ? endedAt - current.pausedAt : 0),
        pausedAt: null,
        distanceMeters: finalSummary.distanceMeters,
        durationSeconds: getElapsedSeconds(stopped),
      };
    });
    setRun(next);
    setPoints(finalPoints);
    setStatus('finishing');

    try {
      const runId = await completeFinishedRun();
      setRun(null);
      setPoints([]);
      setStatus('idle');
      return runId;
    } catch (saveError) {
      console.warn('Run saved locally; upload pending', saveError);
      setNotice('Run saved on this phone. It will upload when you are online.');
      return null;
    }
  }, [status]);

  const retryUpload = useCallback(async () => {
    try {
      const runId = await completeFinishedRun();
      setNotice(null);
      await reload();
      return runId;
    } catch (retryError) {
      setError(`Still can't upload: ${normalizeError(retryError)}`);
      return null;
    }
  }, [reload]);

  const discard = useCallback(async () => {
    await stopRunTracking().catch(() => undefined);
    await discardActiveRun();
    setRun(null);
    setPoints([]);
    setNotice(null);
    setError(null);
    setStatus('idle');
  }, []);

  const lastPoint = points[points.length - 1] ?? null;

  return {
    status,
    error,
    notice,
    run,
    summary,
    elapsedSeconds,
    lastPoint,
    pendingUpload: run ? points.length - run.uploadedPoints : 0,
    start,
    pause,
    resume,
    finish,
    discard,
    retryUpload,
    dismissNotice: () => setNotice(null),
  };
}
