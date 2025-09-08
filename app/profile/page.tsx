import { getCurrentUser } from '@/lib/auth';
import { getUserSubscriptions, calculateSubscriptionStats } from '@/lib/subscriptions';
import { getUserExpenses, calculateExpenseStats } from '@/lib/expenses';
import { getUserSavings, calculateSavingStats } from '@/lib/savings';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ProfileActions from '@/components/ProfileActions';
import { User, Mail, Calendar, Shield, Settings, TrendingUp, Target, CreditCard, PiggyBank, Receipt, BarChart3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Load user's financial data
  let subscriptions: any[] = [];
  let expenses: any[] = [];
  let savings: any[] = [];
  let subscriptionStats = { totalMonthly: 0, totalAnnual: 0, upcomingRenewals: [] };
  let expenseStats = { totalMonthly: 0, totalWeekly: 0, recentExpenses: [], categoryBreakdown: {} };
  let savingStats = { totalSaved: 0, totalGoals: 0, completedGoals: 0, activeSavings: [], recentSavings: [], progressByCategory: {} };

  try {
    const [subscriptionsData, expensesData, savingsData] = await Promise.allSettled([
      getUserSubscriptions(user.id),
      getUserExpenses(user.id),
      getUserSavings(user.id),
    ]);

    if (subscriptionsData.status === 'fulfilled') {
      subscriptions = subscriptionsData.value;
      subscriptionStats = calculateSubscriptionStats(subscriptions);
    }

    if (expensesData.status === 'fulfilled') {
      expenses = expensesData.value;
      expenseStats = calculateExpenseStats(expenses);
    }

    if (savingsData.status === 'fulfilled') {
      savings = savingsData.value;
      savingStats = calculateSavingStats(savings);
    }
  } catch (error) {
    console.error('Failed to load profile data:', error);
  }

  const totalMonthlyOutflow = subscriptionStats.totalMonthly + expenseStats.totalMonthly;
  const netWorth = savingStats.totalSaved - totalMonthlyOutflow;
  const joinDate = new Date('2024-01-01'); // This would come from user.createdAt in a real app
  const daysSinceJoined = Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24));

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-2">Manage your account and view your financial summary</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-foreground">
                    {getInitials(user.name, user.email)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{user.name || 'Welcome!'}</h2>
                  <p className="text-muted-foreground">{user.email}</p>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Member for {daysSinceJoined} days</span>
                  </div>
                </div>
              </div>
              <Button asChild>
                <Link href="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <User className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Name:</span>
                  <span className="ml-2 text-muted-foreground">{user.name || 'Not specified'}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span className="ml-2 text-muted-foreground">{user.email}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Shield className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Account ID:</span>
                  <span className="ml-2 text-muted-foreground font-mono text-xs">{user.id.slice(-8)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">Joined:</span>
                  <span className="ml-2 text-muted-foreground">{joinDate.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Financial Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">Financial Overview</h3>
              <Button variant="outline" asChild>
                <Link href="/analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium">Subscriptions</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subscriptionStats.totalMonthly)}
                    </p>
                    <p className="text-xs text-muted-foreground">{subscriptions.length} active</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="flex items-center">
                    <Receipt className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-medium">Monthly Expenses</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expenseStats.totalMonthly)}
                    </p>
                    <p className="text-xs text-muted-foreground">{expenses.length} transactions</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="flex items-center">
                    <PiggyBank className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium">Total Savings</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(savingStats.totalSaved)}
                    </p>
                    <p className="text-xs text-muted-foreground">{savingStats.totalGoals} goals</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="font-medium">Net Position</span>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      netWorth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netWorth)}
                    </p>
                    <p className="text-xs text-muted-foreground">Savings vs outflow</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Monthly Outflow</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalMonthlyOutflow)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completed Goals</span>
                <span className="font-semibold">{savingStats.completedGoals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Active Goals</span>
                <span className="font-semibold">{savingStats.activeSavings.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Upcoming Renewals</span>
                <span className="font-semibold">{subscriptionStats.upcomingRenewals.length}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Quick Actions</h3>
            <ProfileActions />
          </Card>

          {savingStats.activeSavings.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Active Goals</h3>
              <div className="space-y-3">
                {savingStats.activeSavings.slice(0, 3).map((saving: any) => {
                  const progress = saving.targetAmount ? (saving.amount / saving.targetAmount) * 100 : 0;
                  return (
                    <div key={saving.id} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{saving.name}</span>
                        <span className="text-muted-foreground">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              {savingStats.activeSavings.length > 3 && (
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link href="/savings">
                    View All Goals
                  </Link>
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
