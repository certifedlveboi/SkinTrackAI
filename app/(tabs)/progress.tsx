
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '@/constants/theme';
import { useSkinCare } from '@/hooks/useSkinCare';
import { aiAnalysisService } from '@/services/aiAnalysisService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LogCard from '@/components/LogCard';

const { width } = Dimensions.get('window');

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const { logs } = useSkinCare();
  const summary = aiAnalysisService.getProgressSummary(logs);

  const scoreHistory = useMemo(() => {
    return logs.slice(0, 7).reverse().map((log, index) => ({
      score: log.skinScore,
      date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      index,
    }));
  }, [logs]);

  const maxScore = 100;
  const chartHeight = 120;

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
        <View style={styles.headerContent}>
          <MaterialIcons name="insights" size={32} color={theme.colors.secondary} />
          <View style={styles.headerText}>
            <Text style={styles.title}>Progress Tracking</Text>
            <Text style={styles.subtitle}>Your skin health over time</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {logs.length > 0 ? (
          <>
            {/* Overview Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Overview</Text>
              <View style={styles.statsGrid}>
                <BlurView intensity={20} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: theme.colors.primary + '30' }]}>
                    <MaterialIcons name="calendar-today" size={24} color={theme.colors.primary} />
                  </View>
                  <Text style={styles.statValue}>{summary.totalLogs}</Text>
                  <Text style={styles.statLabel}>Total Scans</Text>
                </BlurView>

                <BlurView intensity={20} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: theme.colors.warning + '30' }]}>
                    <MaterialIcons name="local-fire-department" size={24} color={theme.colors.warning} />
                  </View>
                  <Text style={styles.statValue}>{summary.streak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </BlurView>

                <BlurView intensity={20} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: theme.colors.secondary + '30' }]}>
                    <MaterialIcons name="auto-graph" size={24} color={theme.colors.secondary} />
                  </View>
                  <Text style={styles.statValue}>
                    {getConditionLabel(summary.averageCondition)}
                  </Text>
                  <Text style={styles.statLabel}>Condition</Text>
                </BlurView>

                <BlurView intensity={20} style={styles.statCard}>
                  <View style={[styles.statIcon, { 
                    backgroundColor: (summary.improvementRate >= 0 ? theme.colors.success : theme.colors.error) + '30' 
                  }]}>
                    <MaterialIcons 
                      name={summary.improvementRate >= 0 ? 'trending-up' : 'trending-down'} 
                      size={24} 
                      color={summary.improvementRate >= 0 ? theme.colors.success : theme.colors.error} 
                    />
                  </View>
                  <Text style={[
                    styles.statValue,
                    { color: summary.improvementRate >= 0 ? theme.colors.success : theme.colors.error }
                  ]}>
                    {summary.improvementRate > 0 ? '+' : ''}{summary.improvementRate}%
                  </Text>
                  <Text style={styles.statLabel}>Change</Text>
                </BlurView>
              </View>
            </View>

            {/* Score Chart */}
            {scoreHistory.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Score Trend</Text>
                  <Text style={styles.sectionSubtitle}>Last 7 scans</Text>
                </View>
                <BlurView intensity={20} style={styles.chartCard}>
                  <View style={styles.chart}>
                    {scoreHistory.map((point, index) => {
                      const barHeight = (point.score / maxScore) * chartHeight;
                      const isLatest = index === scoreHistory.length - 1;
                      return (
                        <View key={index} style={styles.chartBar}>
                          <View style={styles.barContainer}>
                            {isLatest && (
                              <View style={styles.latestIndicator}>
                                <Text style={styles.scoreText}>{point.score}</Text>
                              </View>
                            )}
                            <LinearGradient
                              colors={[
                                point.score >= 80 ? theme.colors.success : 
                                point.score >= 60 ? theme.colors.secondary : 
                                point.score >= 40 ? theme.colors.warning : 
                                theme.colors.error,
                                theme.colors.primary,
                              ]}
                              style={[
                                styles.bar,
                                { 
                                  height: barHeight,
                                  opacity: isLatest ? 1 : 0.6,
                                },
                              ]}
                            />
                          </View>
                          <Text style={styles.chartLabel}>{point.date}</Text>
                        </View>
                      );
                    })}
                  </View>
                </BlurView>
              </View>
            )} {/* This was the missing closing curly brace and parenthesis */}

            {/* Timeline */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Full History</Text>
                <BlurView intensity={20} style={styles.countBadge}>
                  <Text style={styles.countText}>{logs.length}</Text>
                </BlurView>
              </View>
              {logs.map(log => (
                <LogCard key={log.id} log={log} />
              ))}
            </View>
          </>
        ) : (
          <BlurView intensity={20} style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="insights" size={48} color={theme.colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Progress Data Yet</Text>
            <Text style={styles.emptySubtitle}>
              Complete your first skin scan to start tracking your progress and see insights over time.
            </Text>
            <View style={styles.emptyFeatures}>
              <View style={styles.emptyFeature}>
                <MaterialIcons name="check-circle" size={16} color={theme.colors.success} />
                <Text style={styles.emptyFeatureText}>Track daily changes</Text>
              </View>
              <View style={styles.emptyFeature}>
                <MaterialIcons name="check-circle" size={16} color={theme.colors.success} />
                <Text style={styles.emptyFeatureText}>Visualize improvements</Text>
              </View>
              <View style={styles.emptyFeature}>
                <MaterialIcons name="check-circle" size={16} color={theme.colors.success} />
                <Text style={styles.emptyFeatureText}>Compare over time</Text>
              </View>
            </View>
          </BlurView>
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
    paddingVertical: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 28,
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
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  statCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: 'hidden',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: 'hidden',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 150,
    gap: theme.spacing.xs,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  barContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  bar: {
    width: '100%',
    borderRadius: theme.borderRadius.sm,
    minHeight: 8,
  },
  latestIndicator: {
    marginBottom: theme.spacing.xs,
  },
  scoreText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  chartLabel: {
    fontSize: 10,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  countBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    minWidth: 36,
    alignItems: 'center',
    overflow: 'hidden',
  },
  countText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  emptyCard: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: 'hidden',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.lg,
  },
  emptyFeatures: {
    alignSelf: 'stretch',
    gap: theme.spacing.sm,
  },
  emptyFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  emptyFeatureText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
  },
});
