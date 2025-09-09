import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getUserPreferences } from '@/app/actions/preferences';
import { getWallet } from '@/app/actions/wallet';
import db from '@/lib/db';
import AccountClient from '@/components/account/AccountClient';

export const metadata = {
  title: 'Account - Personal Finance Tracker',
  description: 'Manage your account settings, preferences, and profile information.',
};

export default async function AccountPage() {
  const authUser = await getCurrentUser();
  
  if (!authUser) {
    redirect('/login');
  }

  // Get full user data from database
  const [user, wallet, preferences] = await Promise.all([
    db.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    }),
    getWallet(),
    getUserPreferences()
  ]);

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Account</h1>
          <p className="text-muted-foreground">
            Manage your profile, preferences, and account settings.
          </p>
        </div>

        {/* Account Management */}
        <AccountClient user={user} wallet={wallet} preferences={preferences} />
      </div>
    </div>
  );
}
