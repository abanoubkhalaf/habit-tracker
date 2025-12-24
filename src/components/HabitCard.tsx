import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Habit } from '@/types';
import { format, isToday, subDays, isSameDay } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
  onToggle: (habitId: string, date: string) => void;
}

export function HabitCard({ habit, onToggle }: HabitCardProps) {
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const isCompletedToday = habit.completedDates.includes(todayStr);

  // Calculate current streak
  const calculateStreak = () => {
    let streak = 0;
    let currentDate = today;
    
    // If not completed today, start from yesterday
    if (!isCompletedToday) {
      currentDate = subDays(today, 1);
    }
    
    while (true) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      if (habit.completedDates.includes(dateStr)) {
        streak++;
        currentDate = subDays(currentDate, 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  // Get last 7 days for visualization
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    return {
      date,
      dateStr: format(date, 'yyyy-MM-dd'),
      dayLabel: format(date, 'EEE')[0],
      isCompleted: habit.completedDates.includes(format(date, 'yyyy-MM-dd')),
      isToday: isToday(date),
    };
  });

  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: `${habit.color}20` }}
          >
            {habit.icon}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{habit.name}</h3>
            <p className="text-sm text-muted-foreground">
              {streak > 0 ? `🔥 ${streak} day streak` : 'Start your streak!'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onToggle(habit.id, todayStr)}
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
            isCompletedToday
              ? "gradient-success shadow-soft"
              : "bg-secondary hover:bg-secondary/80 border-2 border-dashed border-border"
          )}
        >
          {isCompletedToday && <Check className="w-6 h-6 text-success-foreground" />}
        </button>
      </div>

      {/* Week visualization */}
      <div className="flex items-center justify-between gap-1">
        {last7Days.map(({ dateStr, dayLabel, isCompleted, isToday: isTodayDate }) => (
          <div key={dateStr} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-muted-foreground">{dayLabel}</span>
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200",
                isCompleted
                  ? "gradient-success"
                  : isTodayDate
                  ? "border-2 border-primary bg-primary/10"
                  : "bg-secondary"
              )}
            >
              {isCompleted && <Check className="w-4 h-4 text-success-foreground" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
