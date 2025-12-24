import { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Habit } from '@/types';
import { HabitCard } from '@/components/HabitCard';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { Button } from '@/components/ui/button';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function Habits() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habits', []);

  const addHabit = (name: string, icon: string, color: string) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name,
      icon,
      color,
      completedDates: [],
      createdAt: new Date().toISOString(),
    };
    setHabits((prev) => [...prev, newHabit]);
  };

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

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
  };

  const stats = useMemo(() => {
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    const completedToday = habits.filter((h) =>
      h.completedDates.includes(todayStr)
    ).length;

    const daysInMonth = today.getDate();
    const possibleCompletions = habits.length * daysInMonth;
    let monthCompletions = 0;
    habits.forEach((habit) => {
      habit.completedDates.forEach((date) => {
        const d = new Date(date);
        if (isWithinInterval(d, { start: monthStart, end: monthEnd })) {
          monthCompletions++;
        }
      });
    });

    return {
      total: habits.length,
      completedToday,
      monthRate: possibleCompletions > 0
        ? Math.round((monthCompletions / possibleCompletions) * 100)
        : 0,
    };
  }, [habits]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Habits</h1>
          <p className="text-muted-foreground">
            {stats.completedToday}/{stats.total} completed today • {stats.monthRate}% this month
          </p>
        </div>
        <AddHabitDialog onAdd={addHabit} />
      </div>

      {habits.length === 0 ? (
        <div className="bg-card rounded-3xl p-12 text-center shadow-soft">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center">
            <span className="text-4xl">🎯</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Start Your Journey</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Build lasting habits one day at a time. Add your first habit to begin tracking your progress.
          </p>
          <AddHabitDialog onAdd={addHabit} />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {habits.map((habit) => (
            <div key={habit.id} className="relative group">
              <HabitCard habit={habit} onToggle={toggleHabit} />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                onClick={() => deleteHabit(habit.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
