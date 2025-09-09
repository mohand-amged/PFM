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
import { clearAllUserData, deleteUserAccount } from '@/app/actions/settings';
import { 
  Trash2, 
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
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);


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
      setMessage({ type: 'success', text: 'Account deleted successfully. Redirecting...' });
      
      // Clear any local storage/session data
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
        
        // Also call logout API to ensure complete session cleanup
        try {
          await fetch('/api/auth/logout', { method: 'POST' });
        } catch (logoutError) {
          console.error('Error during logout cleanup:', logoutError);
          // Don't fail the whole operation for this
        }
      }
      
      // The server action handles redirect, but add fallback
      setTimeout(() => {
        window.location.href = '/signup';
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to delete account. Please try again.';
      setMessage({ type: 'error', text: errorMessage });
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

        {/* Clear All Data */}
        <div className="border-2 border-orange-200 dark:border-orange-800/70 rounded-xl p-5 bg-gradient-to-r from-orange-50/80 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/20 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-orange-900 dark:text-orange-100 flex items-center text-base">
                <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/50 rounded-lg flex items-center justify-center mr-3">
                  <RefreshCw className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                Clear All Data
              </h4>
              <p className="text-sm text-orange-700/80 dark:text-orange-200/80 mt-2 leading-relaxed">
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
                  className="sm:flex-shrink-0 w-full sm:w-auto border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:text-orange-400 dark:hover:bg-orange-900/30 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
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
        <div className="border-2 border-red-200 dark:border-red-800/70 rounded-xl p-5 bg-gradient-to-r from-red-50/80 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-red-900 dark:text-red-100 flex items-center text-base">
                <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center mr-3">
                  <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                Delete Account Permanently
              </h4>
              <p className="text-sm text-red-700/80 dark:text-red-200/80 mt-2 leading-relaxed">
                Permanently delete your account and all associated data. This action cannot be undone.
                You will lose access to all your subscriptions, financial data, and settings.
              </p>
              <div className="mt-3 p-3 bg-red-100/60 dark:bg-red-900/30 rounded-lg border border-red-200/50 dark:border-red-800/50">
                <p className="text-xs text-red-800 dark:text-red-200 flex items-start">
                  <AlertTriangle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                  <span><strong>Warning:</strong> This will immediately log you out and delete your account forever.</span>
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="sm"
                  disabled={isDeleting}
                  className="sm:flex-shrink-0 w-full sm:w-auto bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center text-red-600">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center mr-3">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    Delete Account Permanently?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-4">
                    <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="font-medium text-red-900 dark:text-red-100">This will permanently delete your account:</p>
                      <p className="text-red-700 dark:text-red-300 font-mono text-sm bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded mt-1">{userEmail}</p>
                    </div>
                    
                    <div>
                      <p className="font-medium text-foreground mb-2">All of the following will be lost forever:</p>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                        <ul className="grid grid-cols-1 gap-1 text-sm text-muted-foreground">
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                            Your account and login access
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                            All subscription tracking data
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                            Complete financial history
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                            Wallet balance and settings
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                            All expenses, income, and savings
                          </li>
                          <li className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                            Personal preferences and settings
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      <Label htmlFor="delete-confirmation" className="text-sm font-semibold text-foreground">
                        To confirm, type <code className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-2 py-1 rounded font-mono text-xs">DELETE MY ACCOUNT</code> below:
                      </Label>
                      <Input
                        id="delete-confirmation"
                        type="text"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="DELETE MY ACCOUNT"
                        className="mt-3 border-red-200 dark:border-red-800 focus:border-red-400 focus:ring-red-200"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <AlertDialogCancel 
                    onClick={() => setDeleteConfirmation('')}
                    className="font-medium"
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirmation !== 'DELETE MY ACCOUNT' || isDeleting}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    {isDeleting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Permanently Deleting...
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
