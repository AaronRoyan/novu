import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../hooks/useAuth';
import {
  formatRunDistance,
  formatRunDuration,
  formatRunPace,
  useRunRecorder,
} from '../../hooks/useRunRecorder';
import { getRecentRuns, type RunHistoryRecord } from '../../lib/runTracking';
import { cardShadow, theme } from '../../theme/theme';

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

function formatRunDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function NovuScreen() {
  const { user } = useAuth();
  const {
    distanceMeters,
    durationSeconds,
    error,
    isBusy,
    isRecording,
    lastLocation,
    pointsRecorded,
    startRun,
    stopRun,
    status,
  } = useRunRecorder();
  const [history, setHistory] = useState<RunHistoryRecord[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const statusText = isRecording
    ? 'Recording'
    : status === 'starting'
      ? 'Starting'
      : status === 'stopping'
        ? 'Saving'
        : 'Ready';

  const loadHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      setHistoryError(null);
      return;
    }

    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const recentRuns = await getRecentRuns(user.id);
      setHistory(recentRuns);
    } catch (loadError) {
      console.error('Failed to load run history', loadError);
      setHistoryError(getErrorMessage(loadError));
    } finally {
      setIsHistoryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const handleStopRun = useCallback(async () => {
    await stopRun();
    await loadHistory();
  }, [loadHistory, stopRun]);

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Header title="Novu" subtitle="Record a run with live location points saved to your account." />
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Run status</Text>
            <Text style={[styles.statusValue, isRecording ? styles.activeStatus : null]}>
              {statusText}
            </Text>
          </View>

          <View style={styles.metricsGrid}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Distance</Text>
              <Text style={styles.metricValue}>{formatRunDistance(distanceMeters)}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Time</Text>
              <Text style={styles.metricValue}>{formatRunDuration(durationSeconds)}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Pace</Text>
              <Text style={styles.metricValue}>{formatRunPace(durationSeconds, distanceMeters)}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Points</Text>
              <Text style={styles.metricValue}>{pointsRecorded}</Text>
            </View>
          </View>

          {lastLocation ? (
            <Text style={styles.locationText}>
              Last fix {lastLocation.coords.latitude.toFixed(5)}, {lastLocation.coords.longitude.toFixed(5)}
            </Text>
          ) : (
            <Text style={styles.locationText}>No location points recorded yet.</Text>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Button
            disabled={isBusy}
            isLoading={isBusy}
            onPress={isRecording ? handleStopRun : startRun}
            title={isRecording ? 'Stop run' : 'Start run'}
            variant={isRecording ? 'secondary' : 'primary'}
          />
        </View>

        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>Recent runs</Text>
            {isHistoryLoading ? <Text style={styles.historyMeta}>Loading</Text> : null}
          </View>

          {historyError ? <Text style={styles.errorText}>{historyError}</Text> : null}

          {!isHistoryLoading && !historyError && history.length === 0 ? (
            <Text style={styles.locationText}>No saved runs yet.</Text>
          ) : null}

          {history.map((run) => (
            <View key={run.id} style={styles.historyItem}>
              <View style={styles.historyItemHeader}>
                <Text style={styles.historyDate}>{formatRunDate(run.started_at)}</Text>
                <Text style={styles.historyStatus}>{run.status}</Text>
              </View>
              <View style={styles.historyMetrics}>
                <View style={styles.historyMetric}>
                  <Text style={styles.metricLabel}>Distance</Text>
                  <Text style={styles.historyValue}>{formatRunDistance(run.distance_meters)}</Text>
                </View>
                <View style={styles.historyMetric}>
                  <Text style={styles.metricLabel}>Time</Text>
                  <Text style={styles.historyValue}>{formatRunDuration(run.duration_seconds)}</Text>
                </View>
                <View style={styles.historyMetric}>
                  <Text style={styles.metricLabel}>Pace</Text>
                  <Text style={styles.historyValue}>
                    {formatRunPace(run.duration_seconds, run.distance_meters)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  card: {
    ...cardShadow,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  statusLabel: {
    color: theme.colors.mutedText,
    fontSize: 14,
    fontWeight: '600',
  },
  statusValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  activeStatus: {
    color: theme.colors.success,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  metric: {
    flexBasis: '48%',
    flexGrow: 1,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  metricLabel: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  locationText: {
    color: theme.colors.mutedText,
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
  historySection: {
    gap: theme.spacing.md,
  },
  historyHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  historyTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  historyMeta: {
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
  },
  historyItem: {
    ...cardShadow,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  historyItemHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  historyDate: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  historyStatus: {
    color: theme.colors.mutedText,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  historyMetrics: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  historyMetric: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  historyValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
});
