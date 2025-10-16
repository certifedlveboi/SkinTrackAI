export interface FaceAnalysis {
  skinScore: number; // 0-100
  concerns: {
    type: string;
    severity: 'low' | 'medium' | 'high';
    confidence: number;
    location?: string;
  }[];
  skinType: 'oily' | 'dry' | 'combination' | 'normal';
  recommendations: string[];
  detectedFeatures: {
    acne: number;
    texture: number;
    redness: number;
    darkSpots: number;
    hydration: number;
  };
}

export const faceAnalysisService = {
  async analyzeFace(photoUri: string): Promise<FaceAnalysis> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock AI analysis results
    const mockAnalysis: FaceAnalysis = {
      skinScore: Math.floor(Math.random() * 30) + 70, // 70-100
      skinType: ['oily', 'dry', 'combination', 'normal'][Math.floor(Math.random() * 4)] as any,
      concerns: this.generateMockConcerns(),
      recommendations: this.generateRecommendations(),
      detectedFeatures: {
        acne: Math.random() * 30,
        texture: Math.random() * 40 + 60,
        redness: Math.random() * 25,
        darkSpots: Math.random() * 20,
        hydration: Math.random() * 30 + 70,
      },
    };

    return mockAnalysis;
  },

  generateMockConcerns() {
    const allConcerns = [
      { type: 'Acne', severity: 'low' as const, location: 'T-zone' },
      { type: 'Dryness', severity: 'medium' as const, location: 'Cheeks' },
      { type: 'Redness', severity: 'low' as const, location: 'Nose area' },
      { type: 'Dark Spots', severity: 'medium' as const, location: 'Forehead' },
      { type: 'Fine Lines', severity: 'low' as const, location: 'Eye area' },
      { type: 'Oiliness', severity: 'medium' as const, location: 'T-zone' },
    ];

    const numConcerns = Math.floor(Math.random() * 3) + 2;
    const selected = allConcerns
      .sort(() => Math.random() - 0.5)
      .slice(0, numConcerns)
      .map(concern => ({
        ...concern,
        confidence: Math.random() * 20 + 80, // 80-100%
      }));

    return selected;
  },

  generateRecommendations() {
    const recommendations = [
      'Use a gentle cleanser twice daily',
      'Apply sunscreen with SPF 30+ every morning',
      'Stay hydrated - drink 8 glasses of water daily',
      'Consider adding a vitamin C serum to your routine',
      'Get 7-8 hours of sleep for better skin recovery',
      'Use a hydrating moisturizer morning and night',
      'Incorporate retinol products 2-3 times per week',
      'Avoid touching your face throughout the day',
    ];

    return recommendations
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);
  },

  getConditionFromScore(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'fair';
    return 'poor';
  },
};
