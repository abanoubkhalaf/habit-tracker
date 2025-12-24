import { useMemo } from 'react';
import { Target, Wallet, TrendingUp, Flame } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { HabitCard } from '@/components/HabitCard';
import { ExpenseCard } from '@/components/ExpenseCard';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Habit, Expense } from '@/types';
import { format, isToday, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const toggleHabit = (habitId: string, date: string) => {
    setHabits((prev) =>
      prev.map((habit) => {
        if (habit.id === habitId) {
          const isCompleted = habit.completedDates.includes(date);
          return {
            ...habit,
            completedDates: isCompleted
              ? habit.completedDates.filter((d) => d !== date)
              : [...habit.completedDates, date],
          };
        }
        return habit;
      })
    );
  };

  const stats = useMemo(() => {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // Habits completed today
    const habitsCompletedToday = habits.filter((h) =>
      h.completedDates.includes(todayStr)
    ).length;

    // Total completion rate this month
    const daysInMonth = new Date().getDate();
    const possibleCompletions = habits.length * daysInMonth;
    let completionsThisMonth = 0;
    habits.forEach((habit) => {
      habit.completedDates.forEach((date) => {
        const d = new Date(date);
        if (isWithinInterval(d, { start: monthStart, end: monthEnd })) {
          completionsThisMonth++;
        }
      });
    });
    const completionRate = possibleCompletions > 0
      ? Math.round((completionsThisMonth / possibleCompletions) * 100)
      : 0;

    // Longest streak across all habits
    let longestStreak = 0;
    habits.forEach((habit) => {
      let streak = 0;
      let currentDate = today;
      const isCompletedToday = habit.completedDates.includes(todayStr);
      if (!isCompletedToday) currentDate = subDays(today, 1);
      
      while (true) {
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        if (habit.completedDates.includes(dateStr)) {
          streak++;
          currentDate = subDays(currentDate, 1);
        } else {
          break;
        }
      }
      if (streak > longestStreak) longestStreak = streak;
    });

    // Monthly expenses
    const monthlyExpenses = expenses
      .filter((e) => {
        const d = new Date(e.date);
        return isWithinInterval(d, { start: monthStart, end: monthEnd });
      })
      .reduce((sum, e) => sum + e.amount, 0);

    // Today's expenses
    const todayExpenses = expenses
      .filter((e) => e.date === todayStr)
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      habitsCompletedToday,
      totalHabits: habits.length,
      completionRate,
      longestStreak,
      monthlyExpenses,
      todayExpenses,
    };
  }, [habits, expenses, todayStr]);

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [expenses]);

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="gradient-hero rounded-3xl p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}! ✨
        </h1>
        <p className="text-muted-foreground text-lg">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Progress"
          value={`${stats.habitsCompletedToday}/${stats.totalHabits}`}
          subtitle="habits completed"
          icon={<Target className="w-6 h-6 text-primary" />}
        />
        <StatCard
          title="Monthly Rate"
          value={`${stats.completionRate}%`}
          subtitle="completion rate"
          icon={<TrendingUp className="w-6 h-6 text-success" />}
          variant="success"
        />
        <StatCard
          title="Best Streak"
          value={stats.longestStreak}
          subtitle="days in a row"
          icon={<Flame className="w-6 h-6 text-primary-foreground" />}
          variant="primary"
        />
        <StatCard
          title="This Month"
          value={`$${stats.monthlyExpenses.toFixed(0)}`}
          subtitle={`$${stats.todayExpenses.toFixed(0)} today`}
          icon={<Wallet className="w-6 h-6 text-warning" />}
        />
      </div>

      {/* Habits Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Today's Habits</h2>
          <Link to="/habits">
            <Button variant="ghost" className="text-primary">
              View All →
            </Button>
          </Link>
        </div>
        {habits.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center shadow-soft">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
              <Target className="w-8 h-8 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-4">Start building better habits today!</p>
            <Link to="/habits">
              <Button className="gradient-primary">Add Your First Habit</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {habits.slice(0, 4).map((habit) => (
              <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Expenses */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Recent Expenses</h2>
          <Link to="/expenses">
            <Button variant="ghost" className="text-primary">
              View All →
            </Button>
          </Link>
        </div>
        {recentExpenses.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center shadow-soft">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-warning/20 flex items-center justify-center">
              <Wallet className="w-8 h-8 text-warning" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No expenses tracked</h3>
            <p className="text-muted-foreground mb-4">Start tracking your spending!</p>
            <Link to="/expenses">
              <Button className="gradient-primary">Add Your First Expense</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <ExpenseCard key={expense.id} expense={expense} onDelete={deleteExpense} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
