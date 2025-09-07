import React from 'react';
import { getSavings, getSavingStats, deleteSaving, toggleSavingStatus } from '@/app/actions/savings';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trash2, Edit, Plus, Calendar, DollarSign, Target, Play, Pause } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Saving {
  id: string;
  name: string;
  amount: number;
  currency: string;
  date: Date;
  targetAmount?: number;
  category?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
}

function formatDisplayDate(d: Date | string) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString();
}

export default async function SavingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  let savings: Saving[] = [];
  let stats = {
    totalSavings: 0,
    totalCount: 0,
    activeSavingsCount: 0,
    totalTarget: 0,
    thisMonthTotal: 0,
    categoryTotals: {} as Record<string, number>,
    goalProgress: [] as Array<{
      id: string;
      name: string;
      current: number;
      target: number;
      progress: number;
    }>,
    savings: [] as Saving[],
  };

  try {
    savings = await getSavings();
    stats = await getSavingStats();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to load savings:', error);
    }
  }

  // Calculate overall progress
  const overallProgress = stats.totalTarget > 0 ? (stats.totalSavings / stats.totalTarget) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Savings</h1>
            <p className="text-gray-600 mt-2">Track your saving goals and build financial security</p>
          </div>
          <Link href="/savings/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Saving Goal
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Total Saved</h3>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalSavings)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Target Amount</h3>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.totalTarget)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Active Goals</h3>
              <p className="text-2xl font-bold">{stats.activeSavingsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-600">Overall Progress</h3>
              <p className="text-2xl font-bold">{Math.round(overallProgress)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Savings List */}
      {savings.length > 0 ? (
        <div className="space-y-4">
          {savings.map((saving) => {
            const progress = saving.targetAmount && saving.targetAmount > 0 
              ? (saving.amount / saving.targetAmount) * 100 
              : 0;
            const isCompleted = progress >= 100;

            return (
              <Card key={saving.id} className={`p-6 transition-all hover:shadow-md ${!saving.isActive ? 'opacity-70' : ''} ${isCompleted ? 'ring-2 ring-green-200 bg-green-50' : ''}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-gray-900">{saving.name}</h2>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        saving.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {saving.isActive ? 'Active' : 'Paused'}
                      </span>
                      {isCompleted && (
                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Goal Achieved! 🎉
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6 text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-lg font-semibold">
                          {new Intl.NumberFormat('en-US', { style: 'currency', currency: saving.currency || 'USD' }).format(saving.amount)}
                        </span>
                        {saving.targetAmount && (
                          <span className="text-sm">
                            / {new Intl.NumberFormat('en-US', { style: 'currency', currency: saving.currency || 'USD' }).format(saving.targetAmount)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          Started: {formatDisplayDate(saving.date)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {saving.targetAmount && saving.targetAmount > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">Progress</span>
                          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    {saving.description && (
                      <p className="text-gray-600 mb-3">{saving.description}</p>
                    )}

                    {saving.category && (
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                          {saving.category}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <form action={toggleSavingStatus}>
                      <input type="hidden" name="id" value={saving.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className={saving.isActive ? 'text-orange-600 hover:text-orange-700' : 'text-green-600 hover:text-green-700'}
                      >
                        {saving.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </form>
                    
                    <Link href={`/savings/${saving.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    
                    <form action={deleteSaving}>
                      <input type="hidden" name="id" value={saving.id} />
                      <Button
                        type="submit"
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="max-w-md mx-auto">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No savings goals yet</h3>
            <p className="text-gray-500 mb-6">
              Start building your financial future by setting your first saving goal. 
              Whether it&apos;s an emergency fund, vacation, or major purchase - every goal counts!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/savings/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Set Your First Goal
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Goal Progress Summary */}
      {stats.goalProgress.length > 0 && (
        <Card className="p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Progress Summary</h3>
          <div className="space-y-4">
            {stats.goalProgress.slice(0, 5).map((goal) => (
              <div key={goal.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-700">{goal.name}</span>
                    <span className="text-sm text-gray-600">{Math.round(goal.progress)}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-1" />
                </div>
                <div className="ml-4 text-right">
                  <div className="text-sm font-medium">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(goal.current)}
                  </div>
                  <div className="text-xs text-gray-500">
                    of {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(goal.target)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Monthly Savings Alert */}
      {stats.thisMonthTotal > 0 && (
        <Card className="p-6 mt-8 bg-green-50 border-green-200">
          <div className="flex items-start">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Target className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Great Progress This Month!
              </h3>
              <p className="text-green-700 mb-3">
                You&apos;ve saved {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.thisMonthTotal)} this month. Keep up the excellent work!
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
