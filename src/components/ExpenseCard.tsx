import { Trash2 } from 'lucide-react';
import { Expense, EXPENSE_CATEGORIES } from '@/types';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface ExpenseCardProps {
  expense: Expense;
  onDelete: (id: string) => void;
}

export function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  const category = EXPENSE_CATEGORIES.find((c) => c.name === expense.category) || EXPENSE_CATEGORIES[7];

  return (
    <div className="bg-card rounded-xl p-4 shadow-soft flex items-center justify-between group transition-all hover:shadow-lg">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: `${category.color}20` }}
        >
          {category.icon}
        </div>
        <div>
          <h4 className="font-medium text-foreground">{expense.description}</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{category.name}</span>
            <span>•</span>
            <span>{format(new Date(expense.date), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-destructive">
          -${expense.amount.toFixed(2)}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(expense.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
