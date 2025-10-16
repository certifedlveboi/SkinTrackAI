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
          <MaterialIcons name="auto-awesome" size={32} color={theme.colors.primary} />
          <View style={styles.headerText}>
            <Text style={styles.title}>AI Insights</Text>
            <Text style={styles.subtitle}>Personalized recommendations</Text>
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
            <View style={styles.infoCard}>
              <MaterialIcons name="info-outline" size={20} color={theme.colors.secondary} />
              <Text style={styles.infoText}>
                AI analyzes your skin logs and products to provide personalized insights
              </Text>
            </View>

            {insights.map(insight => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="auto-awesome" size={64} color={theme.colors.textLight} />
            <Text style={styles.emptyTitle}>No Insights Yet</Text>
            <Text style={styles.emptySubtitle}>
              Log your skin regularly to receive AI-powered insights
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  headerText: {
    flex: 1,
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
  infoCard: {
    backgroundColor: theme.colors.secondary + '30',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  infoText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
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
    textAlign: 'center',
  },
});
