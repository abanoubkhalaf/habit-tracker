import { useMemo, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Expense, TimeRange, EXPENSE_CATEGORIES } from '@/types';
import { ExpenseCard } from '@/components/ExpenseCard';
import { AddExpenseDialog } from '@/components/AddExpenseDialog';
import { TimeRangeTabs } from '@/components/TimeRangeTabs';
import { StatCard } from '@/components/StatCard';
import { Wallet, TrendingDown, Calendar } from 'lucide-react';
import {
  format,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  isWithinInterval,
} from 'date-fns';

export default function Expenses() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  const addExpense = (amount: number, category: string, description: string, date: string) => {
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      amount,
      category,
      description,
      date,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const { filteredExpenses, total, categoryBreakdown, avgPerDay } = useMemo(() => {
    const today = new Date();
    let start: Date, end: Date;

    switch (timeRange) {
      case 'daily':
        start = startOfDay(today);
        end = endOfDay(today);
        break;
      case 'weekly':
        start = startOfWeek(today, { weekStartsOn: 1 });
        end = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'monthly':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'yearly':
        start = startOfYear(today);
        end = endOfYear(today);
        break;
    }

    const filtered = expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      return isWithinInterval(expenseDate, { start, end });
    });

    const total = filtered.reduce((sum, e) => sum + e.amount, 0);

    const breakdown: Record<string, number> = {};
    filtered.forEach((e) => {
      breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
    });

    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const avgPerDay = total / days;

    return {
      filteredExpenses: filtered.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
      total,
      categoryBreakdown: Object.entries(breakdown)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value),
      avgPerDay,
    };
  }, [expenses, timeRange]);

  const topCategory = categoryBreakdown[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Expenses</h1>
          <p className="text-muted-foreground">Track and manage your spending</p>
        </div>
        <AddExpenseDialog onAdd={addExpense} />
      </div>

      <TimeRangeTabs value={timeRange} onChange={setTimeRange} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Spent"
          value={`$${total.toFixed(2)}`}
          subtitle={`${timeRange} total`}
          icon={<Wallet className="w-6 h-6 text-primary" />}
          variant="primary"
        />
        <StatCard
          title="Daily Average"
          value={`$${avgPerDay.toFixed(2)}`}
          subtitle="per day"
          icon={<Calendar className="w-6 h-6 text-info" />}
        />
        {topCategory && (
          <StatCard
            title="Top Category"
            value={topCategory.name}
            subtitle={`$${topCategory.value.toFixed(2)}`}
            icon={
              <span className="text-2xl">
                {EXPENSE_CATEGORIES.find((c) => c.name === topCategory.name)?.icon || '📦'}
              </span>
            }
          />
        )}
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-card rounded-2xl p-5 shadow-soft">
          <h3 className="font-semibold text-foreground mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {categoryBreakdown.map((cat) => {
              const category = EXPENSE_CATEGORIES.find((c) => c.name === cat.name);
              const percentage = total > 0 ? (cat.value / total) * 100 : 0;
              return (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-xl">{category?.icon || '📦'}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{cat.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ${cat.value.toFixed(2)} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: category?.color || 'hsl(0 0% 50%)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Expense List */}
      <section>
        <h3 className="font-semibold text-foreground mb-4">
          Transactions ({filteredExpenses.length})
        </h3>
        {filteredExpenses.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center shadow-soft">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-warning/20 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No expenses this {timeRange.replace('ly', '')}</h3>
            <p className="text-muted-foreground">Add an expense to start tracking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} onDelete={deleteExpense} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
