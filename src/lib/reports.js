import { formatMonthYear, goalZone } from './format';

const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function splitDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return { y, m, d };
}

function groupByCategory(rows, categoryById) {
  const totals = new Map();
  rows.forEach((t) => {
    const key = t.category_id ?? '__none__';
    totals.set(key, (totals.get(key) ?? 0) + Number(t.amount));
  });
  const grand = [...totals.values()].reduce((s, v) => s + v, 0);
  return [...totals.entries()]
    .map(([id, amount]) => ({
      name: id === '__none__' ? 'Uncategorized' : categoryById.get(id)?.name ?? 'Unknown',
      amount,
      pct: grand > 0 ? Math.round((amount / grand) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/** Monthly statement — mirrors supabase/functions/_shared/report.ts. */
export function buildMonthlyReport({ year, month, transactions, categoryById, goal }) {
  const rows = transactions.filter((t) => {
    const { y, m } = splitDate(t.date);
    return y === year && m === month;
  });
  const expenses = rows.filter((t) => t.type === 'expense');
  const income = rows.filter((t) => t.type === 'income');

  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);

  const gz = goal ? goalZone(totalExpense, goal) : null;

  return {
    period: { type: 'monthly', year, month, label: formatMonthYear({ month, year }) },
    totals: {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
      transactionCount: rows.length,
    },
    goal: goal ? { min: Number(goal.min_amount), max: Number(goal.max_amount) } : null,
    goalStatus: gz ? { pct: Math.round(gz.pct), zone: gz.zone } : null,
    expenseByCategory: groupByCategory(expenses, categoryById),
    incomeByCategory: groupByCategory(income, categoryById),
  };
}

/** Annual / partial-year statement — mirrors the Edge Function builder. */
export function buildAnnualReport({ year, transactions, categoryById }) {
  const rows = transactions.filter((t) => splitDate(t.date).y === year);
  const expenses = rows.filter((t) => t.type === 'expense');
  const income = rows.filter((t) => t.type === 'income');

  const byMonth = MONTH_ABBR.map((label, i) => {
    const m = i + 1;
    const mExp = expenses
      .filter((t) => splitDate(t.date).m === m)
      .reduce((s, t) => s + Number(t.amount), 0);
    const mInc = income
      .filter((t) => splitDate(t.date).m === m)
      .reduce((s, t) => s + Number(t.amount), 0);
    return { month: m, label, income: mInc, expense: mExp, net: mInc - mExp };
  });

  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const totalIncome = income.reduce((s, t) => s + Number(t.amount), 0);
  const monthsWithData = byMonth.filter((m) => m.income || m.expense).length;

  return {
    period: { type: 'annual', year, label: String(year) },
    totals: {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
      transactionCount: rows.length,
      monthsWithData,
    },
    byMonth,
    expenseByCategory: groupByCategory(expenses, categoryById),
    incomeByCategory: groupByCategory(income, categoryById),
  };
}
