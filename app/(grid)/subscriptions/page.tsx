import React from 'react'
import prisma from '@/lib/db'
import { AddButton } from '@/app/components/defaults/AddButton'
import { deleteSubscription, updateSubscription } from '@/app/actions/subscription'

export const dynamic = 'force-dynamic'

async function getSubscriptions() {
  try {
    // Since authentication was removed, return all subscriptions
    const subs = await prisma.subscription.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return subs
  } catch {
    return []
  }
}

function toInputDateString(d: Date | string) {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toISOString().split('T')[0]
}

function formatDisplayDate(d: Date | string) {
  if (!d) return ''
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString()
}

export default async function Page() {
  const subscriptions = await getSubscriptions()
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <AddButton />
      </div>
      
      <div className="grid gap-4">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-lg font-semibold">{sub.name}</h2>
                <p className="text-gray-600">${sub.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500">
                  Next Billing: {formatDisplayDate(sub.billingDate)}
                </p>
                {sub.description && (
                  <p className="mt-2 text-sm">{sub.description}</p>
                )}
                {sub.categories && sub.categories.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {sub.categories.map((cat) => (
                      <span
                        key={cat}
                        className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <form action={updateSubscription}>
                  <input type="hidden" name="id" value={sub.id} />
                  <button
                    type="submit"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                </form>
                <form action={deleteSubscription}>
                  <input type="hidden" name="id" value={sub.id} />
                  <button
                    type="submit"
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
        
        {subscriptions.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No subscriptions yet. Add your first subscription to get started.
          </p>
        )}
      </div>
    </div>
  )
}