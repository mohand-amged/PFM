'use client';

import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'destructive' | 'warning' | 'default';
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
  disabled?: boolean;
  loading?: boolean;
}

export function ConfirmDialog({
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'destructive',
  onConfirm,
  children,
  disabled = false,
  loading = false,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      setOpen(false);
    } catch (error) {
      console.error('Confirm action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'destructive':
        return 'text-red-600 hover:bg-red-50';
      case 'warning':
        return 'text-yellow-600 hover:bg-yellow-50';
      default:
        return '';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'destructive':
        return <Trash2 className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled || loading}
            className={cn('p-2', getVariantStyles())}
          >
            {getIcon()}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              variant === 'destructive' ? 'bg-red-100' : 'bg-yellow-100'
            )}>
              {getIcon()}
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <AlertDialogCancel disabled={isLoading}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'w-full sm:w-auto',
              variant === 'destructive' && 'bg-red-600 hover:bg-red-700 focus:ring-red-600'
            )}
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
            )}
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Specialized delete confirmation dialog
interface DeleteConfirmDialogProps extends Omit<ConfirmDialogProps, 'variant' | 'title'> {
  itemName?: string;
  itemType?: string;
}

export function DeleteConfirmDialog({
  itemName = 'this item',
  itemType = 'entry',
  description,
  onConfirm,
  children,
  ...props
}: DeleteConfirmDialogProps) {
  return (
    <ConfirmDialog
      title={`Delete ${itemType}?`}
      description={
        description || 
        `Are you sure you want to delete "${itemName}"? This action cannot be undone and will remove this ${itemType} from your records.`
      }
      variant="destructive"
      confirmText="Delete"
      onConfirm={onConfirm}
      {...props}
    >
      {children}
    </ConfirmDialog>
  );
}
