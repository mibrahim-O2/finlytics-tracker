import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { colors } from '../styles/theme';
import { formatPKR, currentMonthKey, daysInMonth, isInMonth } from '../lib/format';

/**
 * Cumulative expense across the current month, day by day. A dashed reference
 * line marks the goal's max_amount when a goal is set.
 */
export default function SpendingTrendChart({ transactions, goal }) {
  const data = useMemo(() => {
    const key = currentMonthKey();
    const total = daysInMonth(key);
    const now = new Date();
    const isCurrent =
      now.getFullYear() === key.year && now.getMonth() + 1 === key.month;
    const lastDay = isCurrent ? now.getDate() : total;

    const perDay = new Array(total + 1).fill(0);
    transactions.forEach((t) => {
      if (t.type !== 'expense' || !isInMonth(t.date, key)) return;
      const d = Number(t.date.split('-')[2]);
      perDay[d] += t.amount;
    });

    let running = 0;
    const rows = [];
    for (let d = 1; d <= lastDay; d += 1) {
      running += perDay[d];
      rows.push({ day: d, total: running });
    }
    return rows;
  }, [transactions]);

  const max = Number(goal?.max_amount) || 0;

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.accentGreen} stopOpacity={0.35} />
              <stop offset="100%" stopColor={colors.accentGreen} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={colors.accentTeal} strokeOpacity={0.12} vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: '#ffffff80', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: colors.accentTeal, strokeOpacity: 0.2 }}
          />
          <YAxis
            width={64}
            tick={{ fill: '#ffffff80', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
          />
          <Tooltip
            contentStyle={{
              background: '#011613',
              border: `1px solid ${colors.accentTeal}55`,
              borderRadius: 12,
              fontSize: 12,
            }}
            labelStyle={{ color: '#ffffffaa' }}
            formatter={(v) => [formatPKR(v), 'Cumulative expense']}
            labelFormatter={(d) => `Day ${d}`}
          />
          {max > 0 && (
            <ReferenceLine
              y={max}
              stroke={colors.accentCyan}
              strokeDasharray="4 4"
              label={{ value: 'Goal max', fill: colors.accentCyan, fontSize: 11, position: 'insideTopRight' }}
            />
          )}
          <Area
            type="monotone"
            dataKey="total"
            stroke={colors.accentGreen}
            strokeWidth={2}
            fill="url(#trendFill)"
            isAnimationActive
            animationDuration={600}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
