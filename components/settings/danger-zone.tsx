'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { clearAllUserData, exportUserData, deleteUserAccount } from '@/app/actions/settings';
import { 
  Trash2, 
  Download, 
  AlertTriangle, 
  RefreshCw,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface DangerZoneProps {
  userEmail: string;
}

export default function DangerZone({ userEmail }: DangerZoneProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleExportData = async () => {
    setIsExporting(true);
    setMessage(null);
    
    try {
      const data = await exportUserData();
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscription-tracker-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      console.error('Error exporting data:', error);
      setMessage({ type: 'error', text: 'Failed to export data. Please try again.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAllData = async () => {
    setIsClearing(true);
    setMessage(null);
    
    try {
      await clearAllUserData();
      setMessage({ type: 'success', text: 'All data cleared successfully!' });
      // The server action will redirect, but show message briefly
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error) {
      console.error('Error clearing data:', error);
      setMessage({ type: 'error', text: 'Failed to clear data. Please try again.' });
      setIsClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
      setMessage({ type: 'error', text: 'Please type exactly "DELETE MY ACCOUNT" to confirm.' });
      return;
    }

    setIsDeleting(true);
    setMessage(null);
    
    try {
      await deleteUserAccount(deleteConfirmation);
      setMessage({ type: 'success', text: 'Account deleted successfully. Goodbye!' });
      // The server action will redirect to signup
      setTimeout(() => {
        window.location.href = '/signup';
      }, 1000);
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ type: 'error', text: 'Failed to delete account. Please try again.' });
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6 border-red-200 dark:border-red-900/50 bg-red-50/30 dark:bg-red-900/10">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-red-600" />
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Danger Zone</h3>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}
      
      <div className="space-y-4">
        {/* Export Data */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground flex items-center">
                <Download className="w-4 h-4 mr-2 text-blue-600" />
                Export Your Data
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Download all your subscription, financial, and personal data as a JSON file.
                This includes your wallet, expenses, income, savings, and subscriptions.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportData}
              disabled={isExporting}
              className="sm:flex-shrink-0 w-full sm:w-auto"
            >
              {isExporting ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>
        </div>

        {/* Clear All Data */}
        <div className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50/30 dark:bg-orange-900/10">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 text-orange-600" />
                Clear All Data
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Remove all your financial data, subscriptions, and reset your wallet.
                Your account will remain active but all data will be lost permanently.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isClearing}
                  className="sm:flex-shrink-0 w-full sm:w-auto border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-400"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Clear Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                    Clear All Data?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>This action will permanently delete:</p>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                      <li>All your subscriptions</li>
                      <li>All expenses and income records</li>
                      <li>All savings goals</li>
                      <li>Wallet balance and budget settings</li>
                      <li>All financial data and history</li>
                    </ul>
                    <p className="mt-3 font-medium text-orange-800 dark:text-orange-400">
                      Your account will remain active, but all data will be lost forever.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearAllData}
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={isClearing}
                  >
                    {isClearing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Yes, Clear All Data
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Delete Account */}
        <div className="border border-red-300 dark:border-red-800 rounded-lg p-4 bg-red-50/50 dark:bg-red-900/20">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground flex items-center">
                <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                Delete Account Permanently
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data. This action cannot be undone.
                You will lose access to all your subscriptions, financial data, and settings.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={isDeleting}
                  className="sm:flex-shrink-0 w-full sm:w-auto"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                    Delete Account Permanently?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <p>This will permanently delete your account: <strong>{userEmail}</strong></p>
                    <p>All of the following will be lost forever:</p>
                    <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                      <li>Your account and login access</li>
                      <li>All subscription tracking data</li>
                      <li>Complete financial history</li>
                      <li>Wallet balance and settings</li>
                      <li>All expenses, income, and savings</li>
                      <li>Personal preferences and settings</li>
                    </ul>
                    <div className="mt-4">
                      <Label htmlFor="delete-confirmation" className="text-sm font-medium">
                        Type <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">DELETE MY ACCOUNT</code> to confirm:
                      </Label>
                      <Input
                        id="delete-confirmation"
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="DELETE MY ACCOUNT"
                        className="mt-2"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'DELETE MY ACCOUNT' || isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Yes, Delete My Account
                      </>
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <p className="text-xs text-yellow-800 dark:text-yellow-400 flex items-start">
          <AlertTriangle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Important:</strong> We recommend exporting your data before performing any destructive actions. 
            All operations in this section are permanent and cannot be undone.
          </span>
        </p>
      </div>
    </Card>
  );
}
