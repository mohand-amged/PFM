import { Suspense } from 'react';
import { getExpenses } from '@/app/actions/expenses';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CreditCard } from 'lucide-react';
import Link from 'next/link';

async function ExpensesList() {
  const expenses = await getExpenses();

  if (expenses.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <CreditCard size={48} className="mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No expenses yet</h3>
            <p className="text-muted-foreground">
              Start tracking your expenses to better manage your finances.
            </p>
          </div>
          <Link href="/expenses/new">
            <Button>
              <Plus size={16} />
              Add First Expense
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recent Expenses</h3>
        <Link href="/expenses/new">
          <Button>
            <Plus size={16} />
            Add Expense
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {expenses.slice(0, 10).map((expense) => (
          <Card key={expense.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="font-medium">{expense.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {expense.category && (
                      <span className="inline-block bg-muted px-2 py-1 rounded-full text-xs mr-2">
                        {expense.category}
                      </span>
                    )}
                    {expense.date.toLocaleDateString()}
                  </div>
                  {expense.description && (
                    <div className="text-sm text-muted-foreground">
                      {expense.description}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {expense.currency} {expense.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {expenses.length > 10 && (
        <div className="text-center pt-4">
          <Link href="/expenses">
            <Button variant="outline">View All Expenses</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

export default function ExpensesTab() {
  return (
    <div className="space-y-6">
      <Suspense fallback={
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      }>
        <ExpensesList />
      </Suspense>
    </div>
  );
}
