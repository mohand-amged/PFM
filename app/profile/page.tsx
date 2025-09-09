import { getCurrentUser } from '@/lib/auth';
import { getUserSubscriptions, calculateSubscriptionStats } from '@/lib/subscriptions';
import { getUserExpenses, calculateExpenseStats } from '@/lib/expenses';
import { getUserSavings, calculateSavingStats } from '@/lib/savings';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { User, Mail, Calendar, Shield, Settings, TrendingUp, Target, CreditCard, PiggyBank, Receipt, BarChart3, ArrowUpRight, Activity, Wallet, ChevronRight, Star } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Section with Profile */}
      <div className="relative px-4 pt-6 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Profile Header */}
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/80 rounded-3xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-primary-foreground">
                  {getInitials(user.name, user.email)}
                </span>
              </div>
              <Badge className="absolute -top-1 -right-1 bg-green-500 text-white border-2 border-background">
                <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                Online
              </Badge>
            </div>
            
            <h1 className="text-2xl font-bold mt-4 mb-1">{user.name || 'Welcome!'}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
            
            <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Member for {daysSinceJoined} days</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>ID: {user.id.slice(-6)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex gap-3 justify-center mb-8">
            <Button size="sm" asChild className="rounded-2xl">
              <Link href="/settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button size="sm" variant="outline" asChild className="rounded-2xl">
              <Link href="/analytics">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Net Position - Prominent */}
            <Card className="col-span-2 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Net Position</p>
                    <p className={`text-3xl font-bold ${
                      netWorth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(netWorth)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Savings minus monthly outflow</p>
                  </div>
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <TrendingUp className={`w-8 h-8 ${
                      netWorth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Subscriptions */}
            <Card className="bg-blue-50/50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-xl">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Subscriptions</p>
                    <p className="font-bold text-blue-600 truncate">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(subscriptionStats.totalMonthly)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{subscriptions.length} active</span>
                  <Badge variant="secondary" className="text-xs">
                    /month
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Expenses */}
            <Card className="bg-red-50/50 dark:bg-red-950/50 border-red-200 dark:border-red-800">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-red-100 dark:bg-red-900 rounded-xl">
                    <Receipt className="w-4 h-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Expenses</p>
                    <p className="font-bold text-red-600 truncate">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(expenseStats.totalMonthly)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{expenses.length} items</span>
                  <Badge variant="secondary" className="text-xs">
                    /month
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Savings Overview */}
          <Card className="bg-green-50/50 dark:bg-green-950/50 border-green-200 dark:border-green-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <PiggyBank className="w-5 h-5 text-green-600" />
                  Savings Overview
                </CardTitle>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  {savingStats.totalGoals} goals
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-2xl text-green-600">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(savingStats.totalSaved)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total saved</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{savingStats.completedGoals}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
              
              {savingStats.activeSavings.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Active Goals</p>
                    {savingStats.activeSavings.slice(0, 2).map((saving: any) => {
                      const progress = saving.targetAmount ? (saving.amount / saving.targetAmount) * 100 : 0;
                      return (
                        <div key={saving.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium truncate pr-2">{saving.name}</span>
                            <span className="text-muted-foreground whitespace-nowrap">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                        </div>
                      );
                    })}
                    {savingStats.activeSavings.length > 2 && (
                      <Button variant="ghost" size="sm" className="w-full text-green-600" asChild>
                        <Link href="/transactions?tab=savings">
                          View {savingStats.activeSavings.length - 2} more goals
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <p className="text-2xl font-bold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalMonthlyOutflow)}
                  </p>
                  <p className="text-xs text-muted-foreground">Monthly outflow</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-xl">
                  <p className="text-2xl font-bold">{subscriptionStats.upcomingRenewals.length}</p>
                  <p className="text-xs text-muted-foreground">Upcoming renewals</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <BarChart3 className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">Dashboard</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
                
                <Link href="/transactions" className="block">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Wallet className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="font-medium">Transactions</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
                
                <Link href="/budgets" className="block">
                  <Button variant="outline" className="w-full justify-between h-12 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Target className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="font-medium">Budgets</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer Space */}
          <div className="h-6"></div>
        </div>
      </div>
    </div>
  );
}
