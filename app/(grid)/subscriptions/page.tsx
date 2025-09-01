import React from 'react'
import prisma from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/auth'
import { AddButton } from '@/app/components/defaults/AddButton'

export const dynamic = 'force-dynamic'

async function getSubscriptions() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return []
    }
    // Query DB directly to avoid server-side fetch URL issues
    const subs = await prisma.subscription.findMany({
      where: { user: { id: user.id } },
      orderBy: { createdAt: 'desc' },
    })
    return subs
  } catch {
    return []
  }
}

// Server action to delete a subscription
export async function deleteSubscription(formData: FormData) {
  'use server'
  const id = String(formData.get('id') || '')
  if (!id) return
  try {
    await prisma.subscription.delete({ where: { id } })
  } catch (e) {
    console.error('Failed to delete subscription', id, e)
  }
  // Revalidate the subscriptions page so UI updates
  revalidatePath('/subscriptions')
}

// Server action to update a subscription
export async function updateSubscription(formData: FormData) {
  'use server'
  const id = String(formData.get('id') || '')
  const name = String(formData.get('name') || '').trim()
  const priceRaw = String(formData.get('price') || '')
  const billingDateRaw = String(formData.get('billingDate') || '').trim()
  const categories = (formData.getAll('categories') || []).map(String)
  const description = String(formData.get('description') || '').trim()

  if (!id) return
  if (!name || !billingDateRaw || !priceRaw) return
  const price = Number(priceRaw)
  if (Number.isNaN(price)) return
  const date = new Date(`${billingDateRaw}T00:00:00`)
  if (isNaN(date.getTime())) return

  try {
    await prisma.subscription.update({
      where: { id },
      data: {
        name,
        price,
        billingDate: date,
        categories: Array.isArray(categories) ? categories.map(String) : [],
        description: description ? description : null,
      },
    })
  } catch (e) {
    console.error('Failed to update subscription', id, e)
  }
  revalidatePath('/subscriptions')
}

function toInputDateString(d: Date | string) {
  const date = new Date(d)
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatDisplayDate(d: Date | string) {
  const date = new Date(d)
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export default async function Page() {
  const subscriptions: Array<{
    id: string
    name: string
    price: number
    billingDate: Date | string
    categories: string[]
    description?: string | null
  }> = await getSubscriptions()

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Subscriptions</h1>

        {subscriptions.length === 0 ? (
          <p className="text-gray-600">You have no active subscriptions.</p>
        ) : (
          <ul className="space-y-4">
            {subscriptions.map((s) => (
              <li key={s.id} className="border rounded-md bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.name}</p>
                    <p className="text-sm text-gray-600">Billing date: {formatDisplayDate(s.billingDate)}</p>
                    {s.categories?.length ? (
                      <p className="text-xs text-gray-500 mt-1">{s.categories.join(', ')}</p>
                    ) : null}
                    {s.description ? (
                      <p className="text-sm text-gray-700 mt-2">{s.description}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <span className="text-emerald-700 font-semibold">${s.price.toFixed(2)}</span>

                    {/* Edit toggle (CSS-only peer) */}
                    <div className="relative">
                      <input id={`edit-${s.id}`} type="checkbox" className="peer hidden" />
                      <label htmlFor={`edit-${s.id}`} aria-label={`Edit ${s.name}`} className="cursor-pointer text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50">
                        {/* Pencil icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712Z" />
                          <path d="M3.5 14.25V18h3.75l9.72-9.72-3.75-3.75L3.5 14.25Z" />
                        </svg>
                      </label>

                      {/* Edit panel */}
                      <div className="hidden peer-checked:block absolute right-0 top-7 z-40 w-80 bg-white border rounded-md shadow-lg p-4">
                        <form action={updateSubscription} className="space-y-3">
                          <input type="hidden" name="id" value={s.id} />
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Name</label>
                            <input name="name" defaultValue={s.name} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm" />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Price</label>
                              <input name="price" type="number" step="0.01" defaultValue={s.price} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Billing Date</label>
                              <input name="billingDate" type="date" defaultValue={toInputDateString(s.billingDate)} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Categories</label>
                            <select name="categories" multiple defaultValue={s.categories} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm">
                              <option value="entertainment">Entertainment</option>
                              <option value="productivity">Productivity</option>
                              <option value="education">Education</option>
                              <option value="health">Health</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Description</label>
                            <textarea name="description" defaultValue={s.description ?? ''} className="mt-1 w-full border border-gray-300 rounded-md p-2 text-sm" />
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-1">
                            <label htmlFor={`edit-${s.id}`} className="px-3 py-1.5 text-sm rounded border">Cancel</label>
                            <button type="submit" className="px-3 py-1.5 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700">Save</button>
                          </div>
                        </form>
                      </div>
                    </div>

                    <form action={deleteSubscription}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        aria-label={`Delete ${s.name}`}
                        className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      >
                        {/* Trash icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                          <path fillRule="evenodd" d="M9 3.75A2.25 2.25 0 0 1 11.25 1.5h1.5A2.25 2.25 0 0 1 15 3.75V4.5h3.75a.75.75 0 0 1 0 1.5h-.508l-1.09 13.08A3.75 3.75 0 0 1 13.41 22.5H10.59a3.75 3.75 0 0 1-3.742-3.42L5.757 6H5.25a.75.75 0 0 1 0-1.5H9V3.75Zm1.5.75h3V3.75a.75.75 0 0 0-.75-.75h-1.5a.75.75 0 0 0-.75.75V4.5Zm-.747 4.5a.75.75 0 1 0-1.5.06l.56 9a.75.75 0 0 0 1.498-.093l-.558-8.967Zm6.494.06a.75.75 0 1 0-1.498-.06l-.559 8.966a.75.75 0 1 0 1.498.093l.559-8.999Z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddButton />
    </div>
  )
}