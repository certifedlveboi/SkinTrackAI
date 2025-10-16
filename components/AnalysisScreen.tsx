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
  onSave: () => void;
  onRetake: () => void;
}

type KPIType = 'skinScore' | 'acne' | 'texture' | 'redness' | 'darkSpots' | 'hydration' | null;

export default function AnalysisScreen({
  photoUri,
  analysis,
  isAnalyzing,
  onSave,
  onRetake,
}: AnalysisScreenProps) {
  const scanAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pointAnims = useRef([...Array(12)].map(() => new Animated.Value(0))).current;
  const gridAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  
  const [selectedKPI, setSelectedKPI] = useState<KPIType>(null);

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

  const handleKPIPress = (kpi: KPIType) => {
    if (selectedKPI === kpi) {
      // Deselect if already selected
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setSelectedKPI(null));
    } else {
      // Select new KPI
      setSelectedKPI(kpi);
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  };

  const getKPIConfig = (type: string) => {
    const configs: Record<string, { color: string; icon: string; label: string }> = {
      skinScore: { color: '#7DD3C0', icon: 'stars', label: 'Overall' },
      acne: { color: '#F56565', icon: 'warning', label: 'Acne' },
      texture: { color: '#9F7AEA', icon: 'grain', label: 'Texture' },
      redness: { color: '#FC8181', icon: 'local-fire-department', label: 'Redness' },
      darkSpots: { color: '#805AD5', icon: 'brightness-3', label: 'Spots' },
      hydration: { color: '#4299E1', icon: 'opacity', label: 'Hydration' },
    };
    return configs[type] || configs.skinScore;
  };

  const renderAcneOverlay = () => {
    // Acne spots as circular dots
    const acneSpots = [
      { top: '20%', left: '42%', size: 12 },
      { top: '25%', left: '38%', size: 10 },
      { top: '23%', left: '55%', size: 14 },
      { top: '28%', left: '48%', size: 8 },
      { top: '43%', left: '50%', size: 11 },
      { top: '46%', left: '53%', size: 9 },
      { top: '58%', left: '32%', size: 13 },
      { top: '60%', left: '35%', size: 10 },
      { top: '62%', left: '30%', size: 8 },
      { top: '59%', left: '60%', size: 12 },
      { top: '63%', left: '65%', size: 9 },
      { top: '61%', left: '57%', size: 11 },
    ];

    return acneSpots.map((spot, index) => (
      <Animated.View
        key={index}
        style={[
          styles.acneSpot,
          {
            top: spot.top,
            left: spot.left,
            width: spot.size,
            height: spot.size,
            borderRadius: spot.size / 2,
            opacity: overlayAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.8],
            }),
            transform: [
              {
                scale: overlayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
          },
        ]}>
        <View style={styles.acneSpotInner} />
      </Animated.View>
    ));
  };

  const renderHydrationOverlay = () => {
    // Full blue moisture filter with droplet patterns
    const moistureDroplets = [
      { top: '30%', left: '28%', size: 16 },
      { top: '32%', left: '70%', size: 14 },
      { top: '48%', left: '40%', size: 20 },
      { top: '50%', left: '58%', size: 18 },
      { top: '65%', left: '35%', size: 15 },
      { top: '68%', left: '62%', size: 17 },
    ];

    return (
      <>
        <Animated.View
          style={[
            styles.hydrationFullOverlay,
            {
              opacity: overlayAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.4],
              }),
            },
          ]}>
          <LinearGradient
            colors={['#4299E160', '#63B3ED80', '#4299E160']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {moistureDroplets.map((droplet, index) => (
          <Animated.View
            key={index}
            style={[
              styles.moistureDroplet,
              {
                top: droplet.top,
                left: droplet.left,
                width: droplet.size,
                height: droplet.size,
                borderRadius: droplet.size / 2,
                opacity: overlayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.7],
                }),
                transform: [
                  {
                    scale: overlayAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.dropletShine} />
          </Animated.View>
        ))}
      </>
    );
  };

  const renderTextureOverlay = () => {
    // Grid pattern showing texture analysis
    const textureAreas = [
      { top: '38%', left: '40%', width: '20%', height: '25%' },
      { top: '52%', left: '25%', width: '22%', height: '20%' },
      { top: '52%', left: '53%', width: '22%', height: '20%' },
    ];

    return textureAreas.map((area, areaIndex) => (
      <Animated.View
        key={areaIndex}
        style={[
          styles.textureArea,
          {
            top: area.top,
            left: area.left,
            width: area.width,
            height: area.height,
            opacity: overlayAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.6],
            }),
          },
        ]}>
        <View style={styles.textureGrid}>
          {[...Array(4)].map((_, row) => (
            <View key={row} style={styles.textureRow}>
              {[...Array(4)].map((_, col) => (
                <View key={col} style={styles.textureCell} />
              ))}
            </View>
          ))}
        </View>
      </Animated.View>
    ));
  };

  const renderRednessOverlay = () => {
    // Red tinted areas showing redness
    const rednessAreas = [
      { top: '40%', left: '48%', width: '14%', height: '18%', intensity: 0.7 },
      { top: '55%', left: '30%', width: '18%', height: '16%', intensity: 0.6 },
      { top: '55%', left: '52%', width: '18%', height: '16%', intensity: 0.6 },
    ];

    return rednessAreas.map((area, index) => (
      <Animated.View
        key={index}
        style={[
          styles.rednessArea,
          {
            top: area.top,
            left: area.left,
            width: area.width,
            height: area.height,
            opacity: overlayAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, area.intensity],
            }),
            transform: [
              {
                scale: overlayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}>
        <LinearGradient
          colors={['#FC818180', '#F5656580', '#FC818180']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.rednessGradient}
        />
      </Animated.View>
    ));
  };

  const renderDarkSpotsOverlay = () => {
    // Circular dark spots with gradients
    const darkSpots = [
      { top: '22%', left: '40%', size: 28 },
      { top: '26%', left: '58%', size: 24 },
      { top: '30%', left: '35%', size: 20 },
      { top: '60%', left: '33%', size: 26 },
      { top: '63%', left: '60%', size: 22 },
      { top: '55%', left: '48%', size: 18 },
    ];

    return darkSpots.map((spot, index) => (
      <Animated.View
        key={index}
        style={[
          styles.darkSpot,
          {
            top: spot.top,
            left: spot.left,
            width: spot.size,
            height: spot.size,
            borderRadius: spot.size / 2,
            opacity: overlayAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.75],
            }),
            transform: [
              {
                scale: overlayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 1],
                }),
              },
            ],
          },
        ]}>
        <LinearGradient
          colors={['#805AD5', '#553C9A', '#2D3748']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.darkSpotGradient}
        />
      </Animated.View>
    ));
  };

  const renderSkinScoreOverlay = () => {
    // Face mesh overlay with scanning grid
    return (
      <Animated.View
        style={[
          styles.faceOutline,
          {
            opacity: overlayAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.8],
            }),
          },
        ]}>
        <View style={styles.faceOvalBorder} />
        <View style={styles.scanGridOverlay}>
          {[...Array(6)].map((_, i) => (
            <View key={`h-${i}`} style={[styles.scanGridLineH, { top: `${(i + 1) * 14}%` }]} />
          ))}
          {[...Array(5)].map((_, i) => (
            <View key={`v-${i}`} style={[styles.scanGridLineV, { left: `${(i + 1) * 16.6}%` }]} />
          ))}
        </View>
      </Animated.View>
    );
  };

  const renderKPIOverlay = (type: KPIType) => {
    switch (type) {
      case 'acne':
        return renderAcneOverlay();
      case 'hydration':
        return renderHydrationOverlay();
      case 'texture':
        return renderTextureOverlay();
      case 'redness':
        return renderRednessOverlay();
      case 'darkSpots':
        return renderDarkSpotsOverlay();
      case 'skinScore':
        return renderSkinScoreOverlay();
      default:
        return null;
    }
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
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={styles.container}
    >
      {/* Photo with advanced scanning overlay */}
      <View style={styles.photoContainer}>
        <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
        
        {/* Interactive overlays for selected KPI */}
        {analysis && !isAnalyzing && selectedKPI && (
          <View style={styles.overlayContainer}>
            <View style={styles.overlayDarkBg} />
            {renderKPIOverlay(selectedKPI)}
            {/* KPI Label on overlay */}
            <Animated.View
              style={[
                styles.overlayLabel,
                {
                  opacity: overlayAnim,
                  transform: [
                    {
                      translateY: overlayAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <BlurView intensity={30} style={styles.overlayLabelBlur}>
                <MaterialIcons
                  name={getKPIConfig(selectedKPI).icon as any}
                  size={20}
                  color={getKPIConfig(selectedKPI).color}
                />
                <Text style={styles.overlayLabelText}>{getKPIConfig(selectedKPI).label}</Text>
              </BlurView>
            </Animated.View>
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
        
        {/* KPI Buttons at bottom of photo */}
        {analysis && !isAnalyzing && (
          <View style={styles.kpiButtonsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.kpiScrollContent}
            >
              {/* Skin Score KPI */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleKPIPress('skinScore')}
                style={[
                  styles.kpiButton,
                  selectedKPI === 'skinScore' && styles.kpiButtonActive,
                ]}
              >
                <BlurView intensity={40} style={styles.kpiButtonBlur}>
                  <View style={[
                    styles.kpiIconContainer,
                    { backgroundColor: getKPIConfig('skinScore').color + '30' },
                    selectedKPI === 'skinScore' && styles.kpiIconActive,
                  ]}>
                    <MaterialIcons
                      name={getKPIConfig('skinScore').icon as any}
                      size={24}
                      color={getKPIConfig('skinScore').color}
                    />
                  </View>
                  <Text style={styles.kpiValue}>{analysis.skinScore}</Text>
                  <Text style={styles.kpiLabel}>Overall</Text>
                </BlurView>
              </TouchableOpacity>

              {/* Acne KPI */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleKPIPress('acne')}
                style={[
                  styles.kpiButton,
                  selectedKPI === 'acne' && styles.kpiButtonActive,
                ]}
              >
                <BlurView intensity={40} style={styles.kpiButtonBlur}>
                  <View style={[
                    styles.kpiIconContainer,
                    { backgroundColor: getKPIConfig('acne').color + '30' },
                    selectedKPI === 'acne' && styles.kpiIconActive,
                  ]}>
                    <MaterialIcons
                      name={getKPIConfig('acne').icon as any}
                      size={24}
                      color={getKPIConfig('acne').color}
                    />
                  </View>
                  <Text style={styles.kpiValue}>{Math.round(analysis.detectedFeatures.acne)}</Text>
                  <Text style={styles.kpiLabel}>Acne</Text>
                </BlurView>
              </TouchableOpacity>

              {/* Texture KPI */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleKPIPress('texture')}
                style={[
                  styles.kpiButton,
                  selectedKPI === 'texture' && styles.kpiButtonActive,
                ]}
              >
                <BlurView intensity={40} style={styles.kpiButtonBlur}>
                  <View style={[
                    styles.kpiIconContainer,
                    { backgroundColor: getKPIConfig('texture').color + '30' },
                    selectedKPI === 'texture' && styles.kpiIconActive,
                  ]}>
                    <MaterialIcons
                      name={getKPIConfig('texture').icon as any}
                      size={24}
                      color={getKPIConfig('texture').color}
                    />
                  </View>
                  <Text style={styles.kpiValue}>{Math.round(analysis.detectedFeatures.texture)}</Text>
                  <Text style={styles.kpiLabel}>Texture</Text>
                </BlurView>
              </TouchableOpacity>

              {/* Redness KPI */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleKPIPress('redness')}
                style={[
                  styles.kpiButton,
                  selectedKPI === 'redness' && styles.kpiButtonActive,
                ]}
              >
                <BlurView intensity={40} style={styles.kpiButtonBlur}>
                  <View style={[
                    styles.kpiIconContainer,
                    { backgroundColor: getKPIConfig('redness').color + '30' },
                    selectedKPI === 'redness' && styles.kpiIconActive,
                  ]}>
                    <MaterialIcons
                      name={getKPIConfig('redness').icon as any}
                      size={24}
                      color={getKPIConfig('redness').color}
                    />
                  </View>
                  <Text style={styles.kpiValue}>{Math.round(analysis.detectedFeatures.redness)}</Text>
                  <Text style={styles.kpiLabel}>Redness</Text>
                </BlurView>
              </TouchableOpacity>

              {/* Dark Spots KPI */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleKPIPress('darkSpots')}
                style={[
                  styles.kpiButton,
                  selectedKPI === 'darkSpots' && styles.kpiButtonActive,
                ]}
              >
                <BlurView intensity={40} style={styles.kpiButtonBlur}>
                  <View style={[
                    styles.kpiIconContainer,
                    { backgroundColor: getKPIConfig('darkSpots').color + '30' },
                    selectedKPI === 'darkSpots' && styles.kpiIconActive,
                  ]}>
                    <MaterialIcons
                      name={getKPIConfig('darkSpots').icon as any}
                      size={24}
                      color={getKPIConfig('darkSpots').color}
                    />
                  </View>
                  <Text style={styles.kpiValue}>{Math.round(analysis.detectedFeatures.darkSpots)}</Text>
                  <Text style={styles.kpiLabel}>Spots</Text>
                </BlurView>
              </TouchableOpacity>

              {/* Hydration KPI */}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleKPIPress('hydration')}
                style={[
                  styles.kpiButton,
                  selectedKPI === 'hydration' && styles.kpiButtonActive,
                ]}
              >
                <BlurView intensity={40} style={styles.kpiButtonBlur}>
                  <View style={[
                    styles.kpiIconContainer,
                    { backgroundColor: getKPIConfig('hydration').color + '30' },
                    selectedKPI === 'hydration' && styles.kpiIconActive,
                  ]}>
                    <MaterialIcons
                      name={getKPIConfig('hydration').icon as any}
                      size={24}
                      color={getKPIConfig('hydration').color}
                    />
                  </View>
                  <Text style={styles.kpiValue}>{Math.round(analysis.detectedFeatures.hydration)}</Text>
                  <Text style={styles.kpiLabel}>Hydration</Text>
                </BlurView>
              </TouchableOpacity>
            </ScrollView>
          </View>
        )}
      </View>

      {/* Analysis Results */}
      {analysis && !isAnalyzing && (
        <Animated.View style={[styles.resultsContainer, { opacity: fadeAnim }]}>
          <ScrollView
            contentContainerStyle={styles.resultsContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Score Card */}
            <Animated.View style={[styles.heroCard, { transform: [{ scale: scaleAnim }] }]}>
              <LinearGradient
                colors={[theme.colors.primary + '40', theme.colors.secondary + '40']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
              >
                <BlurView intensity={30} style={styles.heroBlur}>
                  <Text style={styles.heroLabel}>Skin Health Score</Text>
                  <View style={styles.scoreCircle}>
                    <Text style={[styles.heroScore, { color: getScoreColor(analysis.skinScore) }]}>
                      {analysis.skinScore}
                    </Text>
                  </View>
                  <View style={styles.scoreBar}>
                    <View style={[styles.scoreBarFill, { 
                      width: `${analysis.skinScore}%`,
                      backgroundColor: getScoreColor(analysis.skinScore),
                    }]} />
                  </View>
                  <Text style={styles.heroSubtext}>
                    {analysis.skinScore >= 85 ? 'Excellent' : 
                     analysis.skinScore >= 70 ? 'Good' : 
                     analysis.skinScore >= 50 ? 'Fair' : 'Needs Care'}
                  </Text>
                </BlurView>
              </LinearGradient>
            </Animated.View>

            {/* Skin Features Analysis */}
            <View style={styles.featuresGrid}>
              {Object.entries(analysis.detectedFeatures).map(([feature, value], index) => (
                <Animated.View
                  key={feature}
                  style={[
                    styles.featureCard,
                    {
                      opacity: fadeAnim,
                      transform: [
                        {
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <BlurView intensity={20} style={styles.featureBlur}>
                    <Text style={styles.featureName}>
                      {feature.charAt(0).toUpperCase() + feature.slice(1)}
                    </Text>
                    <Text style={[styles.featureValue, { color: getFeatureColor(value) }]}>
                      {Math.round(value)}
                    </Text>
                    <View style={styles.featureBar}>
                      <View
                        style={[
                          styles.featureBarFill,
                          {
                            width: `${value}%`,
                            backgroundColor: getFeatureColor(value),
                          },
                        ]}
                      />
                    </View>
                  </BlurView>
                </Animated.View>
              ))}
            </View>

            {/* Skin Type Card */}
            <BlurView intensity={30} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <MaterialIcons name="face-retouching-natural" size={24} color={theme.colors.tertiary} />
                </View>
                <Text style={styles.cardTitle}>Detected Skin Type</Text>
              </View>
              <View style={styles.skinTypeContainer}>
                <Text style={styles.skinTypeText}>{analysis.skinType.toUpperCase()}</Text>
              </View>
            </BlurView>

            {/* Concerns Section */}
            {analysis.concerns.length > 0 && (
              <BlurView intensity={30} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardIconContainer}>
                    <MaterialIcons name="visibility" size={24} color={theme.colors.warning} />
                  </View>
                  <Text style={styles.cardTitle}>Detected Areas</Text>
                  <View style={styles.concernsBadge}>
                    <Text style={styles.concernsCount}>{analysis.concerns.length}</Text>
                  </View>
                </View>
                {analysis.concerns.map((concern, index) => (
                  <View key={index} style={styles.concernItem}>
                    <View style={styles.concernLeft}>
                      <View style={[
                        styles.concernDot,
                        { backgroundColor: 
                          concern.severity === 'high' ? theme.colors.error :
                          concern.severity === 'medium' ? theme.colors.warning :
                          theme.colors.success
                        }
                      ]} />
                      <View>
                        <Text style={styles.concernType}>{concern.type}</Text>
                        {concern.location && (
                          <Text style={styles.concernLocation}>📍 {concern.location}</Text>
                        )}
                      </View>
                    </View>
                    <View style={[
                      styles.severityBadge,
                      {
                        backgroundColor:
                          concern.severity === 'high' ? theme.colors.error + '30' :
                          concern.severity === 'medium' ? theme.colors.warning + '30' :
                          theme.colors.success + '30',
                      },
                    ]}>
                      <Text style={[
                        styles.severityText,
                        {
                          color:
                            concern.severity === 'high' ? theme.colors.error :
                            concern.severity === 'medium' ? theme.colors.warning :
                            theme.colors.success,
                        },
                      ]}>
                        {concern.severity}
                      </Text>
                    </View>
                  </View>
                ))}
              </BlurView>
            )}

            {/* Recommendations */}
            <BlurView intensity={30} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <MaterialIcons name="tips-and-updates" size={24} color={theme.colors.accent} />
                </View>
                <Text style={styles.cardTitle}>AI Recommendations</Text>
              </View>
              {analysis.recommendations.map((rec, index) => (
                <View key={index} style={styles.recommendationItem}>
                  <View style={styles.recommendationNumber}>
                    <Text style={styles.recommendationNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.recommendationText}>{rec}</Text>
                </View>
              ))}
            </BlurView>

            {/* Action Buttons */}
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
    height: height * 0.5,
    overflow: 'hidden',
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  photo: {
    width: '100%',
    height: '100%',
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
  },
  resultsContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },
  heroCard: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
  },
  heroGradient: {
    borderRadius: theme.borderRadius.xl,
    padding: 2,
  },
  heroBlur: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: theme.borderRadius.xl,
  },
  heroLabel: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.semibold,
    marginBottom: theme.spacing.md,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.glass,
    borderWidth: 3,
    borderColor: theme.colors.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  heroScore: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
  },
  scoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.sm,
    marginVertical: theme.spacing.md,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  heroSubtext: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    fontWeight: theme.fontWeight.semibold,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  featureCard: {
    width: (width - theme.spacing.lg * 2 - theme.spacing.md) / 2,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  featureBlur: {
    padding: theme.spacing.md,
    overflow: 'hidden',
  },
  featureName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  featureValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    marginBottom: theme.spacing.sm,
  },
  featureBar: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  featureBarFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  card: {
    backgroundColor: theme.colors.glass,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  cardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.glass,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  skinTypeContainer: {
    backgroundColor: theme.colors.primary + '30',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  skinTypeText: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    letterSpacing: 2,
  },
  concernsBadge: {
    backgroundColor: theme.colors.warning + '30',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.round,
    minWidth: 28,
    alignItems: 'center',
  },
  concernsCount: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.warning,
  },
  concernItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  concernLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  concernDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  concernType: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  concernLocation: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  severityBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  severityText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    textTransform: 'uppercase',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  recommendationNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.accent + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationNumberText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.accent,
  },
  recommendationText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    paddingTop: 4,
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
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayDarkBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  // Acne overlay styles
  acneSpot: {
    position: 'absolute',
    backgroundColor: '#F5656590',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F56565',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  acneSpotInner: {
    width: '60%',
    height: '60%',
    borderRadius: 100,
    backgroundColor: '#C53030',
  },
  // Hydration overlay styles
  hydrationFullOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  moistureDroplet: {
    position: 'absolute',
    backgroundColor: '#63B3ED',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    shadowColor: '#4299E1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  dropletShine: {
    width: '35%',
    height: '35%',
    borderRadius: 100,
    backgroundColor: '#FFFFFF60',
    margin: '10%',
  },
  // Texture overlay styles
  textureArea: {
    position: 'absolute',
    backgroundColor: '#9F7AEA40',
    borderRadius: theme.borderRadius.md,
  },
  textureGrid: {
    flex: 1,
    padding: 2,
  },
  textureRow: {
    flex: 1,
    flexDirection: 'row',
  },
  textureCell: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#9F7AEA',
    margin: 1,
  },
  // Redness overlay styles
  rednessArea: {
    position: 'absolute',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  rednessGradient: {
    flex: 1,
  },
  // Dark spots overlay styles
  darkSpot: {
    position: 'absolute',
    overflow: 'hidden',
    shadowColor: '#805AD5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  darkSpotGradient: {
    flex: 1,
  },
  // Skin score overlay styles
  faceOutline: {
    position: 'absolute',
    top: '15%',
    left: '20%',
    right: '20%',
    bottom: '25%',
  },
  faceOvalBorder: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 3,
    borderColor: '#7DD3C0',
    borderRadius: 1000,
    shadowColor: '#7DD3C0',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  scanGridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scanGridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#7DD3C080',
  },
  scanGridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: '#7DD3C080',
  },
  overlayLabel: {
    position: 'absolute',
    top: 20,
    right: 20,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  overlayLabelBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
    overflow: 'hidden',
  },
  overlayLabelText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  kpiButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: theme.spacing.md,
  },
  kpiScrollContent: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  kpiButton: {
    width: 90,
    height: 100,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  kpiButtonActive: {
    borderColor: theme.colors.primary,
    transform: [{ scale: 1.05 }],
  },
  kpiButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    overflow: 'hidden',
  },
  kpiIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  kpiIconActive: {
    transform: [{ scale: 1.1 }],
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.fontWeight.medium,
  },
});
