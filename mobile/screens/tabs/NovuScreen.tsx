import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { RunMap } from '../../components/RunMap';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../hooks/useAuth';
import { type RecorderStatus, useRunRecorder } from '../../hooks/useRunRecorder';
import { formatDistance, formatDuration, formatKilometers, formatPace, formatRunDate } from '../../lib/format';
import { getRecentRuns, type RunHistoryRecord } from '../../lib/runTracking';
import type { AppStackParamList } from '../../navigation/types';
import { cardShadow, theme } from '../../theme/theme';

const STATUS_LABEL: Record<RecorderStatus, string> = {
  loading: 'Loading',
  idle: 'Ready',
  starting: 'Starting',
  recording: 'Recording',
  paused: 'Paused',
  finishing: 'Saving',
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }

  return 'Unable to load run history.';
}

export function NovuScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const recorder = useRunRecorder();
  const { status, summary, elapsedSeconds, run } = recorder;
  const [history, setHistory] = useState<RunHistoryRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      return;
    }

    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      setHistory(await getRecentRuns(user.id));
    } catch (loadError) {
      console.error('Failed to load run history', loadError);
      setHistoryError(getErrorMessage(loadError));
    } finally {
      setIsHistoryLoading(false);
    }
  }, [user]);

  // Refresh when coming back to this tab, e.g. after deleting a run.
  useFocusEffect(
    useCallback(() => {
      void loadHistory();
    }, [loadHistory]),
  );

  const openRun = (runId: string) => navigation.navigate('RunDetail', { runId });

  const confirmFinish = () => {
    Alert.alert('Finish run?', 'Your run will be saved to your history.', [
      { text: 'Keep going', style: 'cancel' },
      {
        text: 'Finish',
        onPress: async () => {
          const runId = await recorder.finish();
          await loadHistory();
          if (runId) openRun(runId);
        },
      },
    ]);
  };

  const confirmDiscard = () => {
    Alert.alert('Discard this run?', 'Nothing from this run will be saved.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => void recorder.discard() },
    ]);
  };

  const isActive = status === 'recording' || status === 'paused';
  const syncLabel = !run
    ? null
    : status === 'finishing'
      ? 'Saved on this phone'
      : recorder.pendingUpload > 0 || !run.runId
        ? 'Backing up…'
        : 'Backed up';

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Header title="Novu" subtitle="Record every run, including the slow ones." />

        {recorder.notice ? (
          <Pressable onPress={recorder.dismissNotice} style={styles.notice}>
            <Text style={styles.noticeText}>{recorder.notice}</Text>
          </Pressable>
        ) : null}

        <View style={styles.card}>
          <View style={styles.statusRow}>
            <View style={styles.chip}>
              <View
                style={[
                  styles.dot,
                  status === 'recording' && styles.dotLive,
                  status === 'paused' && styles.dotPaused,
                ]}
              />
              <Text style={styles.chipText}>{STATUS_LABEL[status]}</Text>
            </View>
            {syncLabel ? <Text style={styles.syncText}>{syncLabel}</Text> : null}
          </View>

          <RunMap path={summary.path} live={status !== 'finishing'} style={styles.map} />

          <View style={styles.headline}>
            <Text style={styles.bigNumber}>{formatKilometers(summary.distanceMeters)}</Text>
            <Text style={styles.bigUnit}>km</Text>
          </View>

          <View style={styles.metricsRow}>
            <Metric label="Time" value={formatDuration(elapsedSeconds)} />
            <Metric label="Pace" value={formatPace(elapsedSeconds, summary.distanceMeters, '')} />
            <Metric label="Climb" value={`${Math.round(summary.elevationGainMeters)} m`} />
          </View>

          {recorder.error ? <Text style={styles.errorText}>{recorder.error}</Text> : null}

          {status === 'idle' || status === 'starting' || status === 'loading' ? (
            <Button
              title="Start run"
              isLoading={status === 'starting'}
              disabled={status === 'loading'}
              onPress={() => void recorder.start()}
            />
          ) : null}

          {status === 'recording' ? (
            <View style={styles.controls}>
              <View style={styles.control}>
                <Button title="Pause" variant="secondary" onPress={() => void recorder.pause()} />
              </View>
              <View style={styles.control}>
                <Button title="Finish" onPress={confirmFinish} />
              </View>
            </View>
          ) : null}

          {status === 'paused' ? (
            <>
              <Button title="Resume" onPress={() => void recorder.resume()} />
              <View style={styles.controls}>
                <View style={styles.control}>
                  <Button title="Finish" variant="secondary" onPress={confirmFinish} />
                </View>
                <View style={styles.control}>
                  <Button title="Discard" variant="ghost" onPress={confirmDiscard} />
                </View>
              </View>
            </>
          ) : null}

          {status === 'finishing' ? (
            <Button title="Try uploading again" onPress={() => void recorder.retryUpload().then(() => loadHistory())} />
          ) : null}

          {isActive ? (
            <Text style={styles.hint}>Recording continues with the screen locked.</Text>
          ) : null}
        </View>

        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent runs</Text>
            {isHistoryLoading ? <Text style={styles.historyMeta}>Loading</Text> : null}
          </View>
          {historyError ? <Text style={styles.errorText}>{historyError}</Text> : null}
          {!isHistoryLoading && !historyError && history.length === 0 ? (
            <Text style={styles.hint}>No saved runs yet. Your first one goes here.</Text>
          ) : null}
          {history.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => openRun(item.id)}
              style={({ pressed }) => [styles.historyItem, pressed && styles.pressed]}
            >
              <View style={styles.historyText}>
                <Text style={styles.historyDate}>{formatRunDate(item.started_at)}</Text>
                <Text style={styles.historyStats}>
                  {formatDistance(item.distance_meters)} · {formatDuration(item.duration_seconds)} ·{' '}
                  {formatPace(item.duration_seconds, item.distance_meters)}
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  notice: {
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
  },
  noticeText: {
    color: theme.colors.inverse,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  card: {
    ...cardShadow,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.disabled,
  },
  dotLive: {
    backgroundColor: theme.colors.error,
  },
  dotPaused: {
    backgroundColor: '#E0A100',
  },
  chipText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  syncText: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '600',
  },
  map: {
    height: 220,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
  },
  bigNumber: {
    color: theme.colors.text,
    fontSize: 64,
    fontWeight: '800',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  bigUnit: {
    color: theme.colors.mutedText,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metric: {
    flex: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    gap: 4,
  },
  metricLabel: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '600',
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  controls: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  control: {
    flex: 1,
  },
  hint: {
    color: theme.colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
  historySection: {
    gap: theme.spacing.sm,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  historyMeta: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
  },
  pressed: {
    opacity: 0.7,
  },
  historyText: {
    flex: 1,
    gap: 4,
  },
  historyDate: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  historyStats: {
    color: theme.colors.mutedText,
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  chevron: {
    color: theme.colors.mutedText,
    fontSize: 24,
    fontWeight: '600',
  },
});
