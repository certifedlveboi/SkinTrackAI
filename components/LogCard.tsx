import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '@/constants/theme';
import { SkinLog } from '@/services/skinCareService';

interface LogCardProps {
  log: SkinLog;
  onPress?: () => void;
}

const conditionConfig = {
  excellent: { color: '#48BB78', icon: 'sentiment-very-satisfied', label: 'Excellent' },
  good: { color: '#7DD3C0', icon: 'sentiment-satisfied', label: 'Good' },
  fair: { color: '#ED8936', icon: 'sentiment-neutral', label: 'Fair' },
  poor: { color: '#F56565', icon: 'sentiment-dissatisfied', label: 'Poor' },
};

export default function LogCard({ log, onPress }: LogCardProps) {
  const config = conditionConfig[log.condition];
  const logDate = new Date(log.date);
  const isToday = new Date().toDateString() === logDate.toDateString();

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Image source={{ uri: log.photoUri }} style={styles.photo} contentFit="cover" />
      
      <View style={styles.overlay}>
        <View style={styles.header}>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>
              {isToday ? 'Today' : logDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
            <Text style={styles.time}>
              {logDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
          <View style={[styles.conditionBadge, { backgroundColor: config.color + '20' }]}>
            <MaterialIcons name={config.icon as any} size={20} color={config.color} />
            <Text style={[styles.conditionText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Score</Text>
          <Text style={[styles.scoreValue, { color: config.color }]}>{log.skinScore}</Text>
        </View>

        {log.concerns.length > 0 && (
          <View style={styles.concernsContainer}>
            {log.concerns.slice(0, 3).map((concern, index) => (
              <View key={index} style={styles.concernTag}>
                <Text style={styles.concernText}>{concern}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    height: 240,
    backgroundColor: theme.colors.cardBg,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  photo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    padding: theme.spacing.md,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  dateContainer: {
    flex: 1,
  },
  date: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  time: {
    fontSize: theme.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  conditionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  conditionText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  concernsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  concernTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  concernText: {
    fontSize: theme.fontSize.xs,
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.medium,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.xs,
  },
  scoreLabel: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scoreValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
});
