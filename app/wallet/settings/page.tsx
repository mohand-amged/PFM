import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getWallet, updateWallet } from '@/app/actions/wallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Settings, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function WalletSettingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const wallet = await getWallet();

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
        <h1 className="text-3xl font-bold text-gray-900">Wallet Settings</h1>
        <p className="text-gray-600 mt-2">Manage your wallet balance and monthly budget</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <form action={updateWallet} className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">Wallet Configuration</h2>
            </div>

            <div>
              <Label htmlFor="balance" className="text-sm font-medium text-gray-700">
                Current Balance
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="balance"
                  name="balance"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  defaultValue={wallet?.balance?.toString() || '0'}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Your current available balance. This will be updated when you add income or expenses.
              </p>
            </div>

            <div>
              <Label htmlFor="monthlyBudget" className="text-sm font-medium text-gray-700">
                Monthly Budget
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="monthlyBudget"
                  name="monthlyBudget"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  defaultValue={wallet?.monthlyBudget?.toString() || '0'}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Set your monthly spending limit. You&apos;ll get alerts when you&apos;re close to exceeding it.
              </p>
            </div>

            <div>
              <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                Currency
              </Label>
              <select
                id="currency"
                name="currency"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                defaultValue={wallet?.currency || 'USD'}
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" asChild>
                <Link href="/wallet">
                  Cancel
                </Link>
              </Button>
              <Button type="submit">
                Save Settings
              </Button>
            </div>
          </form>
        </Card>

        {/* Tips Card */}
        <Card className="p-6 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Important Notes</h3>
              <ul className="text-amber-800 text-sm space-y-2">
                <li>• <strong>Balance Management:</strong> Your balance will automatically decrease when you add expenses and increase when you add income (if you choose to update the balance).</li>
                <li>• <strong>Budget Alerts:</strong> Set a realistic monthly budget to get helpful spending notifications.</li>
                <li>• <strong>Currency Changes:</strong> Changing currency won&apos;t convert existing amounts - use this only if you initially set the wrong currency.</li>
                <li>• <strong>Data Safety:</strong> All financial data is encrypted and stored securely. Only you can access your wallet information.</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Financial Health Tips */}
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 Financial Health Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800 text-sm">
            <div>
              <h4 className="font-medium mb-1">Budget Setting</h4>
              <p>Set your budget to 80-90% of your income to leave room for unexpected expenses and savings.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Balance Tracking</h4>
              <p>Keep at least one month&apos;s expenses as a buffer in your wallet for financial security.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Regular Updates</h4>
              <p>Update your balance and budget monthly to reflect changes in income or lifestyle.</p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Goal Setting</h4>
              <p>Use savings goals alongside budget tracking for a complete financial picture.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
