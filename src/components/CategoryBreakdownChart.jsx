import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { CHART_PALETTE, UNCATEGORIZED_COLOR } from '../styles/theme';
import { formatPKR, currentMonthKey, isInMonth } from '../lib/format';

/**
 * Current-month expense split by category (donut). Uses the teal/green/cyan
 * palette only - warning colours stay reserved for goal progress.
 */
export default function CategoryBreakdownChart({ transactions, categories, categoryById }) {
  const data = useMemo(() => {
    const key = currentMonthKey();
    const totals = new Map();
    transactions.forEach((t) => {
      if (t.type !== 'expense' || !isInMonth(t.date, key)) return;
      const id = t.category_id ?? '__none__';
      totals.set(id, (totals.get(id) ?? 0) + t.amount);
    });

    const orderedIds = [
      ...categories.map((c) => c.id),
      '__none__',
    ].filter((id) => totals.has(id));

    return orderedIds.map((id, i) => ({
      name: id === '__none__' ? 'Uncategorized' : categoryById.get(id)?.name ?? 'Unknown',
      value: totals.get(id),
      color: id === '__none__' ? UNCATEGORIZED_COLOR : CHART_PALETTE[i % CHART_PALETTE.length],
    }));
  }, [transactions, categories, categoryById]);

  const grandTotal = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-text-primary/40">
        No expenses this month yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={80}
              paddingAngle={2}
              stroke="none"
              isAnimationActive
              animationDuration={600}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#011613',
                border: '1px solid #27968F55',
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v, n) => [`${formatPKR(v)} (${Math.round((v / grandTotal) * 100)}%)`, n]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full space-y-1.5 text-sm">
        {data
          .slice()
          .sort((a, b) => b.value - a.value)
          .map((d) => (
            <li key={d.name} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-text-primary/70">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                {d.name}
              </span>
              <span className="text-text-primary/50">
                {Math.round((d.value / grandTotal) * 100)}%
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
