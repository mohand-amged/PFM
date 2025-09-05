"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewSavingsGoalPage() {
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
            <Link href="/savings">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Savings
            </Link>
          </Button>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Savings Goal</h1>
        <p className="text-gray-600 mt-2">Set a new financial goal to track your progress</p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="goal" className="text-sm font-medium text-gray-700">
              Goal Name *
            </Label>
            <Input
              id="goal"
              name="goal"
              type="text"
              required
              placeholder="e.g., Vacation Fund, New Laptop, Emergency Fund"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                Target Amount *
              </Label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="targetDate" className="text-sm font-medium text-gray-700">
                Target Date *
              </Label>
              <Input
                id="targetDate"
                name="targetDate"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notes
            </Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Add any additional details about your savings goal..."
              className="mt-1 min-h-[100px]"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" asChild>
              <Link href="/savings">
                Cancel
              </Link>
            </Button>
            <Button type="submit">
              Create Goal
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}