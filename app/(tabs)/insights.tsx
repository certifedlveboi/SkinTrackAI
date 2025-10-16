import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '@/constants/theme';
import { useSkinCare } from '@/hooks/useSkinCare';
import { aiAnalysisService } from '@/services/aiAnalysisService';
import InsightCard from '@/components/InsightCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const { logs, products } = useSkinCare();
  const insights = aiAnalysisService.generateInsights(logs, products);

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <MaterialIcons name="tips-and-updates" size={32} color={theme.colors.accent} />
          <View style={styles.headerText}>
            <Text style={styles.title}>AI Insights</Text>
            <Text style={styles.subtitle}>Personalized skin care tips</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {insights.length > 0 ? (
          <>
            <BlurView intensity={20} style={styles.infoCard}>
              <View style={styles.infoIconContainer}>
                <MaterialIcons name="auto-awesome" size={20} color={theme.colors.accent} />
              </View>
              <Text style={styles.infoText}>
                Our AI analyzes your scan history and product usage to provide personalized recommendations
              </Text>
            </BlurView>

            <View style={styles.insightsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Insights</Text>
                <BlurView intensity={20} style={styles.countBadge}>
                  <Text style={styles.countText}>{insights.length}</Text>
                </BlurView>
              </View>
              {insights.map(insight => (
                <InsightCard key={insight.id} insight={insight} />
              ))}
            </View>
          </>
        ) : (
          <BlurView intensity={20} style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="tips-and-updates" size={48} color={theme.colors.accent} />
            </View>
            <Text style={styles.emptyTitle}>Insights Coming Soon</Text>
            <Text style={styles.emptySubtitle}>
              Complete a few skin scans to unlock AI-powered insights and personalized recommendations for your skin journey.
            </Text>
            <View style={styles.emptyFeatures}>
              <View style={styles.emptyFeature}>
                <MaterialIcons name="check-circle" size={16} color={theme.colors.success} />
                <Text style={styles.emptyFeatureText}>Track patterns</Text>
              </View>
              <View style={styles.emptyFeature}>
                <MaterialIcons name="check-circle" size={16} color={theme.colors.success} />
                <Text style={styles.emptyFeatureText}>Get recommendations</Text>
              </View>
              <View style={styles.emptyFeature}>
                <MaterialIcons name="check-circle" size={16} color={theme.colors.success} />
                <Text style={styles.emptyFeatureText}>Improve results</Text>
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
  infoCard: {
    backgroundColor: theme.colors.accent + '20',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.accent + '30',
    overflow: 'hidden',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.accent + '40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    lineHeight: 20,
  },
  insightsSection: {
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
    backgroundColor: theme.colors.accent + '30',
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
