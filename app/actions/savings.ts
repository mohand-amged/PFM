'use server';

import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface SavingData {
  name: string;
  amount: number;
  currency?: string;
  date: Date;
  targetAmount?: number;
  category?: string;
  description?: string;
  isActive?: boolean;
}

export async function createSaving(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const name = String(formData.get('name') || '').trim();
  const targetAmountRaw = String(formData.get('targetAmount') || '');
  const targetDateRaw = String(formData.get('targetDate') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const currency = String(formData.get('currency') || 'USD');

  if (!name) throw new Error('Saving goal name is required');

  const targetAmount = parseFloat(targetAmountRaw) || 0;
  const date = targetDateRaw ? new Date(targetDateRaw) : new Date();
  const amount = 0; // Starting amount is 0

  try {
    await db.saving.create({
      data: {
        name,
        amount,
        currency,
        date,
        targetAmount,
        description: description || null,
        isActive: true,
        userId: user.id,
      },
    });

    revalidatePath('/savings');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
  } catch (error) {
    console.error('Error creating saving:', error);
    throw error;
  }

  redirect('/savings');
}

export async function createSavingData(data: SavingData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const saving = await db.saving.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    revalidatePath('/savings');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
    return { success: true, saving };
  } catch (error) {
    console.error('Error creating saving:', error);
    return { success: false, error: 'Failed to create saving' };
  }
}

export async function getSavings() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const savings = await db.saving.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    return savings;
  } catch (error) {
    console.error('Error fetching savings:', error);
    return [];
  }
}

export async function getSavingById(id: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const saving = await db.saving.findFirst({
      where: { 
        id,
        userId: user.id 
      },
    });

    return saving;
  } catch (error) {
    console.error('Error fetching saving:', error);
    return null;
  }
}

export async function updateSaving(id: string, data: Partial<SavingData>) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const saving = await db.saving.update({
      where: { 
        id,
        userId: user.id 
      },
      data,
    });

    revalidatePath('/savings');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
    return { success: true, saving };
  } catch (error) {
    console.error('Error updating saving:', error);
    return { success: false, error: 'Failed to update saving' };
  }
}

export async function deleteSaving(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const id = String(formData.get('id') || '');
  if (!id) return;

  try {
    await db.saving.delete({
      where: { 
        id,
        userId: user.id 
      },
    });

    revalidatePath('/savings');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
  } catch (error) {
    console.error('Error deleting saving:', error);
    throw error;
  }
}

export async function deleteSavingById(id: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    await db.saving.delete({
      where: { 
        id,
        userId: user.id 
      },
    });

    revalidatePath('/savings');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting saving:', error);
    return { success: false, error: 'Failed to delete saving' };
  }
}

export async function toggleSavingStatus(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const id = String(formData.get('id') || '');
  if (!id) return;

  try {
    const saving = await db.saving.findFirst({
      where: { 
        id,
        userId: user.id 
      },
    });

    if (!saving) {
      throw new Error('Saving not found');
    }

    await db.saving.update({
      where: { 
        id,
        userId: user.id 
      },
      data: {
        isActive: !saving.isActive,
      },
    });

    revalidatePath('/savings');
    revalidatePath('/dashboard');
    revalidatePath('/analytics');
    
  } catch (error) {
    console.error('Error toggling saving status:', error);
    throw error;
  }
}

export async function getSavingStats() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const savings = await db.saving.findMany({
      where: { userId: user.id },
    });

    const totalSavings = savings.reduce((sum, saving) => sum + saving.amount, 0);
    const totalCount = savings.length;
    const activeSavings = savings.filter(saving => saving.isActive);
    const totalTarget = savings.reduce((sum, saving) => sum + (saving.targetAmount || 0), 0);
    
    // Get this month's savings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthSavings = savings.filter(saving => saving.date >= startOfMonth);
    const thisMonthTotal = thisMonthSavings.reduce((sum, saving) => sum + saving.amount, 0);

    // Category breakdown
    const categoryTotals = savings.reduce((acc, saving) => {
      const category = saving.category || 'Other';
      acc[category] = (acc[category] || 0) + saving.amount;
      return acc;
    }, {} as Record<string, number>);

    // Goal progress
    const savingsWithTargets = savings.filter(saving => saving.targetAmount && saving.targetAmount > 0);
    const goalProgress = savingsWithTargets.map(saving => ({
      id: saving.id,
      name: saving.name,
      current: saving.amount,
      target: saving.targetAmount!,
      progress: (saving.amount / saving.targetAmount!) * 100,
    }));

    return {
      totalSavings,
      totalCount,
      activeSavingsCount: activeSavings.length,
      totalTarget,
      thisMonthTotal,
      categoryTotals,
      goalProgress,
      savings: savings.slice(0, 5), // Recent 5 savings
    };
  } catch (error) {
    console.error('Error fetching saving stats:', error);
    return {
      totalSavings: 0,
      totalCount: 0,
      activeSavingsCount: 0,
      totalTarget: 0,
      thisMonthTotal: 0,
      categoryTotals: {},
      goalProgress: [],
      savings: [],
    };
  }
}
