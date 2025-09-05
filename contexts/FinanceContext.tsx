'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  description: string;
  targetDate: string;
  category: string;
  createdAt: string;
  progress: number;
}

interface FinanceContextType {
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'progress'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteExpense: (id: string) => void;
  deleteSavingsGoal: (id: string) => void;
  getTotalExpenses: () => number;
  getTotalSavings: () => number;
  getRecentExpenses: (limit?: number) => Expense[];
  getExpensesByCategory: () => { category: string; amount: number; count: number }[];
  getSavingsProgress: () => { totalTarget: number; totalCurrent: number; progress: number };
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

interface FinanceProviderProps {
  children: React.ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem('finance-expenses');
    const savedSavings = localStorage.getItem('finance-savings');

    if (savedExpenses) {
      try {
        setExpenses(JSON.parse(savedExpenses));
      } catch (error) {
        console.error('Error parsing expenses from localStorage:', error);
      }
    }

    if (savedSavings) {
      try {
        setSavingsGoals(JSON.parse(savedSavings));
      } catch (error) {
        console.error('Error parsing savings from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (expenses.length > 0) {
      localStorage.setItem('finance-expenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  useEffect(() => {
    if (savingsGoals.length > 0) {
      localStorage.setItem('finance-savings', JSON.stringify(savingsGoals));
    }
  }, [savingsGoals]);

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const addSavingsGoal = (goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'progress'>) => {
    const progress = goalData.targetAmount > 0 
      ? Math.min((goalData.currentAmount / goalData.targetAmount) * 100, 100) 
      : 0;
    
    const newGoal: SavingsGoal = {
      ...goalData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      progress,
    };
    setSavingsGoals(prev => [newGoal, ...prev]);
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals(prev => 
      prev.map(goal => {
        if (goal.id === id) {
          const updated = { ...goal, ...updates };
          // Recalculate progress if amounts changed
          if ('currentAmount' in updates || 'targetAmount' in updates) {
            updated.progress = updated.targetAmount > 0 
              ? Math.min((updated.currentAmount / updated.targetAmount) * 100, 100) 
              : 0;
          }
          return updated;
        }
        return goal;
      })
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getTotalSavings = () => {
    return savingsGoals.reduce((total, goal) => total + goal.currentAmount, 0);
  };

  const getRecentExpenses = (limit: number = 5) => {
    return expenses
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  };

  const getExpensesByCategory = () => {
    const categoryMap = new Map<string, { amount: number; count: number }>();
    
    expenses.forEach(expense => {
      const existing = categoryMap.get(expense.category) || { amount: 0, count: 0 };
      categoryMap.set(expense.category, {
        amount: existing.amount + expense.amount,
        count: existing.count + 1,
      });
    });

    return Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
    }));
  };

  const getSavingsProgress = () => {
    const totalTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrent = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const progress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    return { totalTarget, totalCurrent, progress };
  };

  const value: FinanceContextType = {
    expenses,
    savingsGoals,
    addExpense,
    addSavingsGoal,
    updateSavingsGoal,
    deleteExpense,
    deleteSavingsGoal,
    getTotalExpenses,
    getTotalSavings,
    getRecentExpenses,
    getExpensesByCategory,
    getSavingsProgress,
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
