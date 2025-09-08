import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { addIncome } from '@/app/actions/wallet';
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, DollarSign, Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import CurrencySelect from '@/components/ui/currency-select';

export const dynamic = 'force-dynamic';

export default async function AddIncomePage() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect('/login');
    }

    return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/wallet">
            <EnhancedButton variant="outline" size="touch-sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wallet
            </EnhancedButton>
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Income</h1>
        <p className="text-gray-600 mt-2">Record your salary, freelance work, or other income sources</p>
      </div>

      <Card className="p-4 sm:p-6">
        <form action={addIncome} className="space-y-6">
          <EnhancedInput
            id="source"
            name="source"
            label="Income Source *"
            type="text"
            inputSize="touch"
            required
            placeholder="e.g., Monthly Salary, Freelance Project, Bonus"
            helperText="Enter a descriptive name for this income source"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <EnhancedInput
              id="amount"
              name="amount"
              label="Amount *"
              type="currency"
              inputSize="touch"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              leftIcon={<DollarSign className="w-4 h-4" />}
              helperText="Enter the income amount"
            />

            <CurrencySelect
              id="currency"
              name="currency"
              label="Currency"
              defaultValue="USD"
              helperText="Select the currency for this income"
              size="touch"
              required={true}
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
              helperText="When did you receive this income?"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Income Type *
            </label>
            <select
              id="type"
              name="type"
              required
              className="block w-full rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="SALARY">Salary</option>
              <option value="FREELANCE">Freelance</option>
              <option value="BONUS">Bonus</option>
              <option value="INVESTMENT">Investment</option>
              <option value="SIDE_HUSTLE">Side Hustle</option>
              <option value="OTHER">Other</option>
            </select>
            <p className="text-sm text-gray-600 mt-1">Select the type that best describes this income</p>
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
                placeholder="Optional details about this income..."
                className="pl-10 min-h-[100px] rounded-xl border-input focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <p className="text-sm text-gray-600 mt-1">Add any additional details or notes</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="updateWalletBalance"
                name="updateWalletBalance"
                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                defaultChecked
              />
              <div>
                <label htmlFor="updateWalletBalance" className="text-sm font-medium text-gray-700">
                  Add this amount to my wallet balance
                </label>
                <p className="text-xs text-gray-600 mt-1">
                  This will automatically increase your available wallet balance
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              💡 Income Tracking Tips
            </h3>
            <ul className="text-blue-800 text-sm space-y-1.5">
              <li>• Regular salary entries help track your monthly income patterns</li>
              <li>• Use specific descriptions for better financial insights</li>
              <li>• Checking &quot;Add to wallet&quot; will increase your available balance</li>
              <li>• Different income types help categorize your earning sources</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
            <Link href="/wallet" className="sm:order-1">
              <EnhancedButton type="button" variant="outline" size="touch" className="w-full sm:w-auto">
                Cancel
              </EnhancedButton>
            </Link>
            <EnhancedButton type="submit" size="touch" className="sm:order-2">
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </EnhancedButton>
          </div>
        </form>
      </Card>
    </div>
    );
  } catch (error) {
    console.error('Error loading add income page:', error);
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add Income</h1>
          <p className="text-gray-600 mt-2">Record your salary, freelance work, or other income sources</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Form</h2>
          <p className="text-red-700 mb-4">There was an issue loading the add income form. Please try again.</p>
          <a 
            href="/wallet" 
            className="inline-block bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Wallet
          </a>
        </div>
      </div>
    );
  }
}
