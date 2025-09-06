'use server';

import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type NotificationType = 
  | 'INFO' 
  | 'WARNING' 
  | 'SUCCESS' 
  | 'SUBSCRIPTION_RENEWAL' 
  | 'LOW_BALANCE' 
  | 'GOAL_ACHIEVED' 
  | 'BUDGET_EXCEEDED';

export interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  data?: any;
}

// Create notification
export async function createNotification(userId: string, data: NotificationData) {
  try {
    await db.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type,
        data: data.data || null,
        userId,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/notifications');
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

// Get user notifications
export async function getNotifications() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit to 50 most recent
    });

    return notifications;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

// Mark notification as read
export async function markNotificationRead(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const id = String(formData.get('id') || '');
  if (!id) return;

  try {
    await db.notification.update({
      where: { 
        id,
        userId: user.id 
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath('/notifications');
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Mark all notifications as read
export async function markAllNotificationsRead() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    await db.notification.updateMany({
      where: { 
        userId: user.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    revalidatePath('/notifications');
    revalidatePath('/dashboard');
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
  }
}

// Delete notification
export async function deleteNotification(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const id = String(formData.get('id') || '');
  if (!id) return;

  try {
    await db.notification.delete({
      where: { 
        id,
        userId: user.id 
      },
    });

    revalidatePath('/notifications');
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
}

// Get notification stats
export async function getNotificationStats() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const [total, unread] = await Promise.all([
      db.notification.count({
        where: { userId: user.id },
      }),
      db.notification.count({
        where: { 
          userId: user.id,
          isRead: false,
        },
      }),
    ]);

    return { total, unread };
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    return { total: 0, unread: 0 };
  }
}

// Smart notification triggers
export async function checkAndCreateSmartNotifications() {
  const user = await getCurrentUser();
  
  if (!user) {
    return;
  }

  try {
    // Check for subscription renewals (within 3 days)
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const upcomingSubscriptions = await db.subscription.findMany({
      where: {
        userId: user.id,
        billingDate: {
          lte: threeDaysFromNow,
          gte: new Date(),
        },
      },
    });

    for (const subscription of upcomingSubscriptions) {
      const daysUntil = Math.ceil((subscription.billingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if notification already exists for this subscription
      const existingNotification = await db.notification.findFirst({
        where: {
          userId: user.id,
          type: 'SUBSCRIPTION_RENEWAL',
          data: {
            path: ['subscriptionId'],
            equals: subscription.id,
          },
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
          },
        },
      });

      if (!existingNotification) {
        await createNotification(user.id, {
          title: 'Subscription Renewal Reminder',
          message: `${subscription.name} will renew in ${daysUntil} day${daysUntil !== 1 ? 's' : ''} for $${subscription.price}`,
          type: 'SUBSCRIPTION_RENEWAL',
          data: { subscriptionId: subscription.id, amount: subscription.price },
        });
      }
    }

    // Check for low wallet balance
    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
    });

    if (wallet && wallet.monthlyBudget && wallet.balance < (wallet.monthlyBudget * 0.1)) {
      const existingLowBalanceNotification = await db.notification.findFirst({
        where: {
          userId: user.id,
          type: 'LOW_BALANCE',
          createdAt: {
            gte: new Date(new Date().setDate(new Date().getDate() - 1)), // Within last day
          },
        },
      });

      if (!existingLowBalanceNotification) {
        await createNotification(user.id, {
          title: 'Low Balance Alert',
          message: `Your wallet balance ($${wallet.balance.toFixed(2)}) is running low compared to your monthly budget.`,
          type: 'LOW_BALANCE',
          data: { balance: wallet.balance, budget: wallet.monthlyBudget },
        });
      }
    }

    // Check for achieved savings goals
    const completedGoals = await db.saving.findMany({
      where: {
        userId: user.id,
        isActive: true,
        isCompleted: false,
      },
    });

    for (const goal of completedGoals) {
      if (goal.targetAmount && goal.amount >= goal.targetAmount) {
        await db.saving.update({
          where: { id: goal.id },
          data: { isCompleted: true },
        });

        await createNotification(user.id, {
          title: 'Savings Goal Achieved! 🎉',
          message: `Congratulations! You've reached your goal of $${goal.targetAmount} for "${goal.name}".`,
          type: 'GOAL_ACHIEVED',
          data: { goalId: goal.id, amount: goal.targetAmount },
        });
      }
    }

    // Check for budget exceeded
    if (wallet?.monthlyBudget) {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      currentMonth.setHours(0, 0, 0, 0);

      const monthlyExpenses = await db.expense.findMany({
        where: {
          userId: user.id,
          date: { gte: currentMonth },
        },
      });

      const totalMonthlySpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      if (totalMonthlySpent > wallet.monthlyBudget) {
        const existingBudgetNotification = await db.notification.findFirst({
          where: {
            userId: user.id,
            type: 'BUDGET_EXCEEDED',
            createdAt: {
              gte: currentMonth,
            },
          },
        });

        if (!existingBudgetNotification) {
          const overspent = totalMonthlySpent - wallet.monthlyBudget;
          await createNotification(user.id, {
            title: 'Budget Exceeded',
            message: `You've exceeded your monthly budget of $${wallet.monthlyBudget} by $${overspent.toFixed(2)}.`,
            type: 'BUDGET_EXCEEDED',
            data: { budget: wallet.monthlyBudget, spent: totalMonthlySpent, overspent },
          });
        }
      }
    }

  } catch (error) {
    console.error('Error checking smart notifications:', error);
  }
}
