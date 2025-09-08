import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getWallet, updateWallet } from '@/app/actions/wallet';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function WalletSettingsTestPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const wallet = await getWallet();

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <Link href="/wallet" className="text-blue-600 hover:text-blue-700">
          ← Back to Wallet
        </Link>
        <h1 className="text-2xl font-bold mt-2">Test Wallet Settings</h1>
        <p className="text-gray-600">Testing currency change functionality</p>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <form action={updateWallet} className="space-y-4">
          <div>
            <label htmlFor="balance" className="block text-sm font-medium text-gray-700 mb-1">
              Current Balance
            </label>
            <input
              type="number"
              id="balance"
              name="balance"
              step="0.01"
              defaultValue={wallet?.balance?.toString() || '0'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="monthlyBudget" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Budget
            </label>
            <input
              type="number"
              id="monthlyBudget"
              name="monthlyBudget"
              step="0.01"
              defaultValue={wallet?.monthlyBudget?.toString() || '0'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency (Current: {wallet?.currency || 'USD'})
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue={wallet?.currency || 'USD'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="EGP">EGP - Egyptian Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
              <option value="JPY">JPY - Japanese Yen</option>
              <option value="CHF">CHF - Swiss Franc</option>
              <option value="CNY">CNY - Chinese Yuan</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="BRL">BRL - Brazilian Real</option>
              <option value="MXN">MXN - Mexican Peso</option>
              <option value="ZAR">ZAR - South African Rand</option>
              <option value="SGD">SGD - Singapore Dollar</option>
              <option value="HKD">HKD - Hong Kong Dollar</option>
              <option value="SAR">SAR - Saudi Riyal</option>
              <option value="AED">AED - UAE Dirham</option>
              <option value="TRY">TRY - Turkish Lira</option>
              <option value="RUB">RUB - Russian Ruble</option>
              <option value="KRW">KRW - South Korean Won</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Link href="/wallet">
              <button type="button" className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
                Cancel
              </button>
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>Debug Info:</strong></p>
        <p>Current wallet currency: <code>{wallet?.currency || 'Not set'}</code></p>
        <p>Current balance: <code>{wallet?.balance || 0}</code></p>
        <p>Monthly budget: <code>{wallet?.monthlyBudget || 0}</code></p>
      </div>
    </div>
  );
}
