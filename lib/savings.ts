import db from '@/lib/db';
import type { Saving } from '@prisma/client';

export interface SavingWithId extends Saving {
  id: string;
}

export interface SavingStats {
  totalSaved: number;
  totalGoals: number;
  completedGoals: number;
  activeSavings: SavingWithId[];
  recentSavings: SavingWithId[];
  progressByCategory: Record<string, { saved: number; target: number }>;
}

export async function getUserSavings(userId: string): Promise<SavingWithId[]> {
  try {
    const savings = await db.saving.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return savings;
  } catch (error) {
    console.error('Failed to fetch savings:', error);
    throw new Error('Failed to fetch savings');
  }
}

export async function getSavingById(id: string, userId: string): Promise<SavingWithId | null> {
  try {
    const saving = await db.saving.findFirst({
      where: {
        id,
        userId,
      },
    });

    return saving;
  } catch (error) {
    console.error('Failed to fetch saving:', error);
    throw new Error('Failed to fetch saving');
  }
}

export async function createSaving(
  userId: string,
  data: {
    name: string;
    targetAmount?: number;
    amount: number;
    category?: string;
    date: Date;
    description?: string;
  }
): Promise<SavingWithId> {
  try {
    const saving = await db.saving.create({
      data: {
        ...data,
        userId,
        isCompleted: data.targetAmount ? data.amount >= data.targetAmount : false,
      },
    });

    return saving;
  } catch (error) {
    console.error('Failed to create saving:', error);
    throw new Error('Failed to create saving');
  }
}

export async function updateSaving(
  id: string,
  userId: string,
  data: {
    name?: string;
    targetAmount?: number;
    amount?: number;
    category?: string;
    date?: Date;
    description?: string;
  }
): Promise<SavingWithId> {
  try {
    const currentSaving = await getSavingById(id, userId);
    if (!currentSaving) {
      throw new Error('Saving not found');
    }

    const updatedData = { ...data };
    
    // Auto-update completion status if amounts are being changed
    if (data.amount !== undefined || data.targetAmount !== undefined) {
      const newAmount = data.amount ?? currentSaving.amount;
      const newTargetAmount = data.targetAmount ?? currentSaving.targetAmount;
      updatedData.isCompleted = newTargetAmount ? newAmount >= newTargetAmount : false;
    }

    const saving = await db.saving.update({
      where: {
        id,
        userId,
      },
      data: updatedData,
    });

    return saving;
  } catch (error) {
    console.error('Failed to update saving:', error);
    throw new Error('Failed to update saving');
  }
}

export async function deleteSaving(id: string, userId: string): Promise<void> {
  try {
    await db.saving.delete({
      where: {
        id,
        userId,
      },
    });
  } catch (error) {
    console.error('Failed to delete saving:', error);
    throw new Error('Failed to delete saving');
  }
}

export async function toggleSavingStatus(id: string, userId: string): Promise<SavingWithId> {
  try {
    const saving = await getSavingById(id, userId);
    if (!saving) {
      throw new Error('Saving not found');
    }

    const updatedSaving = await db.saving.update({
      where: {
        id,
        userId,
      },
      data: {
        isCompleted: !saving.isCompleted,
      },
    });

    return updatedSaving;
  } catch (error) {
    console.error('Failed to toggle saving status:', error);
    throw new Error('Failed to toggle saving status');
  }
}

export function calculateSavingStats(savings: SavingWithId[]): SavingStats {
  const totalSaved = savings.reduce((sum, saving) => sum + saving.amount, 0);
  const totalGoals = savings.length;
  const completedGoals = savings.filter(saving => saving.isCompleted).length;
  const activeSavings = savings.filter(saving => !saving.isCompleted);
  const recentSavings = savings.slice(0, 5);

  // Calculate progress by category
  const progressByCategory: Record<string, { saved: number; target: number }> = {};
  savings.forEach(saving => {
    const category = saving.category || 'Other';
    if (!progressByCategory[category]) {
      progressByCategory[category] = { saved: 0, target: 0 };
    }
    progressByCategory[category].saved += saving.amount;
    progressByCategory[category].target += saving.targetAmount || 0;
  });

  return {
    totalSaved,
    totalGoals,
    completedGoals,
    activeSavings,
    recentSavings,
    progressByCategory,
  };
}

export const SAVING_CATEGORIES = [
  'Emergency Fund',
  'Vacation',
  'Home Purchase',
  'Car Purchase',
  'Education',
  'Retirement',
  'Investment',
  'Wedding',
  'Electronics',
  'Health',
  'Debt Payment',
  'Other'
] as const;

export type SavingCategory = typeof SAVING_CATEGORIES[number];
