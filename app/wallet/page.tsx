import React from 'react';
import { getWallet, getWalletStats, getIncomes } from '@/app/actions/wallet';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
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
  AlertTriangle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

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

export default async function WalletPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const [wallet, stats, incomes] = await Promise.all([
    getWallet(),
    getWalletStats(),
    getIncomes(),
  ]);

  const budgetUsagePercent = stats.wallet.monthlyBudget 
    ? Math.min((stats.monthlyExpenses / stats.wallet.monthlyBudget) * 100, 100)
    : 0;

  const isLowBalance = stats.wallet.monthlyBudget 
    ? stats.wallet.balance < (stats.wallet.monthlyBudget * 0.2)
    : false;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wallet</h1>
            <p className="text-gray-600 mt-2">Manage your balance, budget, and income</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/wallet/add-income">
                <Plus className="w-4 h-4 mr-2" />
                Add Income
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/wallet/settings">
                <Wallet className="w-4 h-4 mr-2" />
                Wallet Settings
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Wallet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className={`p-6 ${isLowBalance ? 'ring-2 ring-red-200 bg-red-50' : ''}`}>
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isLowBalance ? 'bg-red-100' : 'bg-green-100'}`}>
              <Wallet className={`w-6 h-6 ${isLowBalance ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Current Balance</h3>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { 
                  style: 'currency', 
                  currency: stats.wallet.currency || 'USD' 
                }).format(stats.wallet.balance)}
              </p>
              {isLowBalance && (
                <div className="flex items-center text-red-600 text-sm mt-1">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Low balance
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Monthly Income</h3>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.monthlyIncome)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Monthly Expenses</h3>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.monthlyExpenses)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Net Worth</h3>
              <p className={`text-2xl font-bold ${stats.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.netWorth)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Budget Progress */}
      {stats.wallet.monthlyBudget > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Monthly Budget</h2>
            <span className="text-sm text-gray-500">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.monthlyExpenses)} 
              {' of '}
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.wallet.monthlyBudget)}
            </span>
          </div>
          <Progress 
            value={budgetUsagePercent} 
            className={`h-3 ${budgetUsagePercent > 90 ? 'progress-red' : budgetUsagePercent > 75 ? 'progress-yellow' : 'progress-green'}`} 
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600">
              {budgetUsagePercent.toFixed(1)}% used
            </span>
            <span className={`text-sm font-medium ${stats.budgetRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.budgetRemaining >= 0 ? 'Remaining: ' : 'Over budget: '}
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(stats.budgetRemaining))}
            </span>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Income */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Income</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/wallet/add-income">
                <Plus className="w-4 h-4 mr-2" />
                Add Income
              </Link>
            </Button>
          </div>

          {incomes.length > 0 ? (
            <div className="space-y-4">
              {incomes.slice(0, 5).map((income) => (
                <div key={income.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{income.source}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getIncomeTypeColor(income.type)}`}>
                          {income.type.replace('_', ' ').toLowerCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDisplayDate(income.date)}
                        </span>
                      </div>
                      {income.description && (
                        <p className="text-sm text-gray-600 mt-1">{income.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold text-green-600">
                    +{new Intl.NumberFormat('en-US', { style: 'currency', currency: income.currency }).format(income.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No income recorded</h3>
              <p className="text-gray-500 mb-4">Start by adding your salary or other income sources.</p>
              <Button asChild>
                <Link href="/wallet/add-income">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Income
                </Link>
              </Button>
            </div>
          )}
        </Card>

        {/* Financial Summary */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Total Income</span>
              <span className="font-semibold text-green-600">
                +{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalIncome)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600">Total Expenses</span>
              <span className="font-semibold text-red-600">
                -{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalExpenses)}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b">
              <span className="text-gray-600 font-medium">Net Worth</span>
              <span className={`font-bold text-lg ${stats.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.netWorth)}
              </span>
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Income Sources</span>
                <span className="text-gray-700">{stats.incomeCount}</span>
              </div>
              
              {wallet?.lastSalaryDate && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Last Salary</span>
                  <span className="text-gray-700">{formatDisplayDate(wallet.lastSalaryDate)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/analytics">
                  <Target className="w-4 h-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="flex-1">
                <Link href="/expenses">
                  <ArrowDownRight className="w-4 h-4 mr-2" />
                  View Expenses
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
