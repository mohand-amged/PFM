import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export default async function NewSubscriptionPage() {
  async function createSubscription(formData: FormData) {
    'use server';
    
    const user = await getCurrentUser();
    if (!user) {
      redirect('/login');
    }

    const name = formData.get('name') as string;
    const price = parseFloat(formData.get('price') as string);
    const billingDate = formData.get('billingDate') as string;
    const categories = (formData.get('categories') as string).split(',').map(s => s.trim());
    const description = formData.get('description') as string;

    if (!name || isNaN(price) || !billingDate) {
      throw new Error('Missing required fields');
    }

    await prisma.subscription.create({
      data: {
        name,
        price,
        billingDate: new Date(billingDate),
        categories: { set: categories },
        description: description || null,
        user: { connect: { id: user.id } },
      },
    });

    redirect('/subscriptions');
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Add New Subscription</h1>
      
      <form action={createSubscription} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Subscription Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Netflix, Spotify"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Price *
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                min="0"
                required
                className="pl-7 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label htmlFor="billingDate" className="block text-sm font-medium text-gray-700 mb-1">
              Next Billing Date *
            </label>
            <input
              type="date"
              id="billingDate"
              name="billingDate"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
            Categories (comma separated)
          </label>
          <input
            type="text"
            id="categories"
            name="categories"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., Entertainment, Music, Productivity"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any additional details about this subscription"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <a
            href="/subscriptions"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </a>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add Subscription
          </button>
        </div>
      </form>
    </div>
  );
}
