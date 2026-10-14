import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components/Button';
import { RunMap } from '../../components/RunMap';
import { formatDistance, formatDuration, formatKilometers, formatPace, formatRunDate } from '../../lib/format';
import { analyzeSegments, type RunSummary } from '../../lib/runAnalysis';
import { deleteRun, getRun, getRunLocations, type RunHistoryRecord } from '../../lib/runTracking';
import type { AppStackParamList } from '../../navigation/types';
import { cardShadow, theme } from '../../theme/theme';

type Props = NativeStackScreenProps<AppStackParamList, 'RunDetail'>;

// Points arrive every few seconds while recording, so a longer gap is a pause.
const PAUSE_GAP_MS = 20_000;

function getErrorMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return 'Unable to load this run.';
}

export function RunDetailScreen({ navigation, route }: Props) {
  const { runId } = route.params;
  const [run, setRun] = useState<RunHistoryRecord | null>(null);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const [record, locations] = await Promise.all([getRun(runId), getRunLocations(runId)]);
        if (cancelled) return;

        let segment = 0;
        let previousTime = 0;
        const points = locations.map((location) => {
          const timestamp = Date.parse(location.recorded_at);
          if (previousTime && timestamp - previousTime > PAUSE_GAP_MS) segment += 1;
          previousTime = timestamp;
          return { ...location, timestamp, segment };
        });

        setRun(record);
        setSummary(analyzeSegments(points));
        navigation.setOptions({ title: formatRunDate(record.started_at) });
      } catch (loadError) {
        if (!cancelled) setError(getErrorMessage(loadError));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigation, runId]);

  const confirmDelete = () => {
    Alert.alert('Delete this run?', 'It will be removed from your history. This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setIsDeleting(true);
          try {
            await deleteRun(runId);
            navigation.goBack();
          } catch (deleteError) {
            setError(getErrorMessage(deleteError));
            setIsDeleting(false);
          }
        },
      },
    ]);
  };

  if (error && !run) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!run || !summary) {
    return (
      <SafeAreaView edges={['bottom']} style={styles.centered}>
        <ActivityIndicator color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  const fastestSplit = Math.min(...summary.splits.map((split) => split.seconds / (split.distanceMeters / 1000)));

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {summary.path.length > 0 ? (
          <RunMap path={summary.path} style={styles.map} />
        ) : (
          <View style={[styles.map, styles.noMap]}>
            <Text style={styles.mutedText}>No route recorded for this run.</Text>
          </View>
        )}

        <View style={styles.headline}>
          <Text style={styles.bigNumber}>{formatKilometers(run.distance_meters)}</Text>
          <Text style={styles.bigUnit}>km</Text>
        </View>

        <View style={styles.metricsGrid}>
          <Metric label="Time" value={formatDuration(run.duration_seconds)} />
          <Metric label="Avg pace" value={formatPace(run.duration_seconds, run.distance_meters)} />
          <Metric label="Moving time" value={formatDuration(summary.movingSeconds)} />
          <Metric label="Elevation gain" value={`${Math.round(summary.elevationGainMeters)} m`} />
        </View>

        {summary.splits.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Splits</Text>
            {summary.splits.map((split) => {
              const pace = split.seconds / (split.distanceMeters / 1000);
              return (
                <View key={split.km} style={styles.splitRow}>
                  <Text style={styles.splitKm}>
                    {split.distanceMeters < 1000 ? formatDistance(split.distanceMeters) : `KM ${split.km}`}
                  </Text>
                  <View style={styles.splitBarTrack}>
                    <View style={[styles.splitBar, { width: `${Math.max(12, (fastestSplit / pace) * 100)}%` }]} />
                  </View>
                  <Text style={styles.splitPace}>{formatPace(split.seconds, split.distanceMeters, '')}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <Button title="Delete run" variant="ghost" isLoading={isDeleting} onPress={confirmDelete} />
      </ScrollView>
    </SafeAreaView>
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
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  content: {
    gap: theme.spacing.lg,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  map: {
    height: 300,
  },
  noMap: {
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: theme.colors.surface,
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
  card: {
    ...cardShadow,
    gap: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: theme.spacing.xs,
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  splitKm: {
    width: 64,
    color: theme.colors.mutedText,
    fontSize: 13,
    fontWeight: '700',
  },
  splitBarTrack: {
    flex: 1,
    height: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.overlay,
    overflow: 'hidden',
  },
  splitBar: {
    height: '100%',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primary,
  },
  splitPace: {
    width: 52,
    textAlign: 'right',
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  mutedText: {
    color: theme.colors.mutedText,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    lineHeight: 20,
  },
});
