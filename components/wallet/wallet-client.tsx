'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DeleteConfirmDialog } from '@/components/ui/confirm-dialog';
import ClearButton from '@/components/ui/clear-button';
import { deleteIncome, clearWalletBalance } from '@/app/actions/wallet';
import { 
  Wallet, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Target,
  AlertTriangle,
  Trash2,
  Edit3
} from 'lucide-react';

interface WalletStats {
  wallet: {
    balance: number;
    monthlyBudget: number;
    currency: string;
  };
  monthlyIncome: number;
  monthlyExpenses: number;
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  budgetRemaining: number;
  incomeCount: number;
}

interface Income {
  id: string;
  source: string;
  amount: number;
  type: string;
  date: Date | string;
  currency: string;
  description?: string;
}

interface WalletClientProps {
  stats: WalletStats;
  incomes: Income[];
  wallet: any;
}

function formatDisplayDate(d: Date | string) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString();
}

function getIncomeTypeColor(type: string) {
  switch (type) {
    case 'SALARY': return 'bg-blue-100 text-blue-800';
    case 'FREELANCE': return 'bg-purple-100 text-purple-800';
    case 'BONUS': return 'bg-green-100 text-green-800';
    case 'INVESTMENT': return 'bg-indigo-100 text-indigo-800';
    case 'SIDE_HUSTLE': return 'bg-orange-100 text-orange-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export default function WalletClient({ stats, incomes, wallet }: WalletClientProps) {
  // Add null checks and default values
  const safeStats = stats || {
    wallet: { balance: 0, monthlyBudget: 0, currency: 'USD' },
    monthlyIncome: 0,
    monthlyExpenses: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netWorth: 0,
    budgetRemaining: 0,
    incomeCount: 0
  };
  
  const safeIncomes = incomes || [];
  const safeWallet = wallet || { balance: 0, monthlyBudget: 0, currency: 'USD' };

  const budgetUsagePercent = safeStats.wallet.monthlyBudget 
    ? Math.min((safeStats.monthlyExpenses / safeStats.wallet.monthlyBudget) * 100, 100)
    : 0;

  const isLowBalance = safeStats.wallet.monthlyBudget 
    ? safeStats.wallet.balance < (safeStats.wallet.monthlyBudget * 0.2)
    : false;

  const handleDeleteIncome = async (incomeId: string, shouldUpdateWallet: boolean = true) => {
    try {
      const formData = new FormData();
      formData.append('incomeId', incomeId);
      if (shouldUpdateWallet) {
        formData.append('updateWallet', 'on');
      }
      await deleteIncome(formData);
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wallet</h1>
            <p className="text-gray-600 mt-2">Manage your balance, budget, and income</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/wallet/add-income">
              <EnhancedButton size="touch" className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Income
              </EnhancedButton>
            </Link>
            <Link href="/wallet/settings">
              <EnhancedButton variant="outline" size="touch" className="w-full sm:w-auto">
                <Wallet className="w-4 h-4 mr-2" />
                Wallet Settings
              </EnhancedButton>
            </Link>
            <ClearButton 
              pageType="wallet" 
              onClear={async () => {
                await clearWalletBalance();
              }}
              size="touch"
              variant="outline"
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className={`p-4 sm:p-6 ${isLowBalance ? 'ring-2 ring-red-200 bg-red-50' : ''}`}>
          <div className="flex items-center">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${isLowBalance ? 'bg-red-100' : 'bg-green-100'}`}>
              <Wallet className={`w-5 h-5 sm:w-6 sm:h-6 ${isLowBalance ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div className="ml-3 sm:ml-4 flex-1 min-w-0">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-600 truncate">Current Balance</h3>
              <p className="text-lg sm:text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: safeStats.wallet.currency || 'USD' 
                }).format(safeStats.wallet.balance)}
              </p>
              {isLowBalance && (
                <div className="flex items-center text-red-600 text-xs sm:text-sm mt-1">
                  <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                  Low balance
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="ml-3 sm:ml-4 flex-1 min-w-0">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-600 truncate">Monthly Income</h3>
              <p className="text-lg sm:text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(safeStats.monthlyIncome)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
            </div>
            <div className="ml-3 sm:ml-4 flex-1 min-w-0">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-600 truncate">Monthly Expenses</h3>
              <p className="text-lg sm:text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(safeStats.monthlyExpenses)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className="ml-3 sm:ml-4 flex-1 min-w-0">
              <h3 className="text-sm sm:text-lg font-semibold text-gray-600 truncate">Net Worth</h3>
              <p className={`text-lg sm:text-2xl font-bold ${safeStats.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(safeStats.netWorth)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Progress */}
      {safeStats.wallet.monthlyBudget > 0 && (
        <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Monthly Budget</h2>
            <span className="text-xs sm:text-sm text-gray-500">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(safeStats.monthlyExpenses)} 
              {' of '}
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(safeStats.wallet.monthlyBudget)}
            </span>
          </div>
          <Progress 
            value={Math.max(0, Math.min(100, budgetUsagePercent || 0))} 
            className={`h-2 sm:h-3 ${budgetUsagePercent > 90 ? 'progress-red' : budgetUsagePercent > 75 ? 'progress-yellow' : 'progress-green'}`} 
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs sm:text-sm text-gray-600">
              {(budgetUsagePercent || 0).toFixed(1)}% used
            </span>
            <span className={`text-xs sm:text-sm font-medium ${safeStats.budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {safeStats.budgetRemaining >= 0 ? 'Remaining: ' : 'Over budget: '}
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(safeStats.budgetRemaining))}
            </span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Income */}
        <Card className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Income</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link href="/wallet/income">
                <EnhancedButton variant="outline" size="touch-sm">
                  Manage All
                </EnhancedButton>
              </Link>
              <Link href="/wallet/add-income">
                <EnhancedButton variant="outline" size="touch-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Income
                </EnhancedButton>
              </Link>
            </div>
          </div>

          {safeIncomes.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {safeIncomes.slice(0, 5).map((income) => (
                <div key={income.id} className="flex items-center justify-between p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                      <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm sm:text-base truncate">{income.source}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getIncomeTypeColor(income.type)} whitespace-nowrap`}>
                          {income.type.replace('_', ' ').toLowerCase()}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                          {formatDisplayDate(income.date)}
                        </span>
                      </div>
                      {income.description && (
                        <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{income.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    <span className="font-semibold text-green-600 text-sm sm:text-base whitespace-nowrap">
                      +{new Intl.NumberFormat('en-US', { style: 'currency', currency: income.currency }).format(income.amount)}
                    </span>
                    <DeleteConfirmDialog
                      itemName={income.source}
                      itemType="income entry"
                      onConfirm={() => handleDeleteIncome(income.id, true)}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50 p-2 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </DeleteConfirmDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">No income recorded</h3>
              <p className="text-sm text-gray-500 mb-4">Start by adding your salary or other income sources.</p>
              <Link href="/wallet/add-income">
                <EnhancedButton size="touch-sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Income
                </EnhancedButton>
              </Link>
            </div>
          )}
        </Card>

        {/* Financial Summary */}
        <Card className="p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Financial Summary</h2>
          
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center py-2 sm:py-3 border-b">
              <span className="text-gray-600 text-sm sm:text-base">Total Income</span>
              <span className="font-semibold text-green-600 text-sm sm:text-base">
                +{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(safeStats.totalIncome)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 sm:py-3 border-b">
              <span className="text-gray-600 text-sm sm:text-base">Total Expenses</span>
              <span className="font-semibold text-red-600 text-sm sm:text-base">
                -{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(safeStats.totalExpenses)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-2 sm:py-3 border-b">
              <span className="text-gray-600 font-medium text-sm sm:text-base">Net Worth</span>
              <span className={`font-bold text-base sm:text-lg ${safeStats.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(safeStats.netWorth)}
              </span>
            </div>

            <div className="pt-3 sm:pt-4 space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-gray-500">Income Sources</span>
                <span className="text-gray-700">{safeStats.incomeCount}</span>
              </div>
              
              {safeWallet?.lastSalaryDate && (
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <span className="text-gray-500">Last Salary</span>
                  <span className="text-gray-700">{formatDisplayDate(safeWallet.lastSalaryDate)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/analytics" className="flex-1">
                <EnhancedButton variant="outline" size="touch-sm" className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  View Analytics
                </EnhancedButton>
              </Link>
              <Link href="/expenses" className="flex-1">
                <EnhancedButton variant="outline" size="touch-sm" className="w-full">
                  <ArrowDownRight className="w-4 h-4 mr-2" />
                  View Expenses
                </EnhancedButton>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
