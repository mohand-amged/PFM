'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';
import { deleteBudget } from '@/app/actions/budgets';

interface BudgetStatus {
  id: string;
  category: string;
  monthlyLimit: number;
  currency: string;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  enableAlerts: boolean;
  alertThreshold: number;
  month: number;
  year: number;
}

interface BudgetCardProps {
  budget: BudgetStatus;
  onEdit?: (budget: BudgetStatus) => void;
}

export default function BudgetCard({ budget, onEdit }: BudgetCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the budget for ${budget.category}?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteBudget(budget.id);
      if (!result.success) {
        alert('Failed to delete budget');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget');
    } finally {
      setIsDeleting(false);
    }
  };

  const getProgressColor = () => {
    if (budget.isOverBudget) return 'bg-red-500';
    if (budget.isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusBadge = () => {
    if (budget.isOverBudget) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle size={12} />
          Over Budget
        </Badge>
      );
    }
    if (budget.isNearLimit) {
      return (
        <Badge variant="secondary" className="flex items-center gap-1 bg-yellow-100 text-yellow-800">
          <AlertTriangle size={12} />
          Near Limit
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-green-100 text-green-800">
        On Track
      </Badge>
    );
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${
      budget.isOverBudget ? 'border-red-200 bg-red-50/30' : 
      budget.isNearLimit ? 'border-yellow-200 bg-yellow-50/30' : 
      'border-green-200 bg-green-50/30'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{budget.category}</CardTitle>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit?.(budget)}
                className="h-8 w-8 p-0"
              >
                <Edit2 size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Amount Information */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Spent</div>
            <div className={`text-lg font-semibold ${budget.isOverBudget ? 'text-red-600' : 'text-gray-900'}`}>
              {budget.currency} {budget.spent.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-muted-foreground">Budget</div>
            <div className="text-lg font-semibold text-gray-900">
              {budget.currency} {budget.monthlyLimit.toFixed(2)}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium text-muted-foreground">
              {budget.isOverBudget ? 'Over by' : 'Remaining'}
            </div>
            <div className={`text-lg font-semibold flex items-center justify-center gap-1 ${
              budget.isOverBudget ? 'text-red-600' : 'text-green-600'
            }`}>
              {budget.isOverBudget ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {budget.currency} {Math.abs(budget.remaining).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className={`font-semibold ${
              budget.isOverBudget ? 'text-red-600' : 
              budget.isNearLimit ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {budget.percentageUsed.toFixed(1)}%
            </span>
          </div>
          <div className="relative">
            <Progress 
              value={Math.min(budget.percentageUsed, 100)} 
              className="h-3"
            />
            <div 
              className={`absolute top-0 h-3 rounded-full ${getProgressColor()}`}
              style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
            />
            {budget.percentageUsed > 100 && (
              <div className="absolute top-0 right-0 h-3 w-2 bg-red-600 rounded-r-full" />
            )}
          </div>
          {budget.enableAlerts && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertTriangle size={12} />
              Alert threshold: {budget.alertThreshold}%
            </div>
          )}
        </div>

        {/* Month/Year */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Budget for {new Date(budget.year, budget.month - 1).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </div>
      </CardContent>
    </Card>
  );
}
