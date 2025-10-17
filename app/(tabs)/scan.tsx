import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import CameraScreen from '@/components/CameraScreen';
import AnalysisScreen from '@/components/AnalysisScreen';
import { faceAnalysisService } from '@/services/faceAnalysisService';
import { useSkinCare } from '@/hooks/useSkinCare';

export default function ScanScreen() {
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { addLog } = useSkinCare();

  useFocusEffect(
    React.useCallback(() => {
      // Open camera when tab is focused
      setCameraVisible(true);
      return () => {
        // Cleanup when leaving
        setCameraVisible(false);
      };
    }, [])
  );

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
      setCameraVisible(true);
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    setAnalysis(null);
    setCameraVisible(true);
  };

  const handleClose = () => {
    setCameraVisible(false);
    setCapturedPhoto(null);
    setAnalysis(null);
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
    <View style={styles.container}>
      <CameraScreen
        visible={cameraVisible}
        onClose={handleClose}
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
});
