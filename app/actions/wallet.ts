'use server';

import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface WalletData {
  balance: number;
  currency?: string;
  monthlyBudget?: number;
}

export interface IncomeData {
  amount: number;
  source: string;
  description?: string;
  type: 'SALARY' | 'FREELANCE' | 'BONUS' | 'INVESTMENT' | 'SIDE_HUSTLE' | 'OTHER';
  date: Date;
  currency?: string;
}

// Get or create wallet for user
export async function getWallet() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    let wallet = await db.wallet.findUnique({
      where: { userId: user.id },
    });

    // Create wallet if it doesn't exist using upsert
    if (!wallet) {
      wallet = await db.wallet.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          balance: 0,
          currency: 'USD',
        },
        update: {}, // No update needed if it exists
      });
    }

    return wallet;
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return null;
  }
}

// Update wallet balance and budget
export async function updateWallet(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const balanceRaw = String(formData.get('balance') || '');
  const monthlyBudgetRaw = String(formData.get('monthlyBudget') || '');
  const currency = String(formData.get('currency') || 'USD');

  const balance = parseFloat(balanceRaw) || 0;
  const monthlyBudget = parseFloat(monthlyBudgetRaw) || 0;

  try {
    await db.wallet.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        balance,
        monthlyBudget,
        currency,
      },
      update: {
        balance,
        monthlyBudget,
        currency,
      },
    });

    revalidatePath('/wallet');
    revalidatePath('/dashboard');
    
  } catch (error) {
    console.error('Error updating wallet:', error);
    throw error;
  }

  redirect('/wallet');
}

// Add income (like salary)
export async function addIncome(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const amountRaw = String(formData.get('amount') || '');
  const source = String(formData.get('source') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const type = String(formData.get('type') || 'SALARY') as IncomeData['type'];
  const dateRaw = String(formData.get('date') || '').trim();
  const currency = String(formData.get('currency') || 'USD');
  const updateWalletBalance = formData.get('updateWalletBalance') === 'on';

  if (!source) throw new Error('Income source is required');

  const amount = parseFloat(amountRaw) || 0;
  const date = dateRaw ? new Date(dateRaw) : new Date();

  try {
    // Add income record
    await db.income.create({
      data: {
        amount,
        source,
        description: description || null,
        type,
        date,
        currency,
        userId: user.id,
      },
    });

    // Update wallet balance if requested
    if (updateWalletBalance) {
      const wallet = await db.wallet.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          balance: amount,
          currency,
          lastSalaryDate: type === 'SALARY' ? date : undefined,
        },
        update: {
          balance: {
            increment: amount,
          },
          lastSalaryDate: type === 'SALARY' ? date : undefined,
        },
      });
    }

    revalidatePath('/wallet');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
  } catch (error) {
    console.error('Error adding income:', error);
    throw error;
  }

  redirect('/wallet');
}

// Get income history
export async function getIncomes() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const incomes = await db.income.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    return incomes;
  } catch (error) {
    console.error('Error fetching incomes:', error);
    return [];
  }
}

// Get wallet statistics
export async function getWalletStats() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const wallet = await getWallet();
    const incomes = await db.income.findMany({
      where: { userId: user.id },
    });

    const expenses = await db.expense.findMany({
      where: { userId: user.id },
    });

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyIncome = incomes
      .filter(income => income.date >= currentMonth)
      .reduce((sum, income) => sum + income.amount, 0);

    const monthlyExpenses = expenses
      .filter(expense => expense.date >= currentMonth)
      .reduce((sum, expense) => sum + expense.amount, 0);

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      wallet: wallet || { balance: 0, monthlyBudget: 0, currency: 'USD' },
      monthlyIncome,
      monthlyExpenses,
      totalIncome,
      totalExpenses,
      netWorth: totalIncome - totalExpenses,
      budgetRemaining: (wallet?.monthlyBudget || 0) - monthlyExpenses,
      incomeCount: incomes.length,
    };
  } catch (error) {
    console.error('Error fetching wallet stats:', error);
    return {
      wallet: { balance: 0, monthlyBudget: 0, currency: 'USD' },
      monthlyIncome: 0,
      monthlyExpenses: 0,
      totalIncome: 0,
      totalExpenses: 0,
      netWorth: 0,
      budgetRemaining: 0,
      incomeCount: 0,
    };
  }
}

// Deduct expense from wallet (called when expense is added)
export async function deductFromWallet(amount: number) {
  const user = await getCurrentUser();
  
  if (!user) {
    return;
  }

  try {
    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
    });

    if (wallet && wallet.balance >= amount) {
      await db.wallet.update({
        where: { userId: user.id },
        data: {
          balance: wallet.balance - amount,
        },
      });
    }
  } catch (error) {
    console.error('Error deducting from wallet:', error);
    // Don't throw error to prevent expense creation failure
  }
}
