import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '@/constants/theme';
import { FaceAnalysis } from '@/services/faceAnalysisService';

const { width, height } = Dimensions.get('window');

interface AnalysisScreenProps {
  photoUri: string;
  analysis: FaceAnalysis | null;
  isAnalyzing: boolean;
  onSave?: () => void;
  onRetake?: () => void;
  onClose?: () => void;
  viewMode?: boolean;
}

type AnalysisType = 'hydration' | 'search' | 'poreSize' | 'color' | 'tone' | 'darkSpot' | null;

export default function AnalysisScreen({
  photoUri,
  analysis,
  isAnalyzing,
  onSave,
  onRetake,
  onClose,
  viewMode = false,
}: AnalysisScreenProps) {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pointAnims = useRef([...Array(12)].map(() => new Animated.Value(0))).current;
  const gridAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  
  const [selectedType, setSelectedType] = useState<AnalysisType>('hydration');
  const [estimatedTime] = useState(0.06);

  useEffect(() => {
    if (isAnalyzing) {
      // Scanning line animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Grid fade in
      Animated.timing(gridAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Detection points animation
      pointAnims.forEach((anim, index) => {
        Animated.loop(
          Animated.sequence([
            Animated.delay(index * 150),
            Animated.spring(anim, {
              toValue: 1,
              tension: 50,
              friction: 3,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else if (analysis) {
      scanAnim.stopAnimation();
      pointAnims.forEach(anim => anim.stopAnimation());
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isAnalyzing, analysis]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return theme.colors.success;
    if (score >= 70) return theme.colors.warning;
    return theme.colors.error;
  };

  const getFeatureColor = (value: number) => {
    if (value >= 80) return theme.colors.success;
    if (value >= 60) return theme.colors.info;
    if (value >= 40) return theme.colors.warning;
    return theme.colors.error;
  };

  const scanLineY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.5],
  });

  const handleTypePress = (type: AnalysisType) => {
    setSelectedType(type);
    Animated.timing(overlayAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  const handleScanPress = () => {
    // Navigate to camera
    if (onRetake) {
      onRetake();
    }
  };

  const getTypeConfig = (type: AnalysisType) => {
    const configs: Record<string, { color: string; icon: string; label: string }> = {
      hydration: { color: '#4299E1', icon: 'opacity', label: 'Hydration' },
      search: { color: '#8B8B8B', icon: 'search', label: 'Search' },
      poreSize: { color: '#48BB78', icon: 'blur-circular', label: 'Pore' },
      color: { color: '#ED8936', icon: 'palette', label: 'Color' },
      tone: { color: '#F6E05E', icon: 'brightness-6', label: 'Tone' },
      darkSpot: { color: '#805AD5', icon: 'brightness-3', label: 'Dark Spot' },
    };
    return configs[type || 'hydration'];
  };

  const renderHydrationOverlay = () => {
    // Blue and green gradient overlay like reference
    return (
      <Animated.View
        style={[{
          ...StyleSheet.absoluteFillObject,
          opacity: overlayAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.7],
          }),
        }]}
      >
        {/* Left side - Blue gradient */}
        <View style={styles.overlayLeftSide}>
          <LinearGradient
            colors={['#4299E180', '#63B3ED90', '#4299E1A0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
        {/* Right side - Green/Yellow gradient */}
        <View style={styles.overlayRightSide}>
          <LinearGradient
            colors={['#48BB7880', '#68D39190', '#9AE6B490']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
        {/* Sparkle dots */}
        {[...Array(20)].map((_, i) => (
          <View
            key={i}
            style={[styles.sparkle, {
              top: `${15 + Math.random() * 70}%`,
              left: `${20 + Math.random() * 60}%`,
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
            }]}
          />
        ))}
      </Animated.View>
    );
  };

  const renderAnalysisOverlay = (type: AnalysisType) => {
    if (type === 'hydration') {
      return renderHydrationOverlay();
    }
    // For other types, return similar colored overlays
    return null;
  };

  const detectionPoints = [
    { top: '15%', left: '35%' },
    { top: '15%', right: '35%' },
    { top: '28%', left: '25%' },
    { top: '28%', right: '25%' },
    { top: '35%', left: '50%' },
    { top: '42%', left: '20%' },
    { top: '42%', right: '20%' },
    { top: '50%', left: '48%' },
    { top: '58%', left: '35%' },
    { top: '58%', right: '35%' },
    { top: '65%', left: '42%' },
    { top: '65%', right: '42%' },
  ];

  return (
    <LinearGradient
      colors={['#F5F5F5', '#FFFFFF']}
      style={styles.container}
    >
      {/* Photo with overlay */}
      <View style={styles.photoContainer}>
        {photoUri && photoUri.startsWith('http') ? (
          <Image 
            source={{ uri: photoUri }} 
            style={styles.photo} 
            contentFit="cover"
            cachePolicy="none"
            onError={(error) => {
              console.error('Error loading photo in analysis screen:', error);
              console.log('Photo URI:', photoUri);
              console.log('URI type:', typeof photoUri);
              console.log('URI starts with http:', photoUri?.startsWith('http'));
            }}
          />
        ) : (
          <View style={[styles.photo, { backgroundColor: '#2D3748', justifyContent: 'center', alignItems: 'center' }]}>
            <MaterialIcons name="image" size={80} color="#4A5568" />
            <Text style={{ color: '#A0AEC0', marginTop: 16 }}>Photo unavailable</Text>
          </View>
        )}
        
        {/* Analysis overlays */}
        {analysis && !isAnalyzing && selectedType && (
          <View style={styles.overlayContainer}>
            {renderAnalysisOverlay(selectedType)}
          </View>
        )}

        {/* Icon buttons row below photo */}
        {analysis && !isAnalyzing && (
          <View style={styles.iconButtonsRow}>
            <TouchableOpacity
              style={[
                styles.iconButton,
                selectedType === 'hydration' && styles.iconButtonActive,
              ]}
              onPress={() => handleTypePress('hydration')}
            >
              <View style={[styles.iconCircle, { borderColor: getTypeConfig('hydration').color }]}>
                <MaterialIcons
                  name={getTypeConfig('hydration').icon as any}
                  size={24}
                  color={selectedType === 'hydration' ? '#FFFFFF' : getTypeConfig('hydration').color}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconButton,
                selectedType === 'search' && styles.iconButtonActive,
              ]}
              onPress={() => handleTypePress('search')}
            >
              <View style={[styles.iconCircle, { borderColor: getTypeConfig('search').color }]}>
                <MaterialIcons
                  name={getTypeConfig('search').icon as any}
                  size={24}
                  color={selectedType === 'search' ? '#FFFFFF' : getTypeConfig('search').color}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconButton,
                selectedType === 'poreSize' && styles.iconButtonActive,
              ]}
              onPress={() => handleTypePress('poreSize')}
            >
              <View style={[styles.iconCircle, { borderColor: getTypeConfig('poreSize').color }]}>
                <MaterialIcons
                  name={getTypeConfig('poreSize').icon as any}
                  size={24}
                  color={selectedType === 'poreSize' ? '#FFFFFF' : getTypeConfig('poreSize').color}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconButton,
                selectedType === 'color' && styles.iconButtonActive,
              ]}
              onPress={() => handleTypePress('color')}
            >
              <View style={[styles.iconCircle, { borderColor: getTypeConfig('color').color }]}>
                <MaterialIcons
                  name={getTypeConfig('color').icon as any}
                  size={24}
                  color={selectedType === 'color' ? '#FFFFFF' : getTypeConfig('color').color}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconButton,
                selectedType === 'tone' && styles.iconButtonActive,
              ]}
              onPress={() => handleTypePress('tone')}
            >
              <View style={[styles.iconCircle, { borderColor: getTypeConfig('tone').color }]}>
                <MaterialIcons
                  name={getTypeConfig('tone').icon as any}
                  size={24}
                  color={selectedType === 'tone' ? '#FFFFFF' : getTypeConfig('tone').color}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.iconButton,
                selectedType === 'darkSpot' && styles.iconButtonActive,
              ]}
              onPress={() => handleTypePress('darkSpot')}
            >
              <View style={[styles.iconCircle, { borderColor: getTypeConfig('darkSpot').color }]}>
                <MaterialIcons
                  name={getTypeConfig('darkSpot').icon as any}
                  size={24}
                  color={selectedType === 'darkSpot' ? '#FFFFFF' : getTypeConfig('darkSpot').color}
                />
              </View>
            </TouchableOpacity>

            {/* Scan Button */}
            <TouchableOpacity
              style={styles.scanIconButton}
              onPress={handleScanPress}
            >
              <View style={[styles.iconCircle, styles.scanCircle]}>
                <MaterialIcons name="camera-alt" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.scanLabel}>Scan</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {isAnalyzing && (
          <>
            {/* Dark overlay */}
            <View style={styles.scanOverlay} />
            
            {/* Grid overlay */}
            <Animated.View style={[styles.gridContainer, { opacity: gridAnim }]}>
              {[...Array(8)].map((_, i) => (
                <View key={`h-${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 12}%` }]} />
              ))}
              {[...Array(6)].map((_, i) => (
                <View key={`v-${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 16}%` }]} />
              ))}
            </Animated.View>

            {/* Scanning line with glow */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  transform: [{ translateY: scanLineY }],
                },
              ]}
            >
              <LinearGradient
                colors={['transparent', theme.colors.primary, theme.colors.secondary, 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.scanLineGradient}
              />
            </Animated.View>
            
            {/* Detection points with animation */}
            {detectionPoints.map((point, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.scanPoint,
                  point,
                  {
                    opacity: pointAnims[index],
                    transform: [{ scale: pointAnims[index] }],
                  },
                ]}
              >
                <View style={styles.scanPointInner} />
                <View style={styles.scanPointRing} />
              </Animated.View>
            ))}

            {/* Face detection frame */}
            <Animated.View style={[styles.faceFrame, { transform: [{ scale: pulseAnim }] }]}>
              <View style={[styles.frameCorner, styles.topLeft]} />
              <View style={[styles.frameCorner, styles.topRight]} />
              <View style={[styles.frameCorner, styles.bottomLeft]} />
              <View style={[styles.frameCorner, styles.bottomRight]} />
            </Animated.View>
            
            <BlurView intensity={40} style={styles.analyzingContainer}>
              <View style={styles.analyzingContent}>
                <Animated.View style={{ transform: [{ rotate: '360deg' }] }}>
                  <MaterialIcons name="auto-awesome" size={28} color={theme.colors.primary} />
                </Animated.View>
                <View style={styles.analyzingTextContainer}>
                  <Text style={styles.analyzingTitle}>AI Analysis in Progress</Text>
                  <Text style={styles.analyzingSubtitle}>Detecting facial features...</Text>
                </View>
              </View>
            </BlurView>
          </>
        )}
      </View>

      {/* Analysis Results - Compact Design */}
      {analysis && !isAnalyzing && (
        <Animated.View style={[styles.resultsContainer, { opacity: fadeAnim }]}>
          <ScrollView
            contentContainerStyle={styles.resultsContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Estimated Time */}
            <View style={styles.timeCard}>
              <Text style={styles.timeText}>Estimated Time Remaining: {estimatedTime.toFixed(2)}</Text>
              <TouchableOpacity>
                <MaterialIcons name="edit" size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>

            {/* Comprehensive Skin Analysis Title */}
            <Text style={styles.analysisTitle}>Comprehensive Skin Analysis</Text>

            {/* Analysis Cards */}
            <View style={styles.analysisCards}>
              {/* Hydration Card */}
              <TouchableOpacity style={styles.analysisCard} activeOpacity={0.8}>
                <View style={[styles.analysisIconCircle, { backgroundColor: '#4299E1' }]}>
                  <MaterialIcons name="opacity" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.analysisCardContent}>
                  <Text style={styles.analysisCardTitle}>
                    Hydration {Math.round(analysis.detectedFeatures.hydration)}% (Optimal)
                  </Text>
                  <Text style={styles.analysisCardSubtitle}>
                    Essential for plumpness & barrier function.
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${analysis.detectedFeatures.hydration}%`,
                          backgroundColor: '#48BB78',
                        },
                      ]}
                    />
                  </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>

              {/* Pore Size Card */}
              <TouchableOpacity style={styles.analysisCard} activeOpacity={0.8}>
                <View style={[styles.analysisIconCircle, { backgroundColor: '#48BB78' }]}>
                  <MaterialIcons name="blur-circular" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.analysisCardContent}>
                  <Text style={styles.analysisCardTitle}>Pore Size: 0.3mm (Minimal)</Text>
                  <Text style={styles.analysisCardSubtitle}>Red blue mes onde your formation.</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: '30%',
                          backgroundColor: '#F6AD55',
                        },
                      ]}
                    />
                  </View>
                </View>
                <MaterialIcons name="more-horiz" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>

              {/* Redness Card */}
              <TouchableOpacity style={styles.analysisCard} activeOpacity={0.8}>
                <View style={[styles.analysisIconCircle, { backgroundColor: '#FC8181' }]}>
                  <MaterialIcons name="local-fire-department" size={28} color="#FFFFFF" />
                </View>
                <View style={styles.analysisCardContent}>
                  <Text style={styles.analysisCardTitle}>
                    Redness {Math.round(analysis.detectedFeatures.redness)}% (Lúintas)
                  </Text>
                  <Text style={styles.analysisCardSubtitle}>Sound a cluse for tallak.</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>

            {/* Personalized Recommendations */}
            <View style={styles.recommendationsCard}>
              <Text style={styles.recommendationsTitle}>Personalized Recommendations</Text>
              {analysis.recommendations.slice(0, 2).map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <Text style={styles.recommendationBullet}>•</Text>
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </View>

            {/* Action Buttons */}
            {!viewMode && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.retakeButton} onPress={onRetake} activeOpacity={0.8}>
                  <BlurView intensity={30} style={styles.buttonBlur}>
                    <MaterialIcons name="refresh" size={22} color={theme.colors.text} />
                    <Text style={styles.retakeButtonText}>Retake</Text>
                  </BlurView>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.saveButton} onPress={onSave} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveGradient}
                  >
                    <MaterialIcons name="check-circle" size={22} color={theme.colors.text} />
                    <Text style={styles.saveButtonText}>Save Analysis</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
            {viewMode && onClose && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.saveGradient}
                  >
                    <MaterialIcons name="close" size={22} color={theme.colors.text} />
                    <Text style={styles.saveButtonText}>Close</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  photoContainer: {
    width: width,
    height: height * 0.55,
    overflow: 'hidden',
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
    backgroundColor: '#FFFFFF',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayLeftSide: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  overlayRightSide: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
  },
  sparkle: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    opacity: 0.8,
  },
  iconButtonsRow: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: theme.spacing.lg,
  },
  iconButton: {
    alignItems: 'center',
  },
  iconButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scanIconButton: {
    alignItems: 'center',
  },
  scanCircle: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  scanLabel: {
    fontSize: 10,
    color: '#333',
    marginTop: 4,
    fontWeight: '600',
  },
  scanOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: theme.colors.primary + '40',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: theme.colors.primary + '40',
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
  },
  scanLineGradient: {
    width: '100%',
    height: '100%',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
  },
  scanPoint: {
    position: 'absolute',
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    marginTop: -10,
  },
  scanPointInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  scanPointRing: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.primary + '80',
  },
  faceFrame: {
    position: 'absolute',
    top: '10%',
    left: '15%',
    right: '15%',
    bottom: '25%',
    borderWidth: 2,
    borderColor: theme.colors.secondary + '80',
    borderRadius: theme.borderRadius.xl,
  },
  frameCorner: {
    position: 'absolute',
    width: 30,
    height: 30,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: theme.colors.primary,
    borderTopLeftRadius: theme.borderRadius.md,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: theme.colors.primary,
    borderTopRightRadius: theme.borderRadius.md,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: theme.colors.primary,
    borderBottomLeftRadius: theme.borderRadius.md,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: theme.colors.primary,
    borderBottomRightRadius: theme.borderRadius.md,
  },
  analyzingContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  analyzingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  analyzingTextContainer: {
    flex: 1,
  },
  analyzingTitle: {
    color: theme.colors.text,
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    marginBottom: 4,
  },
  analyzingSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.sm,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  resultsContent: {
    padding: theme.spacing.lg,
  },
  timeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  timeText: {
    fontSize: theme.fontSize.sm,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: theme.fontWeight.bold,
    color: '#1A202C',
    marginBottom: theme.spacing.md,
  },
  analysisCards: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  analysisCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2D3748',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  analysisIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisCardContent: {
    flex: 1,
  },
  analysisCardTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  analysisCardSubtitle: {
    fontSize: theme.fontSize.sm,
    color: '#A0AEC0',
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#4A5568',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  recommendationsCard: {
    backgroundColor: '#2D3748',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  recommendationsTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.sm,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: theme.spacing.xs,
  },
  recommendationBullet: {
    fontSize: theme.fontSize.md,
    color: '#FFFFFF',
    marginRight: theme.spacing.sm,
  },
  recommendationText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: '#A0AEC0',
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  retakeButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  buttonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    overflow: 'hidden',
  },
  retakeButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  saveButton: {
    flex: 2,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  saveGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
  },
  saveButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  closeButton: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
});
