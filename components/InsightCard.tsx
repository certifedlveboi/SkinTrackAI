import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { theme } from '@/constants/theme';
import { AIInsight } from '@/services/aiAnalysisService';

interface InsightCardProps {
  insight: AIInsight;
}

const insightConfig = {
  trend: { icon: 'trending-up', color: theme.colors.secondary },
  recommendation: { icon: 'lightbulb', color: theme.colors.warning },
  milestone: { icon: 'emoji-events', color: theme.colors.primary },
  alert: { icon: 'warning', color: theme.colors.error },
};

export default function InsightCard({ insight }: InsightCardProps) {
  const config = insightConfig[insight.type];

  return (
    <BlurView intensity={20} style={[styles.container, { borderLeftColor: config.color }]}>
      <View style={[styles.iconContainer, { backgroundColor: config.color + '30' }]}>
        <MaterialIcons name={config.icon as any} size={24} color={config.color} />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{insight.title}</Text>
        <Text style={styles.description}>{insight.description}</Text>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: 'hidden',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});
