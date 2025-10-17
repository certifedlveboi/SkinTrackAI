import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import CameraScreen from '@/components/CameraScreen';
import AnalysisScreen from '@/components/AnalysisScreen';
import { faceAnalysisService } from '@/services/faceAnalysisService';
import { useSkinCare } from '@/hooks/useSkinCare';
import { useAlert } from '@/template';
import { getSupabaseClient } from '@/template';
import { theme } from '@/constants/theme';

export default function ScanScreen() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const { addLog, refresh } = useSkinCare();
  const supabase = getSupabaseClient();

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

  const handleTestWebhook = async () => {
    setIsTesting(true);
    try {
      // Create a simple test image (1x1 red pixel)
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
      
      console.log('Sending test request to webhook...');
      
      const { data, error } = await supabase.functions.invoke('analyze-skin', {
        body: { imageBase64: testImageBase64 },
      });

      if (error) {
        console.error('Test webhook error details:', {
          message: error.message,
          context: error.context,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        
        // Extract detailed error message
        let errorDetails = error.message;
        if (error.context) {
          try {
            const context = typeof error.context === 'string' ? JSON.parse(error.context) : error.context;
            if (context.error) {
              errorDetails = context.error;
            }
          } catch (e) {
            // Context is not JSON
          }
        }
        
        showAlert(
          'Webhook Test Failed',
          `${errorDetails}\n\nCheck Dashboard → Edge Functions for detailed logs`
        );
      } else {
        console.log('Test webhook success:', data);
        showAlert(
          'Webhook Test Success',
          `Received response from n8n!\n\nSkin Score: ${data.skinScore}\nSkin Type: ${data.skinType}\nConcerns: ${data.concerns?.length || 0}\nRecommendations: ${data.recommendations?.length || 0}`
        );
      }
    } catch (error: any) {
      console.error('Test webhook exception:', error);
      showAlert('Webhook Test Failed', error?.message || 'Unknown error occurred');
    } finally {
      setIsTesting(false);
    }
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
      {/* Test Webhook Button */}
      <View style={styles.testContainer}>
        <TouchableOpacity
          style={styles.testButton}
          onPress={handleTestWebhook}
          disabled={isTesting}
        >
          {isTesting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.testButtonText}>Test n8n Webhook</Text>
          )}
        </TouchableOpacity>
      </View>

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
  testContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
