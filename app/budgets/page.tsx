import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBudgetStatus } from '@/app/actions/budgets';
import BudgetManagement from '@/components/budgets/BudgetManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, BarChart3 } from 'lucide-react';

export const metadata = {
  title: 'Budgets & Analytics - Personal Finance Tracker',
  description: 'Set monthly budgets for different categories, track your spending with alerts, and analyze your financial patterns.',
};

export default async function BudgetsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Budgets & Analytics</h1>
          <p className="text-muted-foreground">
            Set monthly budgets, track spending with alerts, and analyze your financial patterns.
          </p>
        </div>

        {/* Tabs for Budget Management and Analytics */}
        <Tabs defaultValue="budgets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <Target size={16} />
              Budget Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 size={16} />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="budgets" className="mt-6">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <BudgetManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <div className="text-center p-8">
                <BarChart3 size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed spending analytics and budget performance insights will be available here.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  For now, you can view basic analytics in the individual budget cards above.
                </p>
              </div>
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
