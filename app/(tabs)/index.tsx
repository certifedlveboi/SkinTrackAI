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

function getUserName() {
  // In a real app, this would come from user profile
  return 'Sarah';
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Hello {getUserName()}</Text>
          <Text style={styles.subtitle}>Your skin consultation start here!</Text>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <MaterialIcons name="menu" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Health Report Card */}
        {logs.length > 0 && todayLogs.length > 0 && (
          <View style={styles.healthReportCard}>
            <View style={styles.healthReportHeader}>
              <View>
                <Text style={styles.healthReportTitle}>Health Report</Text>
                <View style={styles.healthReportMeta}>
                  <MaterialIcons name="circle" size={8} color={theme.colors.success} />
                  <Text style={styles.healthReportMetaText}>Last Scan</Text>
                </View>
              </View>
              <MaterialIcons name="medical-services" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.skinHealthContainer}>
              <Text style={styles.skinHealthLabel}>Your Skin Health</Text>
              <Text style={styles.skinHealthScore}>{todayLogs[0].skinScore}%</Text>
            </View>
            <View style={styles.lastScanInfo}>
              <Text style={styles.lastScanText}>2 days ago</Text>
            </View>
          </View>
        )}

        {/* Daily Routine Section */}
        {logs.length > 0 && (
          <View style={styles.dailyRoutineCard}>
            <MaterialIcons name="schedule" size={20} color={theme.colors.info} />
            <View style={styles.dailyRoutineContent}>
              <Text style={styles.dailyRoutineDate}>{new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}</Text>
              <Text style={styles.dailyRoutineTitle}>Daily Routine</Text>
            </View>
            <MaterialIcons name="arrow-forward-ios" size={16} color={theme.colors.textLight} />
          </View>
        )}

        {/* Category Tabs */}
        {logs.length > 0 && (
          <View style={styles.categoryTabs}>
            <TouchableOpacity style={[styles.categoryTab, styles.categoryTabActive]}>
              <Text style={[styles.categoryTabText, styles.categoryTabTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryTab}>
              <Text style={styles.categoryTabText}>Face</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryTab}>
              <Text style={styles.categoryTabText}>Body</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryTab}>
              <Text style={styles.categoryTabText}>Lip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.categoryTab}>
              <Text style={styles.categoryTabText}>Eye</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Action Section */}
        <View style={styles.mainSection}>
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
                <View style={styles.scanAgainContent}>
                  <MaterialIcons name="add-a-photo" size={24} color={theme.colors.primary} />
                  <View style={styles.scanAgainTextContainer}>
                    <Text style={styles.scanAgainTitle}>New Scan</Text>
                    <Text style={styles.scanAgainSubtitle}>Capture another analysis</Text>
                  </View>
                  <MaterialIcons name="arrow-forward" size={20} color={theme.colors.textLight} />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={styles.scanButtonContainer}
              onPress={() => setCameraVisible(true)}
              activeOpacity={0.9}
            >
              <View style={styles.scanButton}>
                <View style={styles.scanIconContainer}>
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.scanIconGradient}
                  >
                    <MaterialIcons name="camera-alt" size={48} color="#FFFFFF" />
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
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* For You Section */}
        {logs.length > 0 && (
          <View style={styles.forYouSection}>
            <View style={styles.forYouHeader}>
              <Text style={styles.forYouTitle}>For You</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See all</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recommendationCard}>
              <View style={styles.recommendationImagePlaceholder}>
                <MaterialIcons name="spa" size={48} color={theme.colors.primary} />
              </View>
              <View style={styles.recommendationContent}>
                <Text style={styles.recommendationTitle}>Natural Face Care</Text>
                <Text style={styles.recommendationSubtitle}>Recommended for your skin type</Text>
              </View>
            </View>
          </View>
        )}

        {/* Recent History */}
        {recentLogs.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent History</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{logs.length - todayLogs.length}</Text>
              </View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundGradientStart,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 32,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.regular,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  healthReportCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  healthReportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  healthReportTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 6,
  },
  healthReportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthReportMetaText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  skinHealthContainer: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  skinHealthLabel: {
    fontSize: theme.fontSize.sm,
    color: '#FFFFFF',
    marginBottom: 4,
    opacity: 0.8,
  },
  skinHealthScore: {
    fontSize: 28,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  lastScanInfo: {
    paddingTop: theme.spacing.sm,
  },
  lastScanText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  dailyRoutineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    gap: theme.spacing.sm,
  },
  dailyRoutineContent: {
    flex: 1,
  },
  dailyRoutineDate: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginBottom: 2,
  },
  dailyRoutineTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  categoryTab: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: 'transparent',
  },
  categoryTabActive: {
    backgroundColor: theme.colors.text,
  },
  categoryTabText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
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
    backgroundColor: theme.colors.success + '20',
    marginBottom: theme.spacing.sm,
  },
  todayBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.success,
  },
  scanButtonContainer: {
    marginBottom: theme.spacing.lg,
  },
  scanButton: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 5,
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
    fontSize: 20,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  scanSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.lg,
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
  forYouSection: {
    marginBottom: theme.spacing.xl,
  },
  forYouHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  forYouTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  seeAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  recommendationCard: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  recommendationImagePlaceholder: {
    height: 180,
    backgroundColor: theme.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationContent: {
    padding: theme.spacing.md,
  },
  recommendationTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  recommendationSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  historySection: {
    marginBottom: theme.spacing.xl,
  },
  countBadge: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 4,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.round,
    minWidth: 32,
    alignItems: 'center',
  },
  countText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  scanAgainButton: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.cardBg,
    shadowColor: theme.colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  scanAgainContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
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
