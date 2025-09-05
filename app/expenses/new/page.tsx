"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewExpensePage() {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    const formData = new FormData(event.currentTarget); // Get form data from the form element
    
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        body: JSON.stringify({
          amount: parseFloat(formData.get('amount') as string),
          description: formData.get('description'),
          category: formData.get('category'),
          date: formData.get('date'),
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to add expense');
      }
  
      window.location.href = '/expenses';
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/expenses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Expenses
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Add New Expense</h1>
        <p className="text-gray-600 mt-2">Record a new expense transaction</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6" action="">
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description *
            </Label>
            <Input
              id="description"
              name="description"
              type="text"
              required
              placeholder="e.g., Groceries, Movie Tickets, Dinner"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                Amount *
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Date *
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                className="mt-1"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category" className="text-sm font-medium text-gray-700">
              Category *
            </Label>
            <select
              id="category"
              name="category"
              required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a category</option>
              <option value="food">Food & Dining</option>
              <option value="shopping">Shopping</option>
              <option value="transportation">Transportation</option>
              <option value="entertainment">Entertainment</option>
              <option value="bills">Bills & Utilities</option>
              <option value="health">Health & Medical</option>
              <option value="education">Education</option>
              <option value="travel">Travel</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/expenses">
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              Add Expense
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}