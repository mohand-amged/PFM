import { Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, PiggyBank, Target } from 'lucide-react';
import Link from 'next/link';

// This will be moved to a server action
const getSavingsPreview = async () => {
  // For now, return empty array to avoid server component issues
  return [];
};

async function SavingsList() {
  const savings = await getSavingsPreview();

  if (savings.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="space-y-4">
          <PiggyBank size={48} className="mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">No savings yet</h3>
            <p className="text-muted-foreground">
              Start saving money and track your progress towards financial goals.
            </p>
          </div>
          <Link href="/savings/new">
            <Button>
              <Plus size={16} />
              Add First Saving
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Savings</h3>
        <Link href="/savings/new">
          <Button>
            <Plus size={16} />
            Add Saving
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {savings.map((saving) => {
          const progressPercentage = saving.targetAmount 
            ? Math.min((saving.amount / saving.targetAmount) * 100, 100)
            : 0;
          
          return (
            <Card key={saving.id}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium">{saving.name}</div>
                        {saving.isCompleted && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Target size={12} />
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {saving.category && (
                          <span className="inline-block bg-muted px-2 py-1 rounded-full text-xs mr-2">
                            {saving.category}
                          </span>
                        )}
                        {saving.date.toLocaleDateString()}
                      </div>
                      {saving.description && (
                        <div className="text-sm text-muted-foreground">
                          {saving.description}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">
                        {saving.currency} {saving.amount.toFixed(2)}
                      </div>
                      {saving.targetAmount && (
                        <div className="text-sm text-muted-foreground">
                          of {saving.currency} {saving.targetAmount.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {saving.targetAmount && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center pt-4">
        <Link href="/savings">
          <Button variant="outline">Manage All Savings</Button>
        </Link>
      </div>
    </div>
  );
}

export default function SavingsTab() {
  return (
    <div className="space-y-6">
      <Suspense fallback={
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      }>
        <SavingsList />
      </Suspense>
    </div>
  );
}
