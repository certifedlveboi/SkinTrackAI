import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '@/constants/theme';
import { useSkinCare } from '@/hooks/useSkinCare';
import { faceAnalysisService } from '@/services/faceAnalysisService';
import CameraScreen from '@/components/CameraScreen';
import AnalysisScreen from '@/components/AnalysisScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { logs, addLog, refresh } = useSkinCare();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  const latestLog = useMemo(() => {
    return logs.length > 0 ? logs[0] : null;
  }, [logs]);

  // Get stats from latest analysis
  const hydrationStatus = useMemo(() => {
    if (!latestLog?.analysis?.detectedFeatures) return 'Low';
    const hydration = latestLog.analysis.detectedFeatures.hydration || 0;
    if (hydration >= 70) return 'Good';
    if (hydration >= 40) return 'Medium';
    return 'Low';
  }, [latestLog]);

  const uvStatus = useMemo(() => {
    if (!latestLog?.analysis?.detectedFeatures) return 'Low';
    const damage = latestLog.analysis.detectedFeatures.sunDamage || 0;
    if (damage <= 30) return 'Low';
    if (damage <= 60) return 'Medium';
    return 'High';
  }, [latestLog]);

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
      setCurrentPhotoIndex(0);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setAnalysis(null);
    setCameraVisible(true);
  };

  const handlePreviousPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  const handleNextPhoto = () => {
    if (currentPhotoIndex < logs.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return ['#48BB78', '#38A169'];
    if (score >= 60) return ['#4299E1', '#3182CE'];
    return ['#F6AD55', '#ED8936'];
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

  const currentLog = logs[currentPhotoIndex];
  const scoreColors = latestLog ? getScoreColor(latestLog.skinScore) : ['#4299E1', '#3182CE'];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Overall Skin Health Score Section */}
        <Text style={styles.sectionTitle}>Overall Skin Health Score</Text>
        
        <View style={styles.healthScoreContainer}>
          {/* Left: Score Circle */}
          <View style={styles.scoreCircleContainer}>
            <Svg width={140} height={140}>
              {/* Background circle */}
              <Circle
                cx={70}
                cy={70}
                r={60}
                stroke="#2D3748"
                strokeWidth={12}
                fill="none"
              />
              {/* Progress circle */}
              <Circle
                cx={70}
                cy={70}
                r={60}
                stroke="url(#gradient)"
                strokeWidth={12}
                fill="none"
                strokeDasharray={`${(latestLog?.skinScore || 0) * 3.77} 377`}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
              />
            </Svg>
            <View style={styles.scoreContent}>
              <Text style={styles.scorePercentage}>{latestLog?.skinScore || 0}%</Text>
              <Text style={styles.scoreChange}>-2% from yesterday</Text>
            </View>
            <LinearGradient
              colors={scoreColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradientDef}
            />
          </View>

          {/* Middle: Status Icons */}
          <View style={styles.statusIcons}>
            <View style={styles.statusIcon}>
              <View style={[styles.iconCircle, { borderColor: '#4299E1' }]}>
                <MaterialIcons name="opacity" size={20} color="#4299E1" />
              </View>
              <Text style={styles.statusLabel}>Hydration</Text>
              <Text style={styles.statusSubLabel}>{hydrationStatus}</Text>
            </View>
            <View style={styles.statusIcon}>
              <View style={[styles.iconCircle, { borderColor: '#F6AD55' }]}>
                <MaterialIcons name="wb-sunny" size={20} color="#F6AD55" />
              </View>
              <Text style={styles.statusLabel}>UV</Text>
              <Text style={styles.statusSubLabel}>{uvStatus}</Text>
            </View>
            <View style={styles.statusIcon}>
              <View style={[styles.iconCircle, { borderColor: latestLog?.concerns.length ? '#F56565' : '#48BB78' }]}>
                <MaterialIcons 
                  name={latestLog?.concerns.length ? "warning" : "check-circle"} 
                  size={20} 
                  color={latestLog?.concerns.length ? '#F56565' : '#48BB78'} 
                />
              </View>
              <Text style={styles.statusLabel}>Status</Text>
              <Text style={styles.statusSubLabel}>
                {latestLog?.concerns.length ? `${latestLog.concerns.length} issues` : 'Good'}
              </Text>
            </View>
          </View>

          {/* Right: 3D Character Placeholder */}
          <View style={styles.characterContainer}>
            <LinearGradient
              colors={['#4C51BF', '#805AD5']}
              style={styles.characterPlaceholder}
            >
              <MaterialIcons name="face" size={80} color="rgba(255,255,255,0.3)" />
            </LinearGradient>
            <Text style={styles.characterLabel}>3D Avatar</Text>
          </View>
        </View>

        {/* Daily Snapshot Buttons */}
        <Text style={styles.sectionTitle}>Daily Snapshot</Text>
        <View style={styles.snapshotButtons}>
          <TouchableOpacity 
            style={[styles.snapshotButton, { backgroundColor: '#4299E1' }]}
            onPress={() => setCameraVisible(true)}
          >
            <MaterialIcons name="camera-alt" size={28} color="#FFFFFF" />
            <Text style={styles.snapshotButtonText}>Scan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.snapshotButton}>
            <MaterialIcons name="face" size={28} color="#A0AEC0" />
            <Text style={styles.snapshotButtonText}>Face</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.snapshotButton}>
            <MaterialIcons name="settings" size={28} color="#A0AEC0" />
            <Text style={styles.snapshotButtonText}>Routine</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.snapshotButton}>
            <MaterialIcons name="shopping-bag" size={28} color="#A0AEC0" />
            <Text style={styles.snapshotButtonText}>Products</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.snapshotButton}>
            <MaterialIcons name="search" size={28} color="#A0AEC0" />
            <Text style={styles.snapshotButtonText}>Insights</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.snapshotButton, { backgroundColor: '#B794F4' }]}>
            <MaterialIcons name="compare-arrows" size={28} color="#FFFFFF" />
            <Text style={styles.snapshotButtonText}>Insights</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content Cards */}
        <View style={styles.cardsRow}>
          {/* Daily Routin Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Daily Routin</Text>
            <Text style={styles.cardSubtitle}>Toe stut ei tor outres yumetion?</Text>
            <Text style={styles.cardLabel}>Yoan Skin anlog</Text>
            
            {logs.length > 0 && currentLog ? (
              <View style={styles.photoNavigator}>
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={handlePreviousPhoto}
                  disabled={currentPhotoIndex === 0}
                >
                  <MaterialIcons 
                    name="chevron-left" 
                    size={24} 
                    color={currentPhotoIndex === 0 ? '#4A5568' : '#FFFFFF'} 
                  />
                </TouchableOpacity>
                
                <View style={styles.photoPreview}>
                  {currentLog.photoUri ? (
                    <Image 
                      source={{ uri: currentLog.photoUri }} 
                      style={styles.photoImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <MaterialIcons name="image" size={60} color="#4A5568" />
                    </View>
                  )}
                  <View style={styles.scanBadge}>
                    <MaterialIcons name="check-circle" size={16} color="#48BB78" />
                    <Text style={styles.scanBadgeText}>Scan</Text>
                  </View>
                  <Text style={styles.photoCounter}>
                    {currentPhotoIndex + 1} / {logs.length}
                  </Text>
                </View>
                
                <TouchableOpacity 
                  style={styles.navButton}
                  onPress={handleNextPhoto}
                  disabled={currentPhotoIndex === logs.length - 1}
                >
                  <MaterialIcons 
                    name="chevron-right" 
                    size={24} 
                    color={currentPhotoIndex === logs.length - 1 ? '#4A5568' : '#FFFFFF'} 
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialIcons name="add-photo-alternate" size={60} color="#4A5568" />
                <Text style={styles.placeholderText}>No photos yet</Text>
              </View>
            )}
          </View>

          {/* Your Routine Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Routine</Text>
            <Text style={styles.cardSubtitle}>Your for yow torthnies skin clarity</Text>
            
            <View style={styles.routineItems}>
              <View style={styles.routineItem}>
                <View style={styles.routineIconContainer}>
                  <MaterialIcons name="cleaning-services" size={20} color="#A0AEC0" />
                </View>
                <View style={styles.routineTextContainer}>
                  <Text style={styles.routineText}>Cleanse</Text>
                  <Text style={styles.routineSubText}>AM/PM</Text>
                </View>
                <View style={[styles.toggle, styles.toggleOn]}>
                  <View style={styles.toggleThumb} />
                </View>
              </View>

              <View style={styles.routineItem}>
                <View style={styles.routineIconContainer}>
                  <MaterialIcons name="opacity" size={20} color="#A0AEC0" />
                </View>
                <Text style={styles.routineText}>Apply Serum</Text>
                <View style={styles.toggle}>
                  <View style={[styles.toggleThumb, styles.toggleThumbOff]} />
                </View>
              </View>

              <View style={styles.routineItem}>
                <View style={styles.routineIconContainer}>
                  <MaterialIcons name="wb-sunny" size={20} color="#A0AEC0" />
                </View>
                <Text style={styles.routineText}>SPF 30+ AM</Text>
                <View style={[styles.toggle, styles.toggleOn]}>
                  <View style={styles.toggleThumb} />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom Cards Row */}
        <View style={styles.cardsRow}>
          {/* Latest Analysis Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Latest Analysis</Text>
            
            <View style={styles.analysisItem}>
              <View style={styles.analysisIconContainer}>
                <MaterialIcons name="assessment" size={24} color="#4299E1" />
              </View>
              <Text style={styles.analysisText}>
                Score {latestLog?.skinScore || 0}%
              </Text>
              <View style={[styles.toggle, styles.toggleOn]}>
                <View style={styles.toggleThumb} />
              </View>
            </View>
          </View>

          {/* View Journey Time Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>View 30 Journey Time</Text>
            <Text style={styles.cardSubtitle}>View for Time 1kegire...</Text>
            
            <View style={styles.journeyAvatarContainer}>
              <View style={styles.journeyAvatar}>
                <MaterialIcons name="face" size={32} color="#B794F4" />
              </View>
            </View>
            
            <TouchableOpacity style={styles.journeyButton}>
              <Text style={styles.journeyButtonText}>Still Now</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    backgroundColor: '#1A202C',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  healthScoreContainer: {
    flexDirection: 'row',
    backgroundColor: '#2D3748',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scoreCircleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePercentage: {
    fontSize: 32,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
  scoreChange: {
    fontSize: 11,
    color: '#48BB78',
    marginTop: 4,
  },
  gradientDef: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  statusIcons: {
    gap: theme.spacing.md,
    alignItems: 'center',
  },
  statusIcon: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    backgroundColor: '#1A202C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 10,
    color: '#A0AEC0',
    textAlign: 'center',
  },
  statusSubLabel: {
    fontSize: 9,
    color: '#718096',
    textAlign: 'center',
  },
  characterContainer: {
    alignItems: 'center',
  },
  characterPlaceholder: {
    width: 100,
    height: 130,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  characterLabel: {
    fontSize: 10,
    color: '#A0AEC0',
  },
  snapshotButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    gap: 8,
  },
  snapshotButton: {
    flex: 1,
    backgroundColor: '#2D3748',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  snapshotButtonText: {
    fontSize: 11,
    color: '#FFFFFF',
    marginTop: 6,
    fontWeight: '500',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: '#2D3748',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#718096',
    marginBottom: theme.spacing.sm,
  },
  cardLabel: {
    fontSize: 11,
    color: '#A0AEC0',
    marginBottom: theme.spacing.sm,
  },
  photoNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A202C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreview: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    position: 'relative',
  },
  photoPlaceholder: {
    aspectRatio: 4 / 3,
    backgroundColor: '#1A202C',
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoImage: {
    aspectRatio: 4 / 3,
    width: '100%',
    borderRadius: theme.borderRadius.md,
  },
  placeholderText: {
    fontSize: 11,
    color: '#718096',
    marginTop: 8,
  },
  scanBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(26, 32, 44, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  scanBadgeText: {
    fontSize: 10,
    color: '#48BB78',
    fontWeight: '600',
  },
  photoCounter: {
    position: 'absolute',
    top: 8,
    left: 8,
    fontSize: 10,
    color: '#FFFFFF',
    backgroundColor: 'rgba(26, 32, 44, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    fontWeight: '600',
  },
  routineItems: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  routineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  routineIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A202C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routineTextContainer: {
    flex: 1,
  },
  routineText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  routineSubText: {
    fontSize: 11,
    color: '#718096',
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4A5568',
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: {
    backgroundColor: '#48BB78',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-end',
  },
  toggleThumbOff: {
    alignSelf: 'flex-start',
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  analysisIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A202C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  journeyAvatarContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  journeyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1A202C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  journeyButton: {
    backgroundColor: '#4299E1',
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
  },
  journeyButtonText: {
    fontSize: 14,
    fontWeight: theme.fontWeight.bold,
    color: '#FFFFFF',
  },
});
