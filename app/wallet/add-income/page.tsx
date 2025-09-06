import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { addIncome } from '@/app/actions/wallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AddIncomePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/wallet">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wallet
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Add Income</h1>
        <p className="text-gray-600 mt-2">Record your salary, freelance work, or other income sources</p>
      </div>

      <Card className="p-6">
        <form action={addIncome} className="space-y-6">
          <div>
            <Label htmlFor="source" className="text-sm font-medium text-gray-700">
              Income Source *
            </Label>
            <Input
              id="source"
              name="source"
              type="text"
              required
              placeholder="e.g., Monthly Salary, Freelance Project, Bonus"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                Amount *
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="amount"
                  name="amount"
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
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Date *
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                className="mt-1"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="type" className="text-sm font-medium text-gray-700">
              Income Type *
            </Label>
            <select
              id="type"
              name="type"
              required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="SALARY">Salary</option>
              <option value="FREELANCE">Freelance</option>
              <option value="BONUS">Bonus</option>
              <option value="INVESTMENT">Investment</option>
              <option value="SIDE_HUSTLE">Side Hustle</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Optional details about this income..."
              className="mt-1 min-h-[80px]"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="updateWalletBalance"
              name="updateWalletBalance"
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              defaultChecked
            />
            <Label htmlFor="updateWalletBalance" className="text-sm text-gray-700">
              Add this amount to my wallet balance
            </Label>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Income Tracking Tips</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>• Regular salary entries help track your monthly income patterns</li>
              <li>• Use specific descriptions for better financial insights</li>
              <li>• Checking &quot;Add to wallet&quot; will increase your available balance</li>
              <li>• Different income types help categorize your earning sources</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/wallet">
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Income
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
