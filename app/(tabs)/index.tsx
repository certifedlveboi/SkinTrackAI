import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '@/constants/theme';
import { useSkinCare } from '@/hooks/useSkinCare';
import { faceAnalysisService } from '@/services/faceAnalysisService';
import LogCard from '@/components/LogCard';
import CameraScreen from '@/components/CameraScreen';
import AnalysisScreen from '@/components/AnalysisScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { logs, addLog } = useSkinCare();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const todayLogs = useMemo(() => {
    const today = new Date();
    return logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.toDateString() === today.toDateString();
    });
  }, [logs]);

  const recentLogs = useMemo(() => {
    return logs.filter(log => {
      const logDate = new Date(log.date);
      const today = new Date();
      return logDate.toDateString() !== today.toDateString();
    }).slice(0, 5);
  }, [logs]);

  const weekStats = useMemo(() => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekLogs = logs.filter(log => new Date(log.date) >= weekAgo);
    const avgScore = weekLogs.length > 0
      ? Math.round(weekLogs.reduce((sum, log) => sum + log.skinScore, 0) / weekLogs.length)
      : 0;
    return {
      count: weekLogs.length,
      avgScore,
    };
  }, [logs]);

  const handleCapture = async (uri: string) => {
    setCameraVisible(false);
    setCapturedPhoto(uri);
    setIsAnalyzing(true);
    
    try {
      const result = await faceAnalysisService.analyzeFace(uri);
      setAnalysis(result);
    } catch (error) {
      console.error('Error analyzing face:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (capturedPhoto && analysis) {
      const condition = faceAnalysisService.getConditionFromScore(analysis.skinScore);
      const concerns = analysis.concerns.map((c: any) => c.type);
      
      await addLog({
        date: new Date().toISOString(),
        condition,
        concerns,
        notes: '',
        photoUri: capturedPhoto,
        skinScore: analysis.skinScore,
        analysis: {
          skinType: analysis.skinType,
          detectedFeatures: analysis.detectedFeatures,
          recommendations: analysis.recommendations,
        },
      });

      setCapturedPhoto(null);
      setAnalysis(null);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setAnalysis(null);
    setCameraVisible(true);
  };

  if (capturedPhoto) {
    return (
      <AnalysisScreen
        photoUri={capturedPhoto}
        analysis={analysis}
        isAnalyzing={isAnalyzing}
        onSave={handleSave}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.subtitle}>Your skin journey</Text>
        </View>
        <View style={styles.headerRight}>
          {weekStats.count > 0 && (
            <BlurView intensity={20} style={styles.weekBadge}>
              <MaterialIcons name="local-fire-department" size={18} color={theme.colors.warning} />
              <Text style={styles.weekBadgeText}>{weekStats.count} this week</Text>
            </BlurView>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        {logs.length > 0 && (
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <BlurView intensity={20} style={styles.statBlur}>
                <MaterialIcons name="calendar-today" size={24} color={theme.colors.secondary} />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statValue}>{logs.length}</Text>
                  <Text style={styles.statLabel}>Total Scans</Text>
                </View>
              </BlurView>
            </View>
            <View style={styles.statItem}>
              <BlurView intensity={20} style={styles.statBlur}>
                <MaterialIcons name="trending-up" size={24} color={theme.colors.success} />
                <View style={styles.statTextContainer}>
                  <Text style={styles.statValue}>{weekStats.avgScore || '--'}</Text>
                  <Text style={styles.statLabel}>Avg Score</Text>
                </View>
              </BlurView>
            </View>
          </View>
        )}

        {/* Main Action Section */}
        <View style={styles.mainSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Skin Analysis</Text>
            <MaterialIcons name="auto-awesome" size={20} color={theme.colors.primary} />
          </View>
          
          {todayLogs.length > 0 ? (
            <>
              {todayLogs.map((log, index) => (
                <View key={log.id} style={styles.todayLogContainer}>
                  {index === 0 && (
                    <BlurView intensity={20} style={styles.todayBadge}>
                      <MaterialIcons name="check-circle" size={16} color={theme.colors.success} />
                      <Text style={styles.todayBadgeText}>Latest Analysis</Text>
                    </BlurView>
                  )}
                  <LogCard log={log} />
                </View>
              ))}
              
              <TouchableOpacity 
                style={styles.scanAgainButton}
                onPress={() => setCameraVisible(true)}
                activeOpacity={0.8}
              >
                <BlurView intensity={30} style={styles.scanAgainBlur}>
                  <MaterialIcons name="add-a-photo" size={24} color={theme.colors.primary} />
                  <View style={styles.scanAgainTextContainer}>
                    <Text style={styles.scanAgainTitle}>New Scan</Text>
                    <Text style={styles.scanAgainSubtitle}>Capture another analysis</Text>
                  </View>
                  <MaterialIcons name="arrow-forward" size={20} color={theme.colors.textLight} />
                </BlurView>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.scanButtonContainer}
              onPress={() => setCameraVisible(true)}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={[theme.colors.primary + '30', theme.colors.secondary + '30']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.scanButtonGradient}
              >
                <BlurView intensity={40} style={styles.scanButton}>
                  <View style={styles.scanIconContainer}>
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.scanIconGradient}
                    >
                      <MaterialIcons name="camera-alt" size={48} color={theme.colors.text} />
                    </LinearGradient>
                  </View>
                  <Text style={styles.scanTitle}>Start Your First Scan</Text>
                  <Text style={styles.scanSubtitle}>
                    AI-powered skin analysis in seconds
                  </Text>
                  <View style={styles.scanFeatures}>
                    <View style={styles.featureItem}>
                      <MaterialIcons name="check" size={16} color={theme.colors.success} />
                      <Text style={styles.featureText}>Instant Results</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <MaterialIcons name="check" size={16} color={theme.colors.success} />
                      <Text style={styles.featureText}>Track Progress</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <MaterialIcons name="check" size={16} color={theme.colors.success} />
                      <Text style={styles.featureText}>Get Insights</Text>
                    </View>
                  </View>
                </BlurView>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Recent History */}
        {recentLogs.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent History</Text>
              <BlurView intensity={20} style={styles.countBadge}>
                <Text style={styles.countText}>{logs.length - todayLogs.length}</Text>
              </BlurView>
            </View>
            {recentLogs.map(log => (
              <LogCard key={log.id} log={log} />
            ))}
          </View>
        )}
      </ScrollView>

      <CameraScreen
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handleCapture}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: theme.spacing.md,
  },
  greeting: {
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  weekBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: 'hidden',
  },
  weekBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  quickStats: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  statItem: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  statBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: 'hidden',
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  mainSection: {
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
  todayLogContainer: {
    marginBottom: theme.spacing.md,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.success + '30',
    borderWidth: 1,
    borderColor: theme.colors.success + '50',
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  todayBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },
  scanButtonContainer: {
    marginBottom: theme.spacing.lg,
  },
  scanButtonGradient: {
    borderRadius: theme.borderRadius.xl,
    padding: 2,
  },
  scanButton: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
  },
  scanIconContainer: {
    marginBottom: theme.spacing.lg,
  },
  scanIconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTitle: {
    fontSize: 22,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  scanSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  scanFeatures: {
    alignSelf: 'stretch',
    gap: theme.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  featureText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    fontWeight: theme.fontWeight.medium,
  },
  historySection: {
    marginBottom: theme.spacing.xl,
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
  scanAgainButton: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.primary + '50',
  },
  scanAgainBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    backgroundColor: theme.colors.primary + '20',
    overflow: 'hidden',
  },
  scanAgainTextContainer: {
    flex: 1,
  },
  scanAgainTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  scanAgainSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
});
