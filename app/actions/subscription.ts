'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function deleteSubscription(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  
  const id = String(formData.get('id') || '')
  if (!id) return
  
  try {
    // Only delete if the subscription belongs to the current user
    await prisma.subscription.delete({ 
      where: { 
        id,
        userId: user.id 
      } 
    })
  } catch (e) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to delete subscription', id, e)
    }
    throw e // Re-throw to handle in the UI
  }
  revalidatePath('/subscriptions')
}

export async function createSubscription(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  
  const name = String(formData.get('name') || '').trim()
  const priceRaw = String(formData.get('price') || '')
  const billingDateRaw = String(formData.get('billingDate') || '').trim()
  const categories = (formData.getAll('categories') || []).map(String)
  const description = String(formData.get('description') || '').trim()

  if (!name) throw new Error('Subscription name is required')

  const price = parseFloat(priceRaw) || 0
  const billingDate = billingDateRaw ? new Date(billingDateRaw) : new Date()

  try {
    await prisma.subscription.create({
      data: {
        name,
        price,
        billingDate,
        categories,
        description,
        userId: user.id,
      },
    })
  } catch (e) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to create subscription', e)
    }
    throw e // Re-throw to handle in the UI
  }

  revalidatePath('/subscriptions')
  redirect('/subscriptions')
}

export async function updateSubscription(formData: FormData) {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/login')
  }
  
  const id = String(formData.get('id') || '')
  const name = String(formData.get('name') || '').trim()
  const priceRaw = String(formData.get('price') || '')
  const billingDateRaw = String(formData.get('billingDate') || '').trim()
  const categories = (formData.getAll('categories') || []).map(String)
  const description = String(formData.get('description') || '').trim()

  if (!id) return

  const price = parseFloat(priceRaw) || 0
  const billingDate = billingDateRaw ? new Date(billingDateRaw) : new Date()

  try {
    // Only update if the subscription belongs to the current user
    await prisma.subscription.update({
      where: { 
        id,
        userId: user.id 
      },
      data: {
        name,
        price,
        billingDate,
        categories,
        description,
      },
    })
  } catch (e) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to update subscription', id, e)
    }
    throw e // Re-throw to handle in the UI
  }

  revalidatePath('/subscriptions')
}
