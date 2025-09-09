import { Suspense } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ExportData from '@/components/data/ExportData';
import ImportData from '@/components/data/ImportData';

export const metadata = {
  title: 'Data Management - Personal Finance Tracker',
  description: 'Export and import your financial data including expenses, budgets, subscriptions, and savings.',
};

export default async function DataManagementPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
          <p className="text-muted-foreground">
            Export your financial data for backup or analysis, or import data from external sources.
          </p>
        </div>

        {/* Export and Import Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Export Section */}
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            <ExportData />
          </Suspense>

          {/* Import Section */}
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          }>
            <ImportData />
          </Suspense>
        </div>

        {/* Information Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="p-6 border rounded-lg bg-blue-50">
            <h3 className="text-lg font-semibold mb-3 text-blue-900">Export Features</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Export to CSV for spreadsheet analysis</li>
              <li>• Generate Excel files with multiple sheets</li>
              <li>• Create PDF reports with charts and summaries</li>
              <li>• Filter by date range and categories</li>
              <li>• Include/exclude specific data types</li>
            </ul>
          </div>

          <div className="p-6 border rounded-lg bg-green-50">
            <h3 className="text-lg font-semibold mb-3 text-green-900">Import Features</h3>
            <ul className="space-y-2 text-sm text-green-800">
              <li>• Import CSV and Excel files</li>
              <li>• Support for expenses, budgets, subscriptions, and savings</li>
              <li>• Automatic data validation and error reporting</li>
              <li>• Bulk import thousands of records</li>
              <li>• Skip duplicates and invalid entries</li>
            </ul>
          </div>
        </div>

        {/* Tips Section */}
        <div className="border rounded-lg p-6 bg-yellow-50">
          <h3 className="text-lg font-semibold mb-3 text-yellow-900">💡 Tips for Best Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2 text-yellow-800">Exporting</h4>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Use date ranges to focus on specific periods</li>
                <li>• Export regularly for backup purposes</li>
                <li>• CSV format works best for data analysis</li>
                <li>• Excel format preserves data organization</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-yellow-800">Importing</h4>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Ensure your file has proper column headers</li>
                <li>• Use consistent date formats (YYYY-MM-DD)</li>
                <li>• Check for required fields before importing</li>
                <li>• Review import results for any errors</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
