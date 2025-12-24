import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { EXPENSE_CATEGORIES } from '@/types';

interface ExpensePieChartProps {
  data: { name: string; value: number }[];
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const getColor = (name: string) => {
    const category = EXPENSE_CATEGORIES.find((c) => c.name === name);
    return category?.color || 'hsl(0 0% 50%)';
  };

  return (
    <div className="bg-card rounded-2xl p-5 shadow-soft">
      <h3 className="text-lg font-semibold text-foreground mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-md)',
            }}
          />
          <Legend
            formatter={(value) => {
              const cat = EXPENSE_CATEGORIES.find((c) => c.name === value);
              return `${cat?.icon || ''} ${value}`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
