import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createExpense } from '@/app/actions/expenses';
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, DollarSign, Calendar, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function NewExpensePage() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect('/login');
    }

    return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/expenses">
            <EnhancedButton variant="outline" size="touch-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Expenses
            </EnhancedButton>
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Expense</h1>
        <p className="text-gray-600 mt-2">Record a new expense transaction</p>
      </div>

      <Card className="p-4 sm:p-6">
        <form action={createExpense} className="space-y-6">
          <EnhancedInput
            id="name"
            name="name"
            label="Description *"
            type="text"
            inputSize="touch"
            required
            placeholder="e.g., Groceries, Movie Tickets, Dinner"
            leftIcon={<ShoppingBag className="w-4 h-4" />}
            helperText="Enter a brief description of your expense"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <EnhancedInput
              id="amount"
              name="amount"
              label="Amount *"
              type="currency"
              inputSize="touch"
              step="0.01"
              min="0"
              required
              placeholder="0.00"
              leftIcon={<DollarSign className="w-4 h-4" />}
              helperText="How much did you spend?"
            />

            <EnhancedInput
              id="date"
              name="date"
              label="Date *"
              type="date"
              inputSize="touch"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
              leftIcon={<Calendar className="w-4 h-4" />}
              helperText="When did this expense occur?"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <div className="relative">
              <ShoppingBag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                id="category"
                name="category"
                required
                className="pl-10 block w-full rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a category</option>
                <option value="food">Food & Dining</option>
                <option value="shopping">Shopping</option>
                <option value="transportation">Transportation</option>
                <option value="entertainment">Entertainment</option>
                <option value="bills">Bills & Utilities</option>
                <option value="health">Health & Medical</option>
                <option value="education">Education</option>
                <option value="travel">Travel</option>
                <option value="other">Other</option>
              </select>
            </div>
            <p className="text-sm text-gray-600 mt-1">Choose the category that best fits this expense</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              💡 Expense Tracking Tips
            </h3>
            <ul className="text-blue-800 text-sm space-y-1.5">
              <li>• Be specific with descriptions for better budget analysis</li>
              <li>• Choose accurate categories to track spending patterns</li>
              <li>• Record expenses promptly for accurate financial tracking</li>
              <li>• Regular tracking helps identify spending habits</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Link href="/expenses" className="sm:order-1">
              <EnhancedButton type="button" variant="outline" size="touch" className="w-full sm:w-auto">
                Cancel
              </EnhancedButton>
            </Link>
            <EnhancedButton type="submit" size="touch" className="sm:order-2">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </EnhancedButton>
          </div>
        </form>
      </Card>
    </div>
    );
  } catch (error) {
    console.error('Error loading add expense page:', error);
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Expense</h1>
          <p className="text-gray-600 mt-2">Record a new expense transaction</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Form</h2>
          <p className="text-red-700 mb-4">There was an issue loading the expense form. Please try again.</p>
          <a 
            href="/expenses" 
            className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Expenses
          </a>
        </div>
      </div>
    );
  }
}
