'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';
import BudgetCard from './BudgetCard';
import BudgetForm from './BudgetForm';
import { getBudgetStatus } from '@/app/actions/budgets';

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

interface CategoryWithoutBudget {
  category: string;
  spent: number;
  hasNoBudget: boolean;
}

export default function BudgetManagement() {
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus[]>([]);
  const [categoriesWithoutBudget, setCategoriesWithoutBudget] = useState<CategoryWithoutBudget[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetStatus | null>(null);

  useEffect(() => {
    loadBudgetData();
  }, [selectedMonth, selectedYear]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadBudgetData = async () => {
    setIsLoading(true);
    try {
      const data = await getBudgetStatus(selectedMonth, selectedYear);
      setBudgetStatus(data.budgetStatus);
      setCategoriesWithoutBudget(data.categoriesWithoutBudget);
      setTotalBudget(data.totalBudget);
      setTotalSpent(data.totalSpent);
    } catch (error) {
      console.error('Error loading budget data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBudgetCreated = () => {
    setShowCreateForm(false);
    setEditingBudget(null);
    loadBudgetData();
  };

  const handleEditBudget = (budget: BudgetStatus) => {
    setEditingBudget(budget);
    setShowCreateForm(true);
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

  const getOverallStatus = () => {
    if (budgetStatus.length === 0) return 'no-data';
    
    const overBudgetCount = budgetStatus.filter(b => b.isOverBudget).length;
    const nearLimitCount = budgetStatus.filter(b => b.isNearLimit && !b.isOverBudget).length;
    
    if (overBudgetCount > 0) return 'over-budget';
    if (nearLimitCount > 0) return 'near-limit';
    return 'on-track';
  };

  const getOverallStatusColor = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'over-budget': return 'bg-red-500';
      case 'near-limit': return 'bg-yellow-500';
      case 'on-track': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getOverallStatusText = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'over-budget': return 'Over Budget';
      case 'near-limit': return 'Near Limits';
      case 'on-track': return 'On Track';
      default: return 'No Data';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls and Overall Status */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Month/Year Selectors */}
          <div className="flex gap-2">
            <Select
              value={String(selectedMonth)}
              onValueChange={(value) => setSelectedMonth(parseInt(value))}
            >
              <SelectTrigger className="w-32">
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
            
            <Select
              value={String(selectedYear)}
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-20">
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

          {/* Overall Status Badge */}
          <Badge 
            variant="secondary" 
            className={`${getOverallStatusColor()} text-white flex items-center gap-1`}
          >
            {getOverallStatus() === 'over-budget' && <TrendingUp size={12} />}
            {getOverallStatus() === 'near-limit' && <AlertTriangle size={12} />}
            {getOverallStatus() === 'on-track' && <TrendingDown size={12} />}
            {getOverallStatusText()}
          </Badge>
        </div>

        {/* Create Budget Button */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? 'Edit Budget' : 'Create New Budget'}
              </DialogTitle>
            </DialogHeader>
            <BudgetForm
              initialData={editingBudget ? {
                id: editingBudget.id,
                category: editingBudget.category,
                monthlyLimit: editingBudget.monthlyLimit,
                currency: editingBudget.currency,
                alertThreshold: editingBudget.alertThreshold,
                enableAlerts: editingBudget.enableAlerts,
                month: editingBudget.month,
                year: editingBudget.year,
              } : undefined}
              onSuccess={handleBudgetCreated}
              onCancel={() => {
                setShowCreateForm(false);
                setEditingBudget(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalBudget.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {budgetStatus.length} active budgets
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSpent.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0}% of total budget
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Remaining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              totalSpent > totalBudget ? 'text-red-600' : 'text-green-600'
            }`}>
              ${Math.abs(totalBudget - totalSpent).toFixed(2)}
              {totalSpent > totalBudget ? ' over' : ' left'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {totalSpent > totalBudget ? 'Over budget' : 'Under budget'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Cards Grid */}
      {budgetStatus.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgetStatus.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEditBudget}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <div className="space-y-4">
            <Calendar size={48} className="mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No budgets found</h3>
              <p className="text-muted-foreground">
                Create your first budget for {new Date(selectedYear, selectedMonth - 1).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })} to start tracking your spending.
              </p>
            </div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus size={16} />
              Create Your First Budget
            </Button>
          </div>
        </Card>
      )}

      {/* Categories Without Budgets */}
      {categoriesWithoutBudget.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={20} className="text-yellow-600" />
              Categories Without Budgets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                These categories have expenses but no budget set for the selected month.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {categoriesWithoutBudget.map((item) => (
                  <div key={item.category} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{item.category}</div>
                      <div className="text-sm text-muted-foreground">
                        ${item.spent.toFixed(2)} spent
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingBudget({
                          id: '',
                          category: item.category,
                          monthlyLimit: item.spent * 1.2, // Suggest 20% more than current spending
                          currency: 'USD',
                          spent: item.spent,
                          remaining: 0,
                          percentageUsed: 0,
                          isOverBudget: false,
                          isNearLimit: false,
                          enableAlerts: true,
                          alertThreshold: 80,
                          month: selectedMonth,
                          year: selectedYear,
                        });
                        setShowCreateForm(true);
                      }}
                    >
                      Set Budget
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
