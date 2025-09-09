'use server';

import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export interface BudgetData {
  category: string;
  monthlyLimit: number;
  currency?: string;
  alertThreshold?: number;
  enableAlerts?: boolean;
  month: number;
  year: number;
}

export async function createBudget(data: BudgetData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const budget = await db.budget.create({
      data: {
        ...data,
        currency: data.currency || 'USD',
        alertThreshold: data.alertThreshold || 80,
        enableAlerts: data.enableAlerts !== false,
        userId: user.id,
      },
    });

    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    revalidatePath('/expenses');
    
    return { success: true, budget };
  } catch (error) {
    console.error('Error creating budget:', error);
    return { success: false, error: 'Failed to create budget' };
  }
}

export async function updateBudget(id: string, data: Partial<BudgetData>) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const budget = await db.budget.update({
      where: { 
        id,
        userId: user.id 
      },
      data,
    });

    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    revalidatePath('/expenses');
    
    return { success: true, budget };
  } catch (error) {
    console.error('Error updating budget:', error);
    return { success: false, error: 'Failed to update budget' };
  }
}

export async function deleteBudget(id: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    await db.budget.delete({
      where: { 
        id,
        userId: user.id 
      },
    });

    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    revalidatePath('/expenses');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting budget:', error);
    return { success: false, error: 'Failed to delete budget' };
  }
}

export async function getBudgets(month?: number, year?: number) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  try {
    const budgets = await db.budget.findMany({
      where: { 
        userId: user.id,
        month: targetMonth,
        year: targetYear,
        isActive: true
      },
      orderBy: { category: 'asc' },
    });

    return budgets;
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return [];
  }
}

export async function getBudgetById(id: string) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const budget = await db.budget.findFirst({
      where: { 
        id,
        userId: user.id 
      },
    });

    return budget;
  } catch (error) {
    console.error('Error fetching budget:', error);
    return null;
  }
}

export async function getBudgetByCategory(category: string, month?: number, year?: number) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  try {
    const budget = await db.budget.findFirst({
      where: { 
        userId: user.id,
        category,
        month: targetMonth,
        year: targetYear,
        isActive: true
      },
    });

    return budget;
  } catch (error) {
    console.error('Error fetching budget by category:', error);
    return null;
  }
}

export async function getBudgetStatus(month?: number, year?: number) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const now = new Date();
  const targetMonth = month || now.getMonth() + 1;
  const targetYear = year || now.getFullYear();

  try {
    // Get budgets for the specified month
    const budgets = await getBudgets(targetMonth, targetYear);
    
    // Get expenses for the specified month
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59);
    
    const expenses = await db.expense.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Calculate spent amount per category
    const categorySpending = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Other';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    // Create budget status for each budget
    const budgetStatus = budgets.map(budget => {
      const spent = categorySpending[budget.category] || 0;
      const remaining = Math.max(0, budget.monthlyLimit - spent);
      const percentageUsed = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
      const isOverBudget = spent > budget.monthlyLimit;
      const isNearLimit = percentageUsed >= budget.alertThreshold;

      return {
        ...budget,
        spent,
        remaining,
        percentageUsed,
        isOverBudget,
        isNearLimit,
      };
    });

    // Also include categories with spending but no budget
    const categoriesWithoutBudget = Object.keys(categorySpending)
      .filter(category => !budgets.some(budget => budget.category === category))
      .map(category => ({
        category,
        spent: categorySpending[category],
        hasNoBudget: true,
      }));

    return {
      budgetStatus,
      categoriesWithoutBudget,
      totalBudget: budgets.reduce((sum, budget) => sum + budget.monthlyLimit, 0),
      totalSpent: Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0),
    };
  } catch (error) {
    console.error('Error fetching budget status:', error);
    return {
      budgetStatus: [],
      categoriesWithoutBudget: [],
      totalBudget: 0,
      totalSpent: 0,
    };
  }
}

export async function checkBudgetAlerts(month?: number, year?: number) {
  const user = await getCurrentUser();
  
  if (!user) {
    return [];
  }

  try {
    const budgetStatus = await getBudgetStatus(month, year);
    const alerts = [];

    for (const status of budgetStatus.budgetStatus) {
      if (!status.enableAlerts) continue;

      if (status.isOverBudget) {
        // Create budget exceeded notification
        await db.notification.create({
          data: {
            title: 'Budget Exceeded',
            message: `You have exceeded your budget for ${status.category}. Spent: $${status.spent.toFixed(2)}, Budget: $${status.monthlyLimit.toFixed(2)}`,
            type: 'BUDGET_EXCEEDED',
            userId: user.id,
            data: {
              budgetId: status.id,
              category: status.category,
              spent: status.spent,
              budget: status.monthlyLimit,
              month,
              year,
            },
          },
        });

        alerts.push({
          type: 'exceeded',
          category: status.category,
          spent: status.spent,
          budget: status.monthlyLimit,
        });
      } else if (status.isNearLimit) {
        // Create budget warning notification
        await db.notification.create({
          data: {
            title: 'Budget Warning',
            message: `You have used ${status.percentageUsed.toFixed(1)}% of your budget for ${status.category}`,
            type: 'BUDGET_WARNING',
            userId: user.id,
            data: {
              budgetId: status.id,
              category: status.category,
              spent: status.spent,
              budget: status.monthlyLimit,
              percentage: status.percentageUsed,
              month,
              year,
            },
          },
        });

        alerts.push({
          type: 'warning',
          category: status.category,
          spent: status.spent,
          budget: status.monthlyLimit,
          percentage: status.percentageUsed,
        });
      }
    }

    if (alerts.length > 0) {
      revalidatePath('/dashboard');
      revalidatePath('/budgets');
    }

    return alerts;
  } catch (error) {
    console.error('Error checking budget alerts:', error);
    return [];
  }
}

export async function createOrUpdateBudget(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const category = String(formData.get('category') || '').trim();
  const monthlyLimit = parseFloat(String(formData.get('monthlyLimit') || '0'));
  const currency = String(formData.get('currency') || 'USD');
  const alertThreshold = parseFloat(String(formData.get('alertThreshold') || '80'));
  const enableAlerts = formData.get('enableAlerts') === 'on';
  const month = parseInt(String(formData.get('month') || String(new Date().getMonth() + 1)));
  const year = parseInt(String(formData.get('year') || String(new Date().getFullYear())));

  if (!category || monthlyLimit <= 0) {
    throw new Error('Category and valid monthly limit are required');
  }

  try {
    // Check if budget already exists for this category/month/year
    const existingBudget = await db.budget.findFirst({
      where: {
        userId: user.id,
        category,
        month,
        year,
      },
    });

    if (existingBudget) {
      // Update existing budget
      await db.budget.update({
        where: { id: existingBudget.id },
        data: {
          monthlyLimit,
          currency,
          alertThreshold,
          enableAlerts,
          isActive: true,
        },
      });
    } else {
      // Create new budget
      await db.budget.create({
        data: {
          category,
          monthlyLimit,
          currency,
          alertThreshold,
          enableAlerts,
          month,
          year,
          userId: user.id,
        },
      });
    }

    revalidatePath('/budgets');
    revalidatePath('/dashboard');
    revalidatePath('/expenses');
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    throw error;
  }

  redirect('/budgets');
}
