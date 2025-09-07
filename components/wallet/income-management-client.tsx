'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Card } from '@/components/ui/card';
import { DeleteConfirmDialog } from '@/components/ui/confirm-dialog';
import { deleteIncome } from '@/app/actions/wallet';
import { 
  ArrowLeft,
  Plus, 
  TrendingUp, 
  ArrowUpRight,
  Trash2,
  Edit3,
  DollarSign,
  Calendar,
  Filter,
  Search,
  Eye,
  EyeOff
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

interface IncomeManagementClientProps {
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
    case 'SALARY': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'FREELANCE': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'BONUS': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'INVESTMENT': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
    case 'SIDE_HUSTLE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
  }
}

function getIncomeTypeIcon(type: string) {
  switch (type) {
    case 'SALARY': return '💼';
    case 'FREELANCE': return '💻';
    case 'BONUS': return '🎉';
    case 'INVESTMENT': return '📈';
    case 'SIDE_HUSTLE': return '🚀';
    default: return '💰';
  }
}

export default function IncomeManagementClient({ stats, incomes, wallet }: IncomeManagementClientProps) {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showAmounts, setShowAmounts] = useState(true);

  const handleDeleteIncome = async (incomeId: string, shouldUpdateWallet: boolean = true) => {
    const formData = new FormData();
    formData.append('incomeId', incomeId);
    if (shouldUpdateWallet) {
      formData.append('updateWallet', 'on');
    }
    await deleteIncome(formData);
  };

  // Filter and sort incomes
  const filteredIncomes = incomes
    .filter(income => {
      const matchesType = filterType === 'ALL' || income.type === filterType;
      const matchesSearch = income.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (income.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'name':
          comparison = a.source.localeCompare(b.source);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const totalFilteredAmount = filteredIncomes.reduce((sum, income) => sum + income.amount, 0);

  const incomeTypes = ['ALL', 'SALARY', 'FREELANCE', 'BONUS', 'INVESTMENT', 'SIDE_HUSTLE', 'OTHER'];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/wallet">
            <EnhancedButton variant="outline" size="touch-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wallet
            </EnhancedButton>
          </Link>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Income Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage all your income sources and track your earnings</p>
          </div>
          <Link href="/wallet/add-income">
            <EnhancedButton size="touch">
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </EnhancedButton>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Income</h3>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {showAmounts ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalIncome) : '••••••'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-700 dark:text-green-300">Monthly Income</h3>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {showAmounts ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.monthlyIncome) : '••••••'}
              </p>
            </div>
            <Calendar className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300">Income Sources</h3>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {stats.incomeCount}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Filtered Total</h3>
              <p className="text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                {showAmounts ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalFilteredAmount) : '••••••'}
              </p>
            </div>
            <Filter className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="p-4 sm:p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search income sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent min-w-[140px]"
            >
              {incomeTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [newSortBy, newSortOrder] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder];
                setSortBy(newSortBy);
                setSortOrder(newSortOrder);
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent min-w-[160px]"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>
          </div>

          {/* Privacy Toggle */}
          <EnhancedButton
            variant="outline"
            size="touch-sm"
            onClick={() => setShowAmounts(!showAmounts)}
            className="flex-shrink-0"
          >
            {showAmounts ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
            {showAmounts ? 'Hide Amounts' : 'Show Amounts'}
          </EnhancedButton>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredIncomes.length} of {incomes.length} income entries
        </div>
      </Card>

      {/* Income List */}
      {filteredIncomes.length > 0 ? (
        <div className="space-y-4">
          {filteredIncomes.map((income) => (
            <Card key={income.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Icon and Basic Info */}
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-2xl flex-shrink-0">{getIncomeTypeIcon(income.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {income.source}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs px-2 py-1 rounded-full ${getIncomeTypeColor(income.type)}`}>
                          {income.type.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatDisplayDate(income.date)}
                        </span>
                      </div>
                    </div>
                    
                    {income.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {income.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-green-600 dark:text-green-400">
                        +{showAmounts 
                          ? new Intl.NumberFormat('en-US', { style: 'currency', currency: income.currency }).format(income.amount)
                          : '••••••'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 sm:ml-4">
                  <DeleteConfirmDialog
                    itemName={income.source}
                    itemType="income entry"
                    onConfirm={() => handleDeleteIncome(income.id, true)}
                  >
                    <EnhancedButton
                      variant="outline"
                      size="icon-sm"
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </EnhancedButton>
                  </DeleteConfirmDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || filterType !== 'ALL' ? 'No matching income found' : 'No income recorded'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchTerm || filterType !== 'ALL' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Start by adding your salary or other income sources.'
            }
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/wallet/add-income">
              <EnhancedButton size="touch">
                <Plus className="w-4 h-4 mr-2" />
                Add Income
              </EnhancedButton>
            </Link>
            {(searchTerm || filterType !== 'ALL') && (
              <EnhancedButton 
                variant="outline" 
                size="touch"
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('ALL');
                }}
              >
                Clear Filters
              </EnhancedButton>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
