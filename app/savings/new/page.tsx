import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createSaving } from '@/app/actions/savings';
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Target, DollarSign, Calendar, FileText, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

// Error fallback component
function ErrorFallback({ error, resetPath = '/savings' }: { error?: string; resetPath?: string }) {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <Card className="p-6 border-red-200 bg-red-50">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <h2 className="text-lg font-semibold text-red-900">
            Unable to Load Create Savings Goal
          </h2>
          <p className="text-red-700">
            {error || 'There was an error loading the create savings goal form. Please try again.'}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link href={resetPath}>
              <EnhancedButton variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Savings
              </EnhancedButton>
            </Link>
            <Link href="/savings/new">
              <EnhancedButton>
                Try Again
              </EnhancedButton>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default async function NewSavingsGoalPage() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect('/login');
    }

    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/savings">
              <EnhancedButton variant="outline" size="touch-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Savings
              </EnhancedButton>
            </Link>
          </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Savings Goal</h1>
        <p className="text-gray-600 mt-2">Set a new financial goal to track your progress</p>
      </div>

      <Card className="p-4 sm:p-6">
        <form action={createSaving} className="space-y-6">
          <EnhancedInput
            id="name"
            name="name"
            label="Goal Name *"
            type="text"
            inputSize="touch"
            required
            placeholder="e.g., Vacation Fund, New Laptop, Emergency Fund"
            leftIcon={<Target className="w-4 h-4" />}
            helperText="Give your savings goal a descriptive name"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EnhancedInput
              id="targetAmount"
              name="targetAmount"
              label="Target Amount *"
              type="currency"
              inputSize="touch"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              leftIcon={<DollarSign className="w-4 h-4" />}
              helperText="How much do you want to save?"
            />

            <EnhancedInput
              id="targetDate"
              name="targetDate"
              label="Target Date *"
              type="date"
              inputSize="touch"
              required
              min={new Date().toISOString().split('T')[0]}
              leftIcon={<Calendar className="w-4 h-4" />}
              helperText="When do you want to achieve this goal?"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Textarea
                id="description"
                name="description"
                placeholder="Add any additional details about your savings goal..."
                className="pl-10 min-h-[100px] rounded-xl border-input focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">Optional: Add more details about your savings goal</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-green-900 mb-2 flex items-center">
              🎯 Savings Goal Tips
            </h3>
            <ul className="text-green-800 text-sm space-y-1.5">
              <li>• Set realistic and achievable target amounts</li>
              <li>• Break larger goals into smaller milestones</li>
              <li>• Set a reasonable timeline that motivates you</li>
              <li>• Review and adjust your goals regularly</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Link href="/savings" className="sm:order-1">
              <EnhancedButton type="button" variant="outline" size="touch" className="w-full">
                Cancel
              </EnhancedButton>
            </Link>
            <EnhancedButton type="submit" size="touch" className="sm:order-2">
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </EnhancedButton>
          </div>
        </form>
      </Card>
    </div>
    );
  } catch (error) {
    console.error('Error in NewSavingsGoalPage:', error);
    return <ErrorFallback error={error instanceof Error ? error.message : 'Unknown error occurred'} />;
  }
}
