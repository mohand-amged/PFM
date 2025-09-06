import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createSaving } from '@/app/actions/savings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewSavingsGoalPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/savings">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Savings
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Savings Goal</h1>
        <p className="text-gray-600 mt-2">Set a new financial goal to track your progress</p>
      </div>

      <Card className="p-6">
        <form action={createSaving} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Goal Name *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g., Vacation Fund, New Laptop, Emergency Fund"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetAmount" className="text-sm font-medium text-gray-700">
                Target Amount *
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="targetAmount"
                  name="targetAmount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="targetDate" className="text-sm font-medium text-gray-700">
                Target Date *
              </Label>
              <Input
                id="targetDate"
                name="targetDate"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Add any additional details about your savings goal..."
              className="mt-1 min-h-[100px]"
            />
          </div>


          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/savings">
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}