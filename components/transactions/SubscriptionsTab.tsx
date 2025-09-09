import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Bell } from 'lucide-react';
import Link from 'next/link';

// This will be moved to a server action
const getSubscriptionsPreview = async () => {
  // For now, return empty array to avoid server component issues
  return [];
};

async function SubscriptionsList() {
  const subscriptions = await getSubscriptionsPreview();

  if (subscriptions.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <Bell size={48} className="mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No subscriptions yet</h3>
            <p className="text-muted-foreground">
              Track your recurring subscriptions to avoid surprise charges.
            </p>
          </div>
          <Link href="/subscriptions/new">
            <Button>
              <Plus size={16} />
              Add First Subscription
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Subscriptions</h3>
        <Link href="/subscriptions/new">
          <Button>
            <Plus size={16} />
            Add Subscription
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Bell size={24} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Subscription preview will be loaded from your actual data
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-4">
        <Link href="/subscriptions">
          <Button variant="outline">Manage All Subscriptions</Button>
        </Link>
      </div>
    </div>
  );
}

export default function SubscriptionsTab() {
  return (
    <div className="space-y-6">
      <Suspense fallback={
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      }>
        <SubscriptionsList />
      </Suspense>
    </div>
  );
}
