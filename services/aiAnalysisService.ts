import { SkinLog, Product } from './skinCareService';

export interface AIInsight {
  id: string;
  type: 'trend' | 'recommendation' | 'milestone' | 'alert';
  title: string;
  description: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

export const aiAnalysisService = {
  generateInsights(logs: SkinLog[], products: Product[]): AIInsight[] {
    const insights: AIInsight[] = [];
    const now = Date.now();

    if (logs.length === 0) {
      return [
        {
          id: 'welcome',
          type: 'recommendation',
          title: 'Start Your Journey',
          description: 'Begin by logging your daily skin condition to track your progress over time.',
          date: new Date().toISOString(),
          priority: 'high',
        },
      ];
    }

    // Trend analysis
    const recentLogs = logs.slice(0, 7);
    const excellentCount = recentLogs.filter(l => l.condition === 'excellent').length;
    const poorCount = recentLogs.filter(l => l.condition === 'poor').length;

    if (excellentCount >= 5) {
      insights.push({
        id: 'trend_positive',
        type: 'trend',
        title: 'Great Progress! 🌟',
        description: `Your skin has been excellent for ${excellentCount} days this week. Keep up the great routine!`,
        date: new Date().toISOString(),
        priority: 'high',
      });
    }

    if (poorCount >= 3) {
      insights.push({
        id: 'trend_concern',
        type: 'alert',
        title: 'Attention Needed',
        description: `Your skin condition has been poor for ${poorCount} days. Consider reviewing your routine or consulting a dermatologist.`,
        date: new Date().toISOString(),
        priority: 'high',
      });
    }

    // Product recommendations
    const activeProducts = products.filter(p => p.isActive);
    if (activeProducts.length === 0) {
      insights.push({
        id: 'add_products',
        type: 'recommendation',
        title: 'Track Your Products',
        description: 'Add the skincare products you are using to understand what works best for your skin.',
        date: new Date().toISOString(),
        priority: 'medium',
      });
    }

    // Milestone detection
    if (logs.length === 7) {
      insights.push({
        id: 'milestone_week',
        type: 'milestone',
        title: '1 Week Streak! 🎉',
        description: 'You have been consistently tracking your skin for a week. Great habit!',
        date: new Date().toISOString(),
        priority: 'medium',
      });
    }

    if (logs.length === 30) {
      insights.push({
        id: 'milestone_month',
        type: 'milestone',
        title: '30 Days Achievement! 🏆',
        description: 'You have completed a full month of skin tracking. Your dedication is impressive!',
        date: new Date().toISOString(),
        priority: 'high',
      });
    }

    // Common concerns analysis
    const allConcerns = logs.flatMap(l => l.concerns);
    const concernCounts = allConcerns.reduce((acc, concern) => {
      acc[concern] = (acc[concern] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topConcern = Object.entries(concernCounts).sort((a, b) => b[1] - a[1])[0];
    if (topConcern && topConcern[1] >= 3) {
      insights.push({
        id: 'concern_pattern',
        type: 'recommendation',
        title: 'Pattern Detected',
        description: `${topConcern[0]} appears frequently in your logs. Consider products targeting this concern.`,
        date: new Date().toISOString(),
        priority: 'medium',
      });
    }

    // Consistency reminder
    const lastLogDate = new Date(logs[0].date);
    const daysSinceLastLog = Math.floor((now - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceLastLog > 2) {
      insights.push({
        id: 'consistency_reminder',
        type: 'recommendation',
        title: 'Stay Consistent',
        description: `It has been ${daysSinceLastLog} days since your last log. Regular tracking helps identify patterns.`,
        date: new Date().toISOString(),
        priority: 'low',
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  },

  getProgressSummary(logs: SkinLog[]) {
    if (logs.length === 0) {
      return {
        averageCondition: 0,
        improvementRate: 0,
        totalLogs: 0,
        streak: 0,
      };
    }

    const conditionValues = {
      excellent: 4,
      good: 3,
      fair: 2,
      poor: 1,
    };

    const average = logs.reduce((sum, log) => sum + conditionValues[log.condition], 0) / logs.length;

    // Calculate streak
    let streak = 0;
    const sortedLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === streak) {
        streak++;
      } else {
        break;
      }
    }

    // Calculate improvement rate
    const recentLogs = logs.slice(0, Math.min(7, logs.length));
    const olderLogs = logs.slice(Math.min(7, logs.length), Math.min(14, logs.length));

    let improvementRate = 0;
    if (olderLogs.length > 0) {
      const recentAvg = recentLogs.reduce((sum, log) => sum + conditionValues[log.condition], 0) / recentLogs.length;
      const olderAvg = olderLogs.reduce((sum, log) => sum + conditionValues[log.condition], 0) / olderLogs.length;
      improvementRate = ((recentAvg - olderAvg) / olderAvg) * 100;
    }

    return {
      averageCondition: average,
      improvementRate: Math.round(improvementRate),
      totalLogs: logs.length,
      streak,
    };
  },
};
