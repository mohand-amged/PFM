import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createSubscription } from '@/app/actions/subscription';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function NewSubscriptionPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/subscriptions">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Subscriptions
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Subscription</h1>
        <p className="text-gray-600 mt-2">Track a new recurring subscription or service</p>
      </div>

      <Card className="p-6">
        <form action={createSubscription} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              Subscription Name *
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g., Netflix, Spotify, Adobe Creative Cloud"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-sm font-medium text-gray-700">
                Monthly Price *
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="billingDate" className="text-sm font-medium text-gray-700">
                Next Billing Date *
              </Label>
              <Input
                id="billingDate"
                name="billingDate"
                type="date"
                required
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="categories" className="text-sm font-medium text-gray-700">
              Categories
            </Label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                'Entertainment',
                'Music',
                'Video Streaming',
                'Software',
                'Cloud Storage',
                'News & Media',
                'Fitness',
                'Gaming',
                'Productivity',
                'Education',
                'Finance',
                'Other'
              ].map((category) => (
                <label key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    name="categories"
                    value={category}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select all categories that apply to this subscription
            </p>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Optional notes about this subscription..."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <Button type="submit" className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Subscription
            </Button>
            <Button variant="outline" asChild>
              <Link href="/subscriptions">
                Cancel
              </Link>
            </Button>
          </div>
        </form>
      </Card>

      {/* Tips Card */}
      <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">💡 Tips for tracking subscriptions</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Check your bank/credit card statements to find all recurring charges</li>
          <li>• Set billing dates a day early to get reminded in advance</li>
          <li>• Use specific names (e.g., "Netflix Premium" instead of just "Netflix")</li>
          <li>• Add notes about features or why you subscribed in the description</li>
        </ul>
      </Card>
    </div>
  );
}
