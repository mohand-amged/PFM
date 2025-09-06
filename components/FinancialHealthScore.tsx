'use client';

import React from 'react';

interface FinancialHealthScoreProps {
  score: number; // 0-100
  metrics: {
    savingsRate: number;
    debtToIncomeRatio: number;
    emergencyFundMonths: number;
    budgetAdherence: number;
  };
}

const FinancialHealthScore: React.FC<FinancialHealthScoreProps> = ({
  score,
  metrics,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-400 to-green-600';
    if (score >= 60) return 'from-yellow-400 to-yellow-600';
    if (score >= 40) return 'from-orange-400 to-orange-600';
    return 'from-red-400 to-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const getRecommendations = (score: number, metrics: any) => {
    const recommendations: string[] = [];
    
    if (metrics.savingsRate < 20) {
      recommendations.push('Increase your savings rate to at least 20% of income');
    }
    
    if (metrics.emergencyFundMonths < 3) {
      recommendations.push('Build an emergency fund covering 3-6 months of expenses');
    }
    
    if (metrics.budgetAdherence < 80) {
      recommendations.push('Improve budget adherence by tracking expenses more closely');
    }
    
    if (metrics.debtToIncomeRatio > 30) {
      recommendations.push('Work on reducing debt to income ratio below 30%');
    }

    if (recommendations.length === 0) {
      recommendations.push('Great job! Keep maintaining your healthy financial habits');
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations(score, metrics);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
        Financial Health Score
      </h3>
      
      {/* Score Gauge */}
      <div className="flex items-center justify-center mb-8">
        <div className="relative w-48 h-24">
          {/* Background arc */}
          <svg className="w-48 h-24" viewBox="0 0 192 96">
            <path
              d="M 24 72 A 72 72 0 0 1 168 72"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Score arc */}
            <path
              d={`M 24 72 A 72 72 0 0 1 ${24 + (144 * score) / 100} ${
                72 - 72 * Math.sin((Math.PI * score) / 100)
              }`}
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop
                  offset="0%"
                  className={`${getScoreGradient(score).split(' ')[0].replace('from-', 'stop-')}`}
                />
                <stop
                  offset="100%"
                  className={`${getScoreGradient(score).split(' ')[1].replace('to-', 'stop-')}`}
                />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Score text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
            <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {getScoreLabel(score)}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {metrics.savingsRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Savings Rate
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {metrics.emergencyFundMonths.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Emergency Fund (months)
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {metrics.budgetAdherence.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Budget Adherence
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {metrics.debtToIncomeRatio.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Debt-to-Income
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          Recommendations
        </h4>
        <ul className="space-y-2">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
              {recommendation}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FinancialHealthScore;
