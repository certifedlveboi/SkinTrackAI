import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '@/constants/theme';
import { useSkinCare } from '@/hooks/useSkinCare';
import { aiAnalysisService } from '@/services/aiAnalysisService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LogCard from '@/components/LogCard';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { logs } = useSkinCare();
  const summary = aiAnalysisService.getProgressSummary(logs);

  const getConditionLabel = (value: number) => {
    if (value >= 3.5) return 'Excellent';
    if (value >= 2.5) return 'Good';
    if (value >= 1.5) return 'Fair';
    return 'Poor';
  };

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Progress</Text>
        <Text style={styles.subtitle}>Track your skin journey</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {logs.length > 0 ? (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <MaterialIcons name="calendar-today" size={32} color={theme.colors.primary} />
                <Text style={styles.statValue}>{summary.totalLogs}</Text>
                <Text style={styles.statLabel}>Total Logs</Text>
              </View>

              <View style={styles.statCard}>
                <MaterialIcons name="local-fire-department" size={32} color={theme.colors.warning} />
                <Text style={styles.statValue}>{summary.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <MaterialIcons name="auto-graph" size={32} color={theme.colors.secondary} />
                <Text style={styles.statValue}>
                  {getConditionLabel(summary.averageCondition)}
                </Text>
                <Text style={styles.statLabel}>Avg Condition</Text>
              </View>

              <View style={styles.statCard}>
                <MaterialIcons 
                  name={summary.improvementRate >= 0 ? 'trending-up' : 'trending-down'} 
                  size={32} 
                  color={summary.improvementRate >= 0 ? theme.colors.success : theme.colors.error} 
                />
                <Text style={[
                  styles.statValue,
                  { color: summary.improvementRate >= 0 ? theme.colors.success : theme.colors.error }
                ]}>
                  {summary.improvementRate > 0 ? '+' : ''}{summary.improvementRate}%
                </Text>
                <Text style={styles.statLabel}>Change</Text>
              </View>
            </View>

            <View style={styles.timelineSection}>
              <Text style={styles.sectionTitle}>Timeline</Text>
              {logs.map(log => (
                <LogCard key={log.id} log={log} />
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="timeline" size={64} color={theme.colors.textLight} />
            <Text style={styles.emptyTitle}>No Progress Data Yet</Text>
            <Text style={styles.emptySubtitle}>
              Start logging your skin to track progress
            </Text>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  timelineSection: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});
