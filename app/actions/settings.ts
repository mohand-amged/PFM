'use server';

import db from '@/lib/db';
import { getCurrentUser, clearAuthCookie } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface AppSettings {
  defaultCurrency: string;
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  renewalReminders?: boolean;
  analytics?: boolean;
}

// Get or create user settings
export async function getUserSettings() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    let settings = await db.userSettings.findUnique({
      where: { userId: user.id },
    });

    // Create settings if they don't exist
    if (!settings) {
      settings = await db.userSettings.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          defaultCurrency: 'USD',
          theme: 'system',
          emailNotifications: true,
          pushNotifications: true,
          renewalReminders: true,
          analytics: false,
        },
        update: {}, // No update needed if it exists
      });
    }

    return settings;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    // Return default settings if there's an error
    return {
      defaultCurrency: 'USD',
      theme: 'system',
      emailNotifications: true,
      pushNotifications: true,
      renewalReminders: true,
      analytics: false,
    };
  }
}

// Update general app settings including currency
export async function updateAppSettings(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const defaultCurrency = String(formData.get('defaultCurrency') || 'USD');
  const theme = String(formData.get('theme') || 'system') as 'light' | 'dark' | 'system';
  const emailNotifications = formData.get('emailNotifications') === 'on';
  const pushNotifications = formData.get('pushNotifications') === 'on';
  const renewalReminders = formData.get('renewalReminders') === 'on';
  const analytics = formData.get('analytics') === 'on';

  console.log('=== SETTINGS UPDATE DEBUG ===');
  console.log('Default Currency:', defaultCurrency);
  console.log('Theme:', theme);
  console.log('Email Notifications:', emailNotifications);
  console.log('Push Notifications:', pushNotifications);
  console.log('Renewal Reminders:', renewalReminders);
  console.log('Analytics:', analytics);
  console.log('User ID:', user.id);
  console.log('============================');

  try {
    const updatedSettings = await db.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        defaultCurrency,
        theme,
        emailNotifications,
        pushNotifications,
        renewalReminders,
        analytics,
      },
      update: {
        defaultCurrency,
        theme,
        emailNotifications,
        pushNotifications,
        renewalReminders,
        analytics,
      },
    });

    console.log('Settings updated successfully:', updatedSettings);

    // Also update the wallet currency to match if they're different
    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
    });

    if (wallet && wallet.currency !== defaultCurrency) {
      await db.wallet.update({
        where: { userId: user.id },
        data: { currency: defaultCurrency },
      });
      console.log('Wallet currency updated to match app settings:', defaultCurrency);
    }

    revalidatePath('/settings');
    revalidatePath('/wallet');
    revalidatePath('/wallet/settings');
    revalidatePath('/dashboard');
    
  } catch (error) {
    console.error('Error updating app settings:', error);
    throw error;
  }

  // Always redirect to settings page after successful update
  redirect('/settings');
}

// Update just the currency setting
export async function updateCurrency(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const currency = String(formData.get('currency') || 'USD');

  console.log('=== CURRENCY UPDATE DEBUG ===');
  console.log('New Currency:', currency);
  console.log('User ID:', user.id);
  console.log('=============================');

  try {
    // Update user settings
    await db.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        defaultCurrency: currency,
        theme: 'system',
        emailNotifications: true,
        pushNotifications: true,
        renewalReminders: true,
        analytics: false,
      },
      update: {
        defaultCurrency: currency,
      },
    });

    // Also update wallet currency
    await db.wallet.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        balance: 0,
        currency: currency,
      },
      update: {
        currency: currency,
      },
    });

    console.log('Currency updated successfully to:', currency);

    revalidatePath('/settings');
    revalidatePath('/wallet');
    revalidatePath('/wallet/settings');
    revalidatePath('/dashboard');
    
  } catch (error) {
    console.error('Error updating currency:', error);
    throw error;
  }

  // Redirect back to settings
  redirect('/settings');
}

// Clear all user data (everything except account)
export async function clearAllUserData() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  console.log('=== CLEAR DATA DEBUG ===');
  console.log('Clearing all data for user:', user.id);
  console.log('========================');

  try {
    // Delete all user-related data in a transaction
    await db.$transaction(async (prisma) => {
      // Delete all expenses
      await prisma.expense.deleteMany({
        where: { userId: user.id },
      });

      // Delete all incomes
      await prisma.income.deleteMany({
        where: { userId: user.id },
      });

      // Delete all savings
      await prisma.saving.deleteMany({
        where: { userId: user.id },
      });

      // Delete all subscriptions
      await prisma.subscription.deleteMany({
        where: { userId: user.id },
      });

      // Reset wallet to default state
      await prisma.wallet.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          balance: 0,
          currency: 'USD',
          monthlyBudget: 0,
        },
        update: {
          balance: 0,
          currency: 'USD',
          monthlyBudget: 0,
          lastSalaryDate: null,
        },
      });

      // Delete user settings (will recreate with defaults)
      try {
        await prisma.userSettings.deleteMany({
          where: { userId: user.id },
        });
      } catch (error) {
        // Ignore if userSettings table doesn't exist
        console.log('UserSettings table might not exist, skipping...');
      }
    });

    console.log('All user data cleared successfully');

    revalidatePath('/settings');
    revalidatePath('/wallet');
    revalidatePath('/dashboard');
    revalidatePath('/expenses');
    revalidatePath('/savings');
    revalidatePath('/subscriptions');
    
  } catch (error) {
    console.error('Error clearing user data:', error);
    throw error;
  }

  redirect('/dashboard');
}

// Export all user data as JSON
export async function exportUserData() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    // Fetch all user data
    const [wallet, expenses, incomes, savings, subscriptions] = await Promise.all([
      db.wallet.findUnique({ where: { userId: user.id } }),
      db.expense.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' } }),
      db.income.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' } }),
      db.saving.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' } }),
      db.subscription.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } }),
    ]);

    const exportData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        exportDate: new Date().toISOString(),
      },
      wallet,
      expenses,
      incomes,
      savings,
      subscriptions,
      summary: {
        totalExpenses: expenses.length,
        totalIncomes: incomes.length,
        totalSavings: savings.length,
        totalSubscriptions: subscriptions.length,
        walletBalance: wallet?.balance || 0,
        currency: wallet?.currency || 'USD',
      },
    };

    return exportData;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw error;
  }
}

// Delete user account and all data permanently
export async function deleteUserAccount(confirmationText: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  // Verify confirmation text
  if (confirmationText !== 'DELETE MY ACCOUNT') {
    throw new Error('Invalid confirmation text. Please type exactly "DELETE MY ACCOUNT" to confirm.');
  }

  console.log('=== ACCOUNT DELETION DEBUG ===');
  console.log('Deleting account for user:', user.email, 'ID:', user.id);
  console.log('==============================');

  try {
    // Delete all user data and account in a transaction with explicit ordering
    await db.$transaction(async (prisma) => {
      console.log('Starting transaction for user deletion...');
      
      // Delete all user-related data in order (foreign key dependencies)
      const deletedExpenses = await prisma.expense.deleteMany({ where: { userId: user.id } });
      console.log(`Deleted ${deletedExpenses.count} expenses`);
      
      const deletedIncomes = await prisma.income.deleteMany({ where: { userId: user.id } });
      console.log(`Deleted ${deletedIncomes.count} incomes`);
      
      const deletedSavings = await prisma.saving.deleteMany({ where: { userId: user.id } });
      console.log(`Deleted ${deletedSavings.count} savings`);
      
      const deletedSubscriptions = await prisma.subscription.deleteMany({ where: { userId: user.id } });
      console.log(`Deleted ${deletedSubscriptions.count} subscriptions`);
      
      const deletedWallets = await prisma.wallet.deleteMany({ where: { userId: user.id } });
      console.log(`Deleted ${deletedWallets.count} wallets`);
      
      // Try to delete user settings if the table exists
      try {
        const deletedSettings = await prisma.userSettings.deleteMany({ where: { userId: user.id } });
        console.log(`Deleted ${deletedSettings.count} user settings`);
      } catch (settingsError) {
        console.log('UserSettings table might not exist, skipping...', settingsError);
      }

      // Finally delete the user account
      console.log('Deleting user account...');
      await prisma.user.delete({ where: { id: user.id } });
      console.log('User account deleted successfully');
    }, {
      timeout: 10000, // 10 second timeout
      maxWait: 5000,  // 5 second max wait
    });

    console.log('Account deletion transaction completed successfully');
    
  } catch (error) {
    console.error('Error deleting account:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        throw new Error('Unable to delete account due to data dependencies. Please contact support.');
      } else if (error.message.includes('timeout')) {
        throw new Error('Account deletion timed out. Please try again or contact support.');
      } else {
        throw new Error(`Account deletion failed: ${error.message}`);
      }
    } else {
      throw new Error('An unexpected error occurred while deleting the account. Please contact support.');
    }
  }

  // Clear the auth cookie since the account no longer exists
  try {
    await clearAuthCookie();
    console.log('Auth cookie cleared successfully');
  } catch (cookieError) {
    console.error('Error clearing auth cookie:', cookieError);
    // Don't throw here, account is already deleted
  }
  
  // Redirect to signup page since account is deleted
  redirect('/signup');
}
