'use server';

import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// Get user preferences
export async function getUserPreferences() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    let preferences = await db.userPreferences.findUnique({
      where: { userId: user.id },
    });

    // Create default preferences if they don't exist
    if (!preferences) {
      preferences = await db.userPreferences.create({
        data: {
          userId: user.id,
          emailNotifications: false,
          pushNotifications: false,
          reminderSevenDays: true,
          reminderOneDay: true,
          reminderSameDay: false,
          weeklyDigest: false,
          monthlyReport: false,
        },
      });
    }

    return preferences;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    // Return default preferences if there's an error
    return {
      id: '',
      emailNotifications: false,
      pushNotifications: false,
      reminderSevenDays: true,
      reminderOneDay: true,
      reminderSameDay: false,
      weeklyDigest: false,
      monthlyReport: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: user.id,
    };
  }
}

// Update reminder preferences
export async function updateReminderPreferences(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const reminderSevenDays = formData.get('reminderSevenDays') === 'on';
    const reminderOneDay = formData.get('reminderOneDay') === 'on';
    const reminderSameDay = formData.get('reminderSameDay') === 'on';

    await db.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        reminderSevenDays,
        reminderOneDay,
        reminderSameDay,
      },
      create: {
        userId: user.id,
        emailNotifications: false,
        pushNotifications: false,
        reminderSevenDays,
        reminderOneDay,
        reminderSameDay,
        weeklyDigest: false,
        monthlyReport: false,
      },
    });

    revalidatePath('/settings');
  } catch (error) {
    console.error('Error updating reminder preferences:', error);
    throw new Error('Failed to update reminder preferences');
  }
}

// Update notification preferences
export async function updateNotificationPreferences(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const emailNotifications = formData.get('emailNotifications') === 'on';
    const pushNotifications = formData.get('pushNotifications') === 'on';
    const weeklyDigest = formData.get('weeklyDigest') === 'on';
    const monthlyReport = formData.get('monthlyReport') === 'on';

    await db.userPreferences.upsert({
      where: { userId: user.id },
      update: {
        emailNotifications,
        pushNotifications,
        weeklyDigest,
        monthlyReport,
      },
      create: {
        userId: user.id,
        emailNotifications,
        pushNotifications,
        reminderSevenDays: true,
        reminderOneDay: true,
        reminderSameDay: false,
        weeklyDigest,
        monthlyReport,
      },
    });

    revalidatePath('/settings');
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw new Error('Failed to update notification preferences');
  }
}

// Toggle a specific preference
export async function togglePreference(formData: FormData) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const preferenceName = formData.get('preference') as string;
    const currentValue = formData.get('currentValue') === 'true';
    const newValue = !currentValue;

    const updateData: any = {};
    updateData[preferenceName] = newValue;

    await db.userPreferences.upsert({
      where: { userId: user.id },
      update: updateData,
      create: {
        userId: user.id,
        emailNotifications: preferenceName === 'emailNotifications' ? newValue : false,
        pushNotifications: preferenceName === 'pushNotifications' ? newValue : false,
        reminderSevenDays: preferenceName === 'reminderSevenDays' ? newValue : true,
        reminderOneDay: preferenceName === 'reminderOneDay' ? newValue : true,
        reminderSameDay: preferenceName === 'reminderSameDay' ? newValue : false,
        weeklyDigest: preferenceName === 'weeklyDigest' ? newValue : false,
        monthlyReport: preferenceName === 'monthlyReport' ? newValue : false,
      },
    });

    revalidatePath('/settings');
  } catch (error) {
    console.error('Error toggling preference:', error);
    throw new Error('Failed to update preference');
  }
}
