import React, { useState } from 'react';
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

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { logs, addLog } = useSkinCare();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const todayLog = logs.find(log => {
    const logDate = new Date(log.date);
    const today = new Date();
    return logDate.toDateString() === today.toDateString();
  });

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
        <View>
          <Text style={styles.greeting}>Good day!</Text>
          <Text style={styles.subtitle}>Track your skin journey</Text>
        </View>
        <View style={styles.logoContainer}>
          <MaterialIcons name="spa" size={32} color={theme.colors.primary} />
        </View>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {todayLog ? (
          <View style={styles.todaySection}>
            <Text style={styles.sectionTitle}>Today&apos;s Analysis</Text>
            <LogCard log={todayLog} />
            <BlurView intensity={20} style={styles.completedCard}>
              <MaterialIcons name="check-circle" size={24} color={theme.colors.success} />
              <Text style={styles.completedText}>
                You have tracked your skin today
              </Text>
            </BlurView>
            
            <TouchableOpacity 
              style={styles.scanAgainButton}
              onPress={() => setCameraVisible(true)}
              activeOpacity={0.8}
            >
              <BlurView intensity={30} style={styles.scanAgainBlur}>
                <MaterialIcons name="camera-alt" size={24} color={theme.colors.primary} />
                <View style={styles.scanAgainTextContainer}>
                  <Text style={styles.scanAgainTitle}>Scan Again</Text>
                  <Text style={styles.scanAgainSubtitle}>Track another analysis today</Text>
                </View>
                <MaterialIcons name="arrow-forward" size={24} color={theme.colors.textLight} />
              </BlurView>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.scanButtonContainer}
            onPress={() => setCameraVisible(true)}
            activeOpacity={0.9}
          >
            <BlurView intensity={20} style={styles.scanButton}>
              <View style={styles.scanIconContainer}>
                <MaterialIcons name="camera-alt" size={48} color={theme.colors.primary} />
              </View>
              <Text style={styles.scanTitle}>Take a Selfie</Text>
              <Text style={styles.scanSubtitle}>
                AI will analyze your skin in seconds
              </Text>
              <View style={styles.scanFeatures}>
                <View style={styles.featureItem}>
                  <MaterialIcons name="auto-awesome" size={16} color={theme.colors.secondary} />
                  <Text style={styles.featureText}>AI Analysis</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="face" size={16} color={theme.colors.secondary} />
                  <Text style={styles.featureText}>Skin Detection</Text>
                </View>
                <View style={styles.featureItem}>
                  <MaterialIcons name="insights" size={16} color={theme.colors.secondary} />
                  <Text style={styles.featureText}>Insights</Text>
                </View>
              </View>
            </BlurView>
          </TouchableOpacity>
        )}

        {logs.length > 0 && (
          <View style={styles.historySection}>
            <View style={styles.historySectionHeader}>
              <Text style={styles.sectionTitle}>History</Text>
              <BlurView intensity={20} style={styles.countBadge}>
                <Text style={styles.countText}>{logs.length}</Text>
              </BlurView>
            </View>
            {logs.slice(0, 10).map(log => (
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
    paddingVertical: theme.spacing.md,
  },
  greeting: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.glass,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  todaySection: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  completedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: 'hidden',
  },
  completedText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  scanButtonContainer: {
    marginBottom: theme.spacing.xl,
  },
  scanButton: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    overflow: 'hidden',
  },
  scanIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  scanTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  scanSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  scanFeatures: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.sm,
  },
  featureText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  historySection: {
    marginTop: theme.spacing.md,
  },
  historySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  countBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    minWidth: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  countText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  scanAgainButton: {
    marginTop: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  scanAgainBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
    overflow: 'hidden',
  },
  scanAgainTextContainer: {
    flex: 1,
  },
  scanAgainTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  scanAgainSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
});
