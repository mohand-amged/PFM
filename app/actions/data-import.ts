'use server';

import db from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import * as XLSX from 'xlsx';

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  skipped: number;
}

export interface ImportRow {
  Type?: string;
  Name: string;
  Amount: number;
  Currency?: string;
  Date: string;
  Category?: string;
  Description?: string;
  // Budget specific
  'Monthly Limit'?: number;
  'Alert Threshold (%)'?: number;
  'Alerts Enabled'?: string;
  Month?: number;
  Year?: number;
  // Subscription specific
  Price?: number;
  'Billing Date'?: string;
  Categories?: string;
  // Saving specific
  'Target Amount'?: number;
  Status?: string;
}

export async function importFromCSV(csvContent: string, dataType: 'expenses' | 'budgets' | 'subscriptions' | 'savings' = 'expenses'): Promise<ImportResult> {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const result: ImportResult = {
    success: true,
    imported: 0,
    errors: [],
    skipped: 0,
  };

  try {
    // Parse CSV content
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      return { ...result, success: false, errors: ['CSV file must contain headers and at least one data row'] };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const rows: ImportRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          row[header] = values[index];
        }
      });
      
      rows.push(row);
    }

    // Process rows based on data type
    for (const row of rows) {
      try {
        if (dataType === 'expenses' || (!dataType && row.Type === 'Expense')) {
          await importExpense(user.id, row);
          result.imported++;
        } else if (dataType === 'budgets' || (!dataType && row.Type === 'Budget')) {
          await importBudget(user.id, row);
          result.imported++;
        } else if (dataType === 'subscriptions' || (!dataType && row.Type === 'Subscription')) {
          await importSubscription(user.id, row);
          result.imported++;
        } else if (dataType === 'savings' || (!dataType && row.Type === 'Saving')) {
          await importSaving(user.id, row);
          result.imported++;
        } else {
          result.skipped++;
        }
      } catch (error) {
        result.errors.push(`Row ${result.imported + result.errors.length + result.skipped + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (result.imported > 0) {
      revalidatePath('/expenses');
      revalidatePath('/budgets');
      revalidatePath('/subscriptions');
      revalidatePath('/savings');
      revalidatePath('/dashboard');
    }

    return result;
  } catch (error) {
    console.error('Error importing CSV:', error);
    return { ...result, success: false, errors: [error instanceof Error ? error.message : 'Failed to parse CSV'] };
  }
}

export async function importFromExcel(buffer: Buffer, sheetName?: string, dataType: 'expenses' | 'budgets' | 'subscriptions' | 'savings' = 'expenses'): Promise<ImportResult> {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const result: ImportResult = {
    success: true,
    imported: 0,
    errors: [],
    skipped: 0,
  };

  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const worksheetName = sheetName || workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    
    if (!worksheet) {
      return { ...result, success: false, errors: ['Worksheet not found'] };
    }

    const rows: ImportRow[] = XLSX.utils.sheet_to_json(worksheet);

    if (rows.length === 0) {
      return { ...result, success: false, errors: ['No data found in worksheet'] };
    }

    // Process rows
    for (const row of rows) {
      try {
        if (dataType === 'expenses') {
          await importExpense(user.id, row);
          result.imported++;
        } else if (dataType === 'budgets') {
          await importBudget(user.id, row);
          result.imported++;
        } else if (dataType === 'subscriptions') {
          await importSubscription(user.id, row);
          result.imported++;
        } else if (dataType === 'savings') {
          await importSaving(user.id, row);
          result.imported++;
        }
      } catch (error) {
        result.errors.push(`Row ${result.imported + result.errors.length + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (result.imported > 0) {
      revalidatePath('/expenses');
      revalidatePath('/budgets');
      revalidatePath('/subscriptions');
      revalidatePath('/savings');
      revalidatePath('/dashboard');
    }

    return result;
  } catch (error) {
    console.error('Error importing Excel:', error);
    return { ...result, success: false, errors: [error instanceof Error ? error.message : 'Failed to parse Excel file'] };
  }
}

async function importExpense(userId: string, row: ImportRow) {
  if (!row.Name || !row.Amount) {
    throw new Error('Name and Amount are required for expenses');
  }

  const amount = parseFloat(String(row.Amount));
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Amount must be a valid positive number');
  }

  const date = row.Date ? new Date(row.Date) : new Date();
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  await db.expense.create({
    data: {
      name: row.Name,
      amount,
      currency: row.Currency || 'USD',
      date,
      category: row.Category || null,
      description: row.Description || null,
      userId,
    },
  });
}

async function importBudget(userId: string, row: ImportRow) {
  const monthlyLimit = parseFloat(String(row['Monthly Limit'] || row.Amount || 0));
  if (isNaN(monthlyLimit) || monthlyLimit <= 0) {
    throw new Error('Monthly Limit must be a valid positive number');
  }

  if (!row.Category && !row.Name) {
    throw new Error('Category is required for budgets');
  }

  const category = row.Category || row.Name || '';
  const alertThreshold = parseFloat(String(row['Alert Threshold (%)'] || '80'));
  const enableAlerts = row['Alerts Enabled'] !== 'No' && row['Alerts Enabled'] !== 'false';
  
  // Extract month/year from date if provided
  let month = row.Month || new Date().getMonth() + 1;
  let year = row.Year || new Date().getFullYear();
  
  if (row.Date) {
    const date = new Date(row.Date);
    if (!isNaN(date.getTime())) {
      month = date.getMonth() + 1;
      year = date.getFullYear();
    }
  }

  // Check if budget already exists
  const existingBudget = await db.budget.findFirst({
    where: {
      userId,
      category,
      month: Number(month),
      year: Number(year),
    },
  });

  if (existingBudget) {
    // Update existing budget
    await db.budget.update({
      where: { id: existingBudget.id },
      data: {
        monthlyLimit,
        currency: row.Currency || 'USD',
        alertThreshold: isNaN(alertThreshold) ? 80 : alertThreshold,
        enableAlerts,
        isActive: true,
      },
    });
  } else {
    // Create new budget
    await db.budget.create({
      data: {
        category,
        monthlyLimit,
        currency: row.Currency || 'USD',
        alertThreshold: isNaN(alertThreshold) ? 80 : alertThreshold,
        enableAlerts,
        month: Number(month),
        year: Number(year),
        userId,
      },
    });
  }
}

async function importSubscription(userId: string, row: ImportRow) {
  if (!row.Name) {
    throw new Error('Name is required for subscriptions');
  }

  const price = parseFloat(String(row.Price || row.Amount || 0));
  if (isNaN(price) || price <= 0) {
    throw new Error('Price must be a valid positive number');
  }

  const billingDate = row['Billing Date'] || row.Date ? new Date(row['Billing Date'] || row.Date!) : new Date();
  if (isNaN(billingDate.getTime())) {
    throw new Error('Invalid billing date format');
  }

  const categories = row.Categories || row.Category ? (row.Categories || row.Category)!.split(',').map(c => c.trim()) : [];

  await db.subscription.create({
    data: {
      name: row.Name,
      price,
      billingDate,
      categories,
      description: row.Description || null,
      userId,
    },
  });
}

async function importSaving(userId: string, row: ImportRow) {
  if (!row.Name || !row.Amount) {
    throw new Error('Name and Amount are required for savings');
  }

  const amount = parseFloat(String(row.Amount));
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Amount must be a valid positive number');
  }

  const date = row.Date ? new Date(row.Date) : new Date();
  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  const targetAmount = row['Target Amount'] ? parseFloat(String(row['Target Amount'])) : null;
  const isCompleted = row.Status?.toLowerCase() === 'completed';

  await db.saving.create({
    data: {
      name: row.Name,
      amount,
      currency: row.Currency || 'USD',
      date,
      targetAmount: targetAmount && !isNaN(targetAmount) ? targetAmount : null,
      category: row.Category || null,
      description: row.Description || null,
      isCompleted,
      isActive: !isCompleted,
      userId,
    },
  });
}
