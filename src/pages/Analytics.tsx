import { useMemo, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Habit, Expense, TimeRange, EXPENSE_CATEGORIES } from '@/types';
import { TimeRangeTabs } from '@/components/TimeRangeTabs';
import { ProgressChart } from '@/components/ProgressChart';
import { ExpensePieChart } from '@/components/ExpensePieChart';
import { StatCard } from '@/components/StatCard';
import { Target, Wallet, TrendingUp, Flame } from 'lucide-react';
import {
  format,
  subDays,
  subMonths,
  subWeeks,
  startOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  isWithinInterval,
} from 'date-fns';

export default function Analytics() {
  const [habits] = useLocalStorage<Habit[]>('habits', []);
  const [expenses] = useLocalStorage<Expense[]>('expenses', []);
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');

  const { habitChartData, expenseChartData, pieData, stats } = useMemo(() => {
    const today = new Date();
    let start: Date, end: Date;
    let dateFormatter: (date: Date) => string;
    let intervals: Date[];

    switch (timeRange) {
      case 'daily':
        start = subDays(today, 6);
        end = today;
        intervals = eachDayOfInterval({ start, end });
        dateFormatter = (d) => format(d, 'EEE');
        break;
      case 'weekly':
        start = subWeeks(today, 7);
        end = today;
        intervals = eachWeekOfInterval({ start, end }, { weekStartsOn: 1 });
        dateFormatter = (d) => format(d, 'MMM d');
        break;
      case 'monthly':
        start = subMonths(today, 11);
        end = today;
        intervals = eachMonthOfInterval({ start, end });
        dateFormatter = (d) => format(d, 'MMM');
        break;
      case 'yearly':
        start = subMonths(today, 35);
        end = today;
        intervals = eachMonthOfInterval({ start, end }).filter((_, i) => i % 3 === 0);
        dateFormatter = (d) => format(d, 'MMM yy');
        break;
    }

    // Habit completion data
    const habitChartData = intervals.map((intervalStart) => {
      let intervalEnd: Date;
      switch (timeRange) {
        case 'daily':
          intervalEnd = endOfDay(intervalStart);
          break;
        case 'weekly':
          intervalEnd = endOfWeek(intervalStart, { weekStartsOn: 1 });
          break;
        case 'monthly':
        case 'yearly':
          intervalEnd = endOfMonth(intervalStart);
          break;
      }

      let completions = 0;
      habits.forEach((habit) => {
        habit.completedDates.forEach((dateStr) => {
          const date = new Date(dateStr);
          if (isWithinInterval(date, { start: intervalStart, end: intervalEnd })) {
            completions++;
          }
        });
      });

      return {
        name: dateFormatter(intervalStart),
        value: completions,
      };
    });

    // Expense data
    const expenseChartData = intervals.map((intervalStart) => {
      let intervalEnd: Date;
      switch (timeRange) {
        case 'daily':
          intervalEnd = endOfDay(intervalStart);
          break;
        case 'weekly':
          intervalEnd = endOfWeek(intervalStart, { weekStartsOn: 1 });
          break;
        case 'monthly':
        case 'yearly':
          intervalEnd = endOfMonth(intervalStart);
          break;
      }

      const total = expenses
        .filter((e) => {
          const date = new Date(e.date);
          return isWithinInterval(date, { start: intervalStart, end: intervalEnd });
        })
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        name: dateFormatter(intervalStart),
        value: total,
      };
    });

    // Pie chart data for current period
    let periodStart: Date, periodEnd: Date;
    switch (timeRange) {
      case 'daily':
        periodStart = startOfDay(today);
        periodEnd = endOfDay(today);
        break;
      case 'weekly':
        periodStart = startOfWeek(today, { weekStartsOn: 1 });
        periodEnd = endOfWeek(today, { weekStartsOn: 1 });
        break;
      case 'monthly':
        periodStart = startOfMonth(today);
        periodEnd = endOfMonth(today);
        break;
      case 'yearly':
        periodStart = startOfYear(today);
        periodEnd = endOfYear(today);
        break;
    }

    const categoryTotals: Record<string, number> = {};
    expenses
      .filter((e) => {
        const date = new Date(e.date);
        return isWithinInterval(date, { start: periodStart, end: periodEnd });
      })
      .forEach((e) => {
        categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
      });

    const pieData = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .filter((d) => d.value > 0);

    // Stats
    const totalCompletions = habitChartData.reduce((sum, d) => sum + d.value, 0);
    const totalSpent = expenseChartData.reduce((sum, d) => sum + d.value, 0);
    const avgCompletionsPerPeriod = habitChartData.length > 0
      ? (totalCompletions / habitChartData.length).toFixed(1)
      : '0';
    const avgSpentPerPeriod = expenseChartData.length > 0
      ? (totalSpent / expenseChartData.length).toFixed(2)
      : '0';

    return {
      habitChartData,
      expenseChartData,
      pieData,
      stats: {
        totalCompletions,
        totalSpent,
        avgCompletionsPerPeriod,
        avgSpentPerPeriod,
      },
    };
  }, [habits, expenses, timeRange]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">Track your progress over time</p>
      </div>

      <TimeRangeTabs value={timeRange} onChange={setTimeRange} />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Habit Completions"
          value={stats.totalCompletions}
          subtitle={`${stats.avgCompletionsPerPeriod} avg/${timeRange.replace('ly', '')}`}
          icon={<Target className="w-6 h-6 text-primary" />}
        />
        <StatCard
          title="Total Habits"
          value={habits.length}
          subtitle="being tracked"
          icon={<Flame className="w-6 h-6 text-primary-foreground" />}
          variant="primary"
        />
        <StatCard
          title="Total Spent"
          value={`$${stats.totalSpent.toFixed(0)}`}
          subtitle={`$${stats.avgSpentPerPeriod} avg/${timeRange.replace('ly', '')}`}
          icon={<Wallet className="w-6 h-6 text-warning" />}
        />
        <StatCard
          title="Transactions"
          value={expenses.length}
          subtitle="recorded"
          icon={<TrendingUp className="w-6 h-6 text-success" />}
          variant="success"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProgressChart
          data={habitChartData}
          timeRange={timeRange}
          color="hsl(150 60% 45%)"
          title="Habit Completions"
        />
        <ProgressChart
          data={expenseChartData}
          timeRange={timeRange}
          color="hsl(24 85% 55%)"
          title="Spending Trend"
        />
      </div>

      {/* Pie Chart */}
      {pieData.length > 0 && <ExpensePieChart data={pieData} />}

      {/* Empty State */}
      {habits.length === 0 && expenses.length === 0 && (
        <div className="bg-card rounded-3xl p-12 text-center shadow-soft">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">No Data Yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Start adding habits and expenses to see your analytics come to life!
          </p>
        </div>
      )}
    </div>
  );
}
