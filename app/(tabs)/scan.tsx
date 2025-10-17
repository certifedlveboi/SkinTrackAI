import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import CameraScreen from '@/components/CameraScreen';
import AnalysisScreen from '@/components/AnalysisScreen';
import { faceAnalysisService } from '@/services/faceAnalysisService';
import { useSkinCare } from '@/hooks/useSkinCare';
import { useAlert } from '@/template';

export default function ScanScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { addLog, refresh } = useSkinCare();

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
      try {
        setIsSaving(true);
        console.log('Starting save process...');
        
        const condition = faceAnalysisService.getConditionFromScore(analysis.skinScore);
        const concerns = analysis.concerns.map((c: any) => c.type);
        
        console.log('Saving log with photo:', capturedPhoto);
        
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
            concerns: analysis.concerns,
          },
        });

        console.log('Log saved successfully');

        // Refresh data immediately
        console.log('Refreshing data...');
        await refresh();
        console.log('Data refreshed');

        // Reset state
        setCapturedPhoto(null);
        setAnalysis(null);
        setCameraVisible(false);
        
        // Navigate to home tab
        router.push('/(tabs)');
        
        // Show success message
        showAlert('Success', 'Skin analysis saved successfully!');
      } catch (error: any) {
        console.error('Error saving analysis:', error);
        showAlert('Error', error?.message || 'Failed to save analysis. Please try again.');
      } finally {
        setIsSaving(false);
      }
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
        isAnalyzing={isAnalyzing || isSaving}
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
