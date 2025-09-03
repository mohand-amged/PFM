import prisma from './db';

export interface Subscription {
  id: string;
  name: string;
  price: number;
  billingDate: Date;
  categories: string[];
  // Add other subscription fields as needed
}

export async function getUserSubscriptions(userId?: string): Promise<Subscription[]> {
  if (!userId) {
    return [];
  }
  
  return prisma.subscription.findMany({
    where: { userId },
    orderBy: { billingDate: 'asc' },
  });
}

export function calculateSubscriptionStats(subscriptions: Subscription[]) {
  const totalMonthly = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
  const totalAnnual = totalMonthly * 12;
  
  const upcomingRenewals = subscriptions.filter((sub) => {
    const renewalDate = new Date(sub.billingDate);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return renewalDate >= today && renewalDate <= thirtyDaysFromNow;
  });

  return { totalMonthly, totalAnnual, upcomingRenewals };
}

export function getSpendingByCategory(subscriptions: Subscription[]) {
  const spendingByCategory = subscriptions.reduce((acc, sub) => {
    sub.categories.forEach(category => {
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += sub.price;
    });
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(spendingByCategory).map(([name, value]) => ({
    name,
    value,
  }));
}
