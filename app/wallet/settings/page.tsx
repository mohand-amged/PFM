import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getWallet, updateWallet } from '@/app/actions/wallet';
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Settings, AlertTriangle, DollarSign, Target } from 'lucide-react';
import CurrencySelect from '@/components/ui/currency-select';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function WalletSettingsPage() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect('/login');
    }

    const wallet = await getWallet();

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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Wallet Settings</h1>
        <p className="text-gray-600 mt-2">Manage your wallet balance and monthly budget</p>
      </div>

      <div className="space-y-6">
        <Card className="p-4 sm:p-6">
          <form action={updateWallet} className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Wallet Configuration</h2>
            </div>

            <EnhancedInput
              id="balance"
              name="balance"
              label="Current Balance"
              type="currency"
              inputSize="touch"
              step="0.01"
              min="0"
              placeholder="0.00"
              defaultValue={wallet?.balance?.toString() || '0'}
              leftIcon={<DollarSign className="w-4 h-4" />}
              helperText="Your current available balance. This will be updated when you add income or expenses."
            />

            <EnhancedInput
              id="monthlyBudget"
              name="monthlyBudget"
              label="Monthly Budget"
              type="currency"
              inputSize="touch"
              step="0.01"
              min="0"
              placeholder="0.00"
              defaultValue={wallet?.monthlyBudget?.toString() || '0'}
              leftIcon={<Target className="w-4 h-4" />}
              helperText="Set your monthly spending limit. You'll get alerts when you're close to exceeding it."
            />

            <CurrencySelect
              id="currency"
              name="currency"
              label="Currency"
              defaultValue={wallet?.currency || 'USD'}
              helperText="Choose your preferred currency for display"
              size="touch"
              required={false}
            />

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <Link href="/wallet" className="sm:order-1">
                <EnhancedButton type="button" variant="outline" size="touch" className="w-full sm:w-auto">
                  Cancel
                </EnhancedButton>
              </Link>
              <EnhancedButton type="submit" size="touch" className="sm:order-2">
                <Settings className="w-4 h-4 mr-2" />
                Save Settings
              </EnhancedButton>
            </div>
          </form>
        </Card>

        {/* Tips Card */}
        <Card className="p-4 sm:p-6 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-amber-900 mb-2">Important Notes</h3>
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
        <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200">
          <h3 className="text-base sm:text-lg font-semibold text-blue-900 mb-3 flex items-center">
            💡 Financial Health Tips
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-blue-800 text-sm">
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
  } catch (error) {
    console.error('Error loading wallet settings page:', error);
    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Wallet Settings</h1>
          <p className="text-gray-600 mt-2">Manage your wallet balance and monthly budget</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-semibold text-red-900 mb-2">Error Loading Settings</h2>
          <p className="text-red-700 mb-4">There was an issue loading the wallet settings. Please try again.</p>
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
