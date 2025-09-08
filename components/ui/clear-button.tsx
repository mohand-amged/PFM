'use client';

import React, { useState } from 'react';
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
import { 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle 
} from 'lucide-react';

interface ClearButtonProps {
  pageType: 'expenses' | 'subscriptions' | 'savings' | 'wallet' | 'income' | 'profile' | 'notifications';
  onClear?: () => Promise<void> | void;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'touch' | 'touch-sm';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const PAGE_CONFIG = {
  expenses: {
    title: 'Clear All Expenses',
    description: 'This will permanently delete all your expense records and transaction history.',
    items: ['All expense entries', 'Transaction history', 'Category data', 'Spending patterns'],
    warning: 'Your wallet balance will not be affected.',
    buttonText: 'Clear Expenses',
    color: 'red',
  },
  subscriptions: {
    title: 'Clear All Subscriptions',
    description: 'This will permanently delete all your subscription tracking data.',
    items: ['All subscription services', 'Renewal dates', 'Cost tracking', 'Subscription history'],
    warning: 'You will need to re-add all your subscriptions manually.',
    buttonText: 'Clear Subscriptions',
    color: 'red',
  },
  savings: {
    title: 'Clear All Savings',
    description: 'This will permanently delete all your savings goals and progress.',
    items: ['All savings goals', 'Progress tracking', 'Target amounts', 'Savings history'],
    warning: 'Your actual money is safe - only the tracking data will be removed.',
    buttonText: 'Clear Savings',
    color: 'red',
  },
  wallet: {
    title: 'Reset Wallet Data',
    description: 'This will clear your wallet transaction history but keep your current balance.',
    items: ['Income history', 'Transaction records', 'Financial statistics', 'Budget history'],
    warning: 'Your current balance and currency settings will be preserved.',
    buttonText: 'Clear Wallet History',
    color: 'orange',
  },
  income: {
    title: 'Clear Income History',
    description: 'This will permanently delete all your income records and sources.',
    items: ['All income entries', 'Income sources', 'Salary records', 'Earning history'],
    warning: 'Your wallet balance may be affected if entries are linked.',
    buttonText: 'Clear Income',
    color: 'red',
  },
  profile: {
    title: 'Reset Profile Data',
    description: 'This will reset your profile information to defaults.',
    items: ['Profile preferences', 'Display settings', 'Personal information', 'Account preferences'],
    warning: 'Your login credentials and account will remain intact.',
    buttonText: 'Reset Profile',
    color: 'orange',
  },
  notifications: {
    title: 'Clear Notifications',
    description: 'This will remove all your current notifications and alerts.',
    items: ['Current notifications', 'Alert history', 'Reminder messages', 'System notifications'],
    warning: 'New notifications will continue to appear normally.',
    buttonText: 'Clear Notifications',
    color: 'blue',
  },
};

export default function ClearButton({ 
  pageType, 
  onClear, 
  className = '', 
  size = 'sm',
  variant = 'outline' 
}: ClearButtonProps) {
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const config = PAGE_CONFIG[pageType];
  const isDestructive = config.color === 'red';

  const handleClear = async () => {
    setIsClearing(true);
    setMessage(null);

    try {
      if (onClear) {
        await onClear();
        setMessage({ 
          type: 'success', 
          text: `${config.buttonText.replace('Clear ', '').replace('Reset ', '')} cleared successfully!` 
        });
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => {
          setMessage(null);
        }, 3000);
      } else {
        // Default behavior - refresh the page
        window.location.reload();
      }
    } catch (error) {
      console.error(`Error clearing ${pageType}:`, error);
      setMessage({ 
        type: 'error', 
        text: `Failed to clear ${pageType}. Please try again.` 
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="relative">
      {message && (
        <div className={`absolute -top-12 right-0 z-10 p-2 rounded-lg flex items-center gap-2 text-sm ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        } shadow-lg`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant={isDestructive ? 'destructive' : variant}
            size={size}
            className={`${className} ${isDestructive ? '' : 'hover:bg-red-50 hover:text-red-700 hover:border-red-300'}`}
            disabled={isClearing}
          >
            {isClearing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {config.buttonText}
          </Button>
        </AlertDialogTrigger>
        
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className={`w-5 h-5 mr-2 ${
                config.color === 'red' ? 'text-red-600' : 
                config.color === 'orange' ? 'text-orange-600' : 'text-blue-600'
              }`} />
              {config.title}?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>{config.description}</p>
              
              <div>
                <p className="font-medium mb-2">This will permanently remove:</p>
                <ul className="list-disc list-inside text-sm space-y-1 ml-2">
                  {config.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className={`p-3 rounded-lg border ${
                config.color === 'red' ? 'bg-red-50 border-red-200 text-red-800' :
                config.color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <p className="text-sm font-medium flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  {config.warning}
                </p>
              </div>

              <p className="text-sm font-medium text-red-700">
                This action cannot be undone. Are you sure you want to continue?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClear}
              disabled={isClearing}
              className={
                config.color === 'red' ? 'bg-red-600 hover:bg-red-700' :
                config.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' :
                'bg-blue-600 hover:bg-blue-700'
              }
            >
              {isClearing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Yes, {config.buttonText}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
