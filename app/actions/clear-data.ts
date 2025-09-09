'use server';

import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Clear all expenses
export async function clearExpenses() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  console.log('=== CLEARING EXPENSES ===');
  console.log('User ID:', user.id);

  try {
    const result = await db.expense.deleteMany({
      where: { userId: user.id },
    });

    console.log(`Deleted ${result.count} expenses`);

    revalidatePath('/expenses');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    revalidatePath('/wallet');
    
    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error clearing expenses:', error);
    throw new Error('Failed to clear expenses');
  }
}

// Clear all subscriptions
export async function clearSubscriptions() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  console.log('=== CLEARING SUBSCRIPTIONS ===');
  console.log('User ID:', user.id);

  try {
    const result = await db.subscription.deleteMany({
      where: { userId: user.id },
    });

    console.log(`Deleted ${result.count} subscriptions`);

    revalidatePath('/subscriptions');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error clearing subscriptions:', error);
    throw new Error('Failed to clear subscriptions');
  }
}

// Clear all savings
export async function clearSavings() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  console.log('=== CLEARING SAVINGS ===');
  console.log('User ID:', user.id);

  try {
    const result = await db.saving.deleteMany({
      where: { userId: user.id },
    });

    console.log(`Deleted ${result.count} savings`);

    revalidatePath('/savings');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error clearing savings:', error);
    throw new Error('Failed to clear savings');
  }
}

// Clear wallet balance (reset to 0)
export async function clearWalletBalance() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  console.log('=== CLEARING WALLET BALANCE ===');
  console.log('User ID:', user.id);

  try {
    // Reset wallet balance to 0 but keep other settings
    const result = await db.wallet.updateMany({
      where: { userId: user.id },
      data: {
        balance: 0,
      },
    });

    console.log('Wallet balance cleared successfully');

    revalidatePath('/wallet');
    revalidatePath('/wallet/settings');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
    return { success: true, cleared: true };
  } catch (error) {
    console.error('Error clearing wallet balance:', error);
    throw new Error('Failed to clear wallet balance');
  }
}

// Clear wallet transaction history (keep balance and settings)
export async function clearWalletHistory() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  console.log('=== CLEARING WALLET HISTORY ===');
  console.log('User ID:', user.id);

  try {
    // Clear income history but keep wallet settings
    const incomeResult = await db.income.deleteMany({
      where: { userId: user.id },
    });

    // Note: We don't clear expenses here as they might be tracked separately
    // Only clear income history as that's what affects wallet directly

    console.log(`Deleted ${incomeResult.count} income records`);

    revalidatePath('/wallet');
    revalidatePath('/wallet/income');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
    return { success: true, incomeCount: incomeResult.count };
  } catch (error) {
    console.error('Error clearing wallet history:', error);
    throw new Error('Failed to clear wallet history');
  }
}

// Clear income history
export async function clearIncomeHistory() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  console.log('=== CLEARING INCOME HISTORY ===');
  console.log('User ID:', user.id);

  try {
    const result = await db.income.deleteMany({
      where: { userId: user.id },
    });

    console.log(`Deleted ${result.count} income records`);

    revalidatePath('/wallet/income');
    revalidatePath('/wallet');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
    return { success: true, count: result.count };
  } catch (error) {
    console.error('Error clearing income history:', error);
    throw new Error('Failed to clear income history');
  }
}

// Reset profile data (this would need to be expanded based on what profile data exists)
export async function resetProfileData() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  console.log('=== RESETTING PROFILE DATA ===');
  console.log('User ID:', user.id);

  try {
    // Reset user name to null (keeping email and other essential data)
    await db.user.update({
      where: { id: user.id },
      data: {
        name: null,
        // Add other profile fields to reset as needed
      },
    });

    console.log('Profile data reset successfully');

    revalidatePath('/profile');
    revalidatePath('/settings');
    
    return { success: true };
  } catch (error) {
    console.error('Error resetting profile data:', error);
    throw new Error('Failed to reset profile data');
  }
}

// Clear notifications (placeholder - would need actual notification system)
export async function clearNotifications() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  console.log('=== CLEARING NOTIFICATIONS ===');
  console.log('User ID:', user.id);

  try {
    // This is a placeholder - would need actual notification table/system
    // For now, we'll just return success
    console.log('Notifications cleared (placeholder)');

    revalidatePath('/notifications');
    
    return { success: true, count: 0 };
  } catch (error) {
    console.error('Error clearing notifications:', error);
    throw new Error('Failed to clear notifications');
  }
}

// Generic clear function that routes to the appropriate clear function
export async function clearPageData(pageType: string) {
  switch (pageType) {
    case 'expenses':
      return await clearExpenses();
    case 'subscriptions':
      return await clearSubscriptions();
    case 'savings':
      return await clearSavings();
    case 'wallet':
      return await clearWalletBalance();
    case 'income':
      return await clearIncomeHistory();
    case 'profile':
      return await resetProfileData();
    case 'notifications':
      return await clearNotifications();
    default:
      throw new Error(`Unknown page type: ${pageType}`);
  }
}
