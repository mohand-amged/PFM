'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createOrUpdateBudget } from '@/app/actions/budgets';

interface BudgetFormProps {
  initialData?: {
    id?: string;
    category: string;
    monthlyLimit: number;
    currency: string;
    alertThreshold: number;
    enableAlerts: boolean;
    month: number;
    year: number;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const COMMON_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Bills & Utilities',
  'Travel',
  'Education',
  'Investment',
  'Other'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'];

export default function BudgetForm({ initialData, onSuccess, onCancel }: BudgetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customCategory, setCustomCategory] = useState(
    initialData?.category && !COMMON_CATEGORIES.includes(initialData.category)
  );

  const currentDate = new Date();
  const [formData, setFormData] = useState({
    category: initialData?.category || '',
    monthlyLimit: initialData?.monthlyLimit || 0,
    currency: initialData?.currency || 'USD',
    alertThreshold: initialData?.alertThreshold || 80,
    enableAlerts: initialData?.enableAlerts ?? true,
    month: initialData?.month || currentDate.getMonth() + 1,
    year: initialData?.year || currentDate.getFullYear(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || formData.monthlyLimit <= 0) {
      alert('Please provide a valid category and monthly limit');
      return;
    }

    setIsSubmitting(true);
    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, String(value));
      });

      await createOrUpdateBudget(formDataObj);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Failed to save budget. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    if (value === 'custom') {
      setCustomCategory(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setCustomCategory(false);
      setFormData(prev => ({ ...prev, category: value }));
    }
  };

  const generateMonthOptions = () => {
    const months = [];
    for (let i = 1; i <= 12; i++) {
      const date = new Date(2024, i - 1, 1);
      months.push({
        value: i,
        label: date.toLocaleDateString('en-US', { month: 'long' })
      });
    }
    return months;
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 1; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>
          {initialData ? 'Edit Budget' : 'Create New Budget'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            {!customCategory ? (
              <Select
                value={formData.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {COMMON_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Category...</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                <Input
                  id="category"
                  placeholder="Enter custom category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCustomCategory(false);
                    setFormData(prev => ({ ...prev, category: '' }));
                  }}
                >
                  Choose from preset categories
                </Button>
              </div>
            )}
          </div>

          {/* Monthly Limit */}
          <div className="space-y-2">
            <Label htmlFor="monthlyLimit">Monthly Limit</Label>
            <div className="flex gap-2">
              <Select
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="monthlyLimit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.monthlyLimit || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  monthlyLimit: parseFloat(e.target.value) || 0 
                }))}
                required
                className="flex-1"
              />
            </div>
          </div>

          {/* Month and Year */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select
                value={String(formData.month)}
                onValueChange={(value) => setFormData(prev => ({ ...prev, month: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateMonthOptions().map(month => (
                    <SelectItem key={month.value} value={String(month.value)}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Select
                value={String(formData.year)}
                onValueChange={(value) => setFormData(prev => ({ ...prev, year: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {generateYearOptions().map(year => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Alert Settings */}
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="enableAlerts">Enable Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications when approaching budget limit
                </p>
              </div>
              <Switch
                id="enableAlerts"
                checked={formData.enableAlerts}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enableAlerts: checked }))}
              />
            </div>
            
            {formData.enableAlerts && (
              <div className="space-y-2">
                <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
                <Input
                  id="alertThreshold"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    alertThreshold: parseInt(e.target.value) || 80 
                  }))}
                />
                <p className="text-xs text-muted-foreground">
                  You&apos;ll receive an alert when you&apos;ve spent {formData.alertThreshold}% of your budget
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Budget' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
