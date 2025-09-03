import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your application preferences</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-500">Coming soon - configure when to receive email reminders about upcoming subscription renewals.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Privacy Settings</h3>
              <p className="text-sm text-gray-500">Coming soon - manage your data privacy preferences.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Subscription Settings</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Default Currency</h3>
              <p className="text-sm text-gray-500">Currently: USD</p>
              <p className="text-sm text-gray-500">Coming soon - support for multiple currencies.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900">Renewal Reminders</h3>
              <p className="text-sm text-gray-500">Coming soon - customize when to get notified about upcoming renewals.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Data Management</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900">Export Data</h3>
              <p className="text-sm text-gray-500">Coming soon - export your subscription data to CSV or JSON.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 text-red-600">Danger Zone</h3>
              <p className="text-sm text-gray-500">Coming soon - account deletion and data removal options.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
