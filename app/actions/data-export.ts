'use server';

import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import * as XLSX from 'xlsx';

export interface ExportOptions {
  startDate?: Date;
  endDate?: Date;
  categories?: string[];
  includeExpenses?: boolean;
  includeBudgets?: boolean;
  includeSubscriptions?: boolean;
  includeSavings?: boolean;
}

export async function exportToCSV(options: ExportOptions = {}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const data: any[] = [];
    
    if (options.includeExpenses !== false) {
      const expenses = await db.expense.findMany({
        where: {
          userId: user.id,
          ...(options.startDate && options.endDate && {
            date: {
              gte: options.startDate,
              lte: options.endDate,
            },
          }),
          ...(options.categories?.length && {
            category: {
              in: options.categories,
            },
          }),
        },
        orderBy: { date: 'desc' },
      });

      expenses.forEach(expense => {
        data.push({
          Type: 'Expense',
          Name: expense.name,
          Amount: expense.amount,
          Currency: expense.currency,
          Date: expense.date.toISOString().split('T')[0],
          Category: expense.category || 'Other',
          Description: expense.description || '',
        });
      });
    }

    if (options.includeSubscriptions !== false) {
      const subscriptions = await db.subscription.findMany({
        where: { userId: user.id },
        orderBy: { billingDate: 'desc' },
      });

      subscriptions.forEach(subscription => {
        data.push({
          Type: 'Subscription',
          Name: subscription.name,
          Amount: subscription.price,
          Currency: 'USD', // Subscriptions don't have currency field in schema
          Date: subscription.billingDate.toISOString().split('T')[0],
          Category: subscription.categories.join(', '),
          Description: subscription.description || '',
        });
      });
    }

    if (options.includeBudgets !== false) {
      const budgets = await db.budget.findMany({
        where: { 
          userId: user.id,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      budgets.forEach(budget => {
        data.push({
          Type: 'Budget',
          Name: `${budget.category} Budget`,
          Amount: budget.monthlyLimit,
          Currency: budget.currency,
          Date: `${budget.year}-${budget.month.toString().padStart(2, '0')}-01`,
          Category: budget.category,
          Description: `Alert at ${budget.alertThreshold}%, Alerts ${budget.enableAlerts ? 'enabled' : 'disabled'}`,
        });
      });
    }

    if (options.includeSavings !== false) {
      const savings = await db.saving.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
      });

      savings.forEach(saving => {
        data.push({
          Type: 'Saving',
          Name: saving.name,
          Amount: saving.amount,
          Currency: saving.currency,
          Date: saving.date.toISOString().split('T')[0],
          Category: saving.category || 'Savings',
          Description: `${saving.description || ''} ${saving.targetAmount ? `Target: ${saving.targetAmount}` : ''}`.trim(),
        });
      });
    }

    // Convert to CSV format
    if (data.length === 0) {
      return { success: false, error: 'No data to export' };
    }

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV
          return typeof value === 'string' && (value.includes(',') || value.includes('"')) 
            ? `"${value.replace(/"/g, '""')}"` 
            : value;
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    
    return { 
      success: true, 
      data: csvContent,
      filename: `financial-data-${new Date().toISOString().split('T')[0]}.csv`,
      mimeType: 'text/csv'
    };
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    return { success: false, error: 'Failed to export data' };
  }
}

export async function exportToExcel(options: ExportOptions = {}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    const workbook = XLSX.utils.book_new();

    if (options.includeExpenses !== false) {
      const expenses = await db.expense.findMany({
        where: {
          userId: user.id,
          ...(options.startDate && options.endDate && {
            date: {
              gte: options.startDate,
              lte: options.endDate,
            },
          }),
          ...(options.categories?.length && {
            category: {
              in: options.categories,
            },
          }),
        },
        orderBy: { date: 'desc' },
      });

      const expenseData = expenses.map(expense => ({
        Name: expense.name,
        Amount: expense.amount,
        Currency: expense.currency,
        Date: expense.date.toISOString().split('T')[0],
        Category: expense.category || 'Other',
        Description: expense.description || '',
      }));

      const expenseWorksheet = XLSX.utils.json_to_sheet(expenseData);
      XLSX.utils.book_append_sheet(workbook, expenseWorksheet, 'Expenses');
    }

    if (options.includeSubscriptions !== false) {
      const subscriptions = await db.subscription.findMany({
        where: { userId: user.id },
        orderBy: { billingDate: 'desc' },
      });

      const subscriptionData = subscriptions.map(subscription => ({
        Name: subscription.name,
        Price: subscription.price,
        'Billing Date': subscription.billingDate.toISOString().split('T')[0],
        Categories: subscription.categories.join(', '),
        Description: subscription.description || '',
      }));

      const subscriptionWorksheet = XLSX.utils.json_to_sheet(subscriptionData);
      XLSX.utils.book_append_sheet(workbook, subscriptionWorksheet, 'Subscriptions');
    }

    if (options.includeBudgets !== false) {
      const budgets = await db.budget.findMany({
        where: { 
          userId: user.id,
          isActive: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      const budgetData = budgets.map(budget => ({
        Category: budget.category,
        'Monthly Limit': budget.monthlyLimit,
        Currency: budget.currency,
        'Alert Threshold (%)': budget.alertThreshold,
        'Alerts Enabled': budget.enableAlerts ? 'Yes' : 'No',
        Month: budget.month,
        Year: budget.year,
      }));

      const budgetWorksheet = XLSX.utils.json_to_sheet(budgetData);
      XLSX.utils.book_append_sheet(workbook, budgetWorksheet, 'Budgets');
    }

    if (options.includeSavings !== false) {
      const savings = await db.saving.findMany({
        where: { userId: user.id },
        orderBy: { date: 'desc' },
      });

      const savingData = savings.map(saving => ({
        Name: saving.name,
        Amount: saving.amount,
        Currency: saving.currency,
        Date: saving.date.toISOString().split('T')[0],
        Category: saving.category || 'Savings',
        'Target Amount': saving.targetAmount || '',
        Description: saving.description || '',
        Status: saving.isCompleted ? 'Completed' : 'Active',
      }));

      const savingWorksheet = XLSX.utils.json_to_sheet(savingData);
      XLSX.utils.book_append_sheet(workbook, savingWorksheet, 'Savings');
    }

    // Convert workbook to buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    
    return { 
      success: true, 
      data: excelBuffer,
      filename: `financial-data-${new Date().toISOString().split('T')[0]}.xlsx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, error: 'Failed to export data' };
  }
}

export async function generatePDFReport(options: ExportOptions = {}) {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  try {
    // This would require jsPDF and jspdf-autotable on client side
    // For now, we'll return the data structure that can be used by client-side PDF generation
    
    const report: any = {
      title: 'Financial Report',
      generatedDate: new Date().toISOString().split('T')[0],
      user: user.email,
      sections: []
    };

    if (options.includeExpenses !== false) {
      const expenses = await db.expense.findMany({
        where: {
          userId: user.id,
          ...(options.startDate && options.endDate && {
            date: {
              gte: options.startDate,
              lte: options.endDate,
            },
          }),
        },
        orderBy: { date: 'desc' },
      });

      const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const categoryTotals = expenses.reduce((acc, expense) => {
        const category = expense.category || 'Other';
        acc[category] = (acc[category] || 0) + expense.amount;
        return acc;
      }, {} as Record<string, number>);

      report.sections.push({
        title: 'Expenses Summary',
        type: 'expenses',
        total: totalExpenses,
        count: expenses.length,
        categoryBreakdown: categoryTotals,
        data: expenses.slice(0, 20).map(expense => ({
          name: expense.name,
          amount: expense.amount,
          date: expense.date.toISOString().split('T')[0],
          category: expense.category || 'Other',
        }))
      });
    }

    if (options.includeBudgets !== false) {
      const budgets = await db.budget.findMany({
        where: { 
          userId: user.id,
          isActive: true,
        },
        orderBy: { category: 'asc' },
      });

      const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthlyLimit, 0);

      report.sections.push({
        title: 'Budget Overview',
        type: 'budgets',
        total: totalBudget,
        count: budgets.length,
        data: budgets.map(budget => ({
          category: budget.category,
          limit: budget.monthlyLimit,
          month: budget.month,
          year: budget.year,
        }))
      });
    }

    return { 
      success: true, 
      data: report,
      filename: `financial-report-${new Date().toISOString().split('T')[0]}.pdf`
    };
  } catch (error) {
    console.error('Error generating PDF report:', error);
    return { success: false, error: 'Failed to generate report' };
  }
}
