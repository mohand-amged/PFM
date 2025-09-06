'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, TrendingDown, Target, DollarSign, Calendar } from 'lucide-react';

interface FinancialData {
  monthlyIncome: number;
  monthlyOutflow: number;
  balance: number;
  monthlyBudget: number;
  savingsRate: number;
  subscriptionCount: number;
  expenseCount: number;
  totalSaved: number;
  savingsGoals: number;
  completedGoals: number;
}

interface FinancialInsightsProps {
  data: FinancialData;
  trendData: any[];
}

interface Insight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'tip';
  title: string;
  description: string;
  action?: string;
  priority: 'high' | 'medium' | 'low';
  value?: string;
}

const FinancialInsights: React.FC<FinancialInsightsProps> = ({ data, trendData }) => {
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    
    // Cash flow analysis
    const cashFlowRatio = data.monthlyIncome > 0 ? (data.monthlyOutflow / data.monthlyIncome) : 0;
    
    if (cashFlowRatio > 0.9) {
      insights.push({
        id: 'high-spending',
        type: 'warning',
        title: 'High Spending Alert',
        description: `You're spending ${(cashFlowRatio * 100).toFixed(0)}% of your income. Consider reducing expenses to improve financial stability.`,
        action: 'Review your subscriptions and expenses',
        priority: 'high',
        value: `${(cashFlowRatio * 100).toFixed(0)}%`
      });
    } else if (cashFlowRatio < 0.7) {
      insights.push({
        id: 'good-spending',
        type: 'success',
        title: 'Excellent Cash Flow',
        description: `You're spending only ${(cashFlowRatio * 100).toFixed(0)}% of your income, leaving room for savings and investments.`,
        priority: 'low',
        value: `${(cashFlowRatio * 100).toFixed(0)}%`
      });
    }

    // Emergency fund analysis
    const emergencyMonths = data.monthlyOutflow > 0 ? (data.balance / data.monthlyOutflow) : 0;
    
    if (emergencyMonths < 3) {
      insights.push({
        id: 'emergency-fund',
        type: 'warning',
        title: 'Build Emergency Fund',
        description: `Your current balance covers ${emergencyMonths.toFixed(1)} months of expenses. Aim for 3-6 months.`,
        action: 'Increase savings to build emergency fund',
        priority: 'high',
        value: `${emergencyMonths.toFixed(1)} months`
      });
    } else if (emergencyMonths >= 6) {
      insights.push({
        id: 'strong-emergency-fund',
        type: 'success',
        title: 'Strong Emergency Fund',
        description: `Great! Your emergency fund covers ${emergencyMonths.toFixed(1)} months of expenses.`,
        priority: 'low',
        value: `${emergencyMonths.toFixed(1)} months`
      });
    }

    // Subscription optimization
    if (data.subscriptionCount > 5) {
      const avgSubCost = data.monthlyOutflow / data.subscriptionCount;
      insights.push({
        id: 'subscription-review',
        type: 'tip',
        title: 'Subscription Audit Recommended',
        description: `You have ${data.subscriptionCount} active subscriptions averaging $${avgSubCost.toFixed(0)}/month. Review unused services.`,
        action: 'Cancel unused subscriptions',
        priority: 'medium',
        value: `${data.subscriptionCount} services`
      });
    }

    // Budget adherence
    if (data.monthlyBudget > 0) {
      const budgetUtilization = (data.monthlyOutflow / data.monthlyBudget) * 100;
      
      if (budgetUtilization > 100) {
        insights.push({
          id: 'budget-exceeded',
          type: 'warning',
          title: 'Budget Exceeded',
          description: `You've spent ${budgetUtilization.toFixed(0)}% of your monthly budget. Review your expenses.`,
          action: 'Reduce spending this month',
          priority: 'high',
          value: `${budgetUtilization.toFixed(0)}%`
        });
      } else if (budgetUtilization < 80) {
        insights.push({
          id: 'under-budget',
          type: 'success',
          title: 'Under Budget',
          description: `You're using only ${budgetUtilization.toFixed(0)}% of your budget. Great self-control!`,
          priority: 'low',
          value: `${budgetUtilization.toFixed(0)}%`
        });
      }
    }

    // Savings goals progress
    if (data.savingsGoals > 0) {
      const goalCompletionRate = (data.completedGoals / data.savingsGoals) * 100;
      
      if (goalCompletionRate < 50) {
        insights.push({
          id: 'savings-goals',
          type: 'info',
          title: 'Focus on Savings Goals',
          description: `You've completed ${data.completedGoals} of ${data.savingsGoals} savings goals. Stay focused!`,
          action: 'Review and prioritize goals',
          priority: 'medium',
          value: `${goalCompletionRate.toFixed(0)}%`
        });
      } else {
        insights.push({
          id: 'savings-progress',
          type: 'success',
          title: 'Great Savings Progress',
          description: `You've completed ${goalCompletionRate.toFixed(0)}% of your savings goals. Keep it up!`,
          priority: 'low',
          value: `${goalCompletionRate.toFixed(0)}%`
        });
      }
    }

    // Trend analysis
    if (trendData.length >= 3) {
      const recentTrends = trendData.slice(-3);
      const spendingTrend = recentTrends[2].expenses + recentTrends[2].subscriptions - 
                           (recentTrends[0].expenses + recentTrends[0].subscriptions);
      
      if (spendingTrend > 200) {
        insights.push({
          id: 'spending-trend',
          type: 'warning',
          title: 'Spending Trend Alert',
          description: `Your spending has increased by $${spendingTrend.toFixed(0)} over the last 3 months.`,
          action: 'Identify what is driving increased spending',
          priority: 'medium',
          value: `+$${spendingTrend.toFixed(0)}`
        });
      } else if (spendingTrend < -200) {
        insights.push({
          id: 'spending-improvement',
          type: 'success',
          title: 'Spending Reduction',
          description: `Great job! You've reduced spending by $${Math.abs(spendingTrend).toFixed(0)} over 3 months.`,
          priority: 'low',
          value: `-$${Math.abs(spendingTrend).toFixed(0)}`
        });
      }
    }

    // Investment opportunity
    const monthlySurplus = data.monthlyIncome - data.monthlyOutflow;
    if (monthlySurplus > 500) {
      insights.push({
        id: 'investment-opportunity',
        type: 'tip',
        title: 'Investment Opportunity',
        description: `With a monthly surplus of $${monthlySurplus.toFixed(0)}, consider investing for long-term growth.`,
        action: 'Explore investment options',
        priority: 'medium',
        value: `$${monthlySurplus.toFixed(0)}/month`
      });
    }

    return insights.sort((a, b) => {
      const priorityWeight = { high: 3, medium: 2, low: 1 };
      return priorityWeight[b.priority] - priorityWeight[a.priority];
    });
  };

  const insights = generateInsights();

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Target className="w-5 h-5 text-blue-500" />;
      case 'tip':
        return <DollarSign className="w-5 h-5 text-purple-500" />;
      default:
        return <Calendar className="w-5 h-5 text-gray-500" />;
    }
  };

  const getInsightBgColor = (type: Insight['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800';
      case 'tip':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900/10 dark:border-purple-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700';
    }
  };

  const getPriorityBadge = (priority: Insight['priority']) => {
    const colors = {
      high: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      low: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  if (insights.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Financial Insights
        </h3>
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            Add more financial data to receive personalized insights and recommendations.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Financial Insights
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {insights.length} insight{insights.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border ${getInsightBgColor(insight.type)}`}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {getInsightIcon(insight.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {insight.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {insight.value && (
                      <span className="text-sm font-mono text-gray-600 dark:text-gray-300">
                        {insight.value}
                      </span>
                    )}
                    {getPriorityBadge(insight.priority)}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {insight.description}
                </p>
                
                {insight.action && (
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1">
                    💡 {insight.action}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default FinancialInsights;
