import { SupabaseClient } from 'jsr:@supabase/supabase-js@2';

// Server-side twin of src/lib/reports.js — keep the two in sync.

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

type Txn = { amount: number | string; type: string; category_id: string | null; date: string };
type Cat = { id: string; name: string };
type CatRow = { name: string; amount: number; pct: number };

function num(v: number | string): number {
  return typeof v === 'number' ? v : Number(v) || 0;
}

function groupByCategory(rows: Txn[], catName: Map<string, string>): CatRow[] {
  const totals = new Map<string, number>();
  for (const t of rows) {
    const key = t.category_id ?? '__none__';
    totals.set(key, (totals.get(key) ?? 0) + num(t.amount));
  }
  const grand = [...totals.values()].reduce((s, v) => s + v, 0);
  return [...totals.entries()]
    .map(([id, amount]) => ({
      name: id === '__none__' ? 'Uncategorized' : catName.get(id) ?? 'Unknown',
      amount,
      pct: grand > 0 ? Math.round((amount / grand) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

async function loadYear(admin: SupabaseClient, userId: string, year: number) {
  const { data: txns } = await admin
    .from('transactions')
    .select('amount,type,category_id,date')
    .eq('user_id', userId)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`);
  const { data: cats } = await admin
    .from('categories')
    .select('id,name')
    .eq('user_id', userId);
  const catName = new Map<string, string>();
  for (const c of (cats ?? []) as Cat[]) catName.set(c.id, c.name);
  return { txns: (txns ?? []) as Txn[], catName };
}

export async function buildMonthlyReport(
  admin: SupabaseClient,
  userId: string,
  year: number,
  month: number,
) {
  const { txns, catName } = await loadYear(admin, userId, year);
  const rows = txns.filter((t) => Number(t.date.split('-')[1]) === month);
  const expenses = rows.filter((t) => t.type === 'expense');
  const income = rows.filter((t) => t.type === 'income');

  const totalExpense = expenses.reduce((s, t) => s + num(t.amount), 0);
  const totalIncome = income.reduce((s, t) => s + num(t.amount), 0);

  const { data: goal } = await admin
    .from('goals')
    .select('min_amount,max_amount')
    .eq('user_id', userId)
    .eq('year', year)
    .eq('month', month)
    .maybeSingle();

  let goalStatus: { pct: number; zone: string } | null = null;
  if (goal) {
    const max = num(goal.max_amount);
    const pct = max > 0 ? Math.round((totalExpense / max) * 100) : 0;
    const zone = pct >= 100 ? 'red' : pct >= 70 ? 'amber' : 'green';
    goalStatus = { pct, zone };
  }

  return {
    period: { type: 'monthly', year, month, label: `${MONTH_NAMES[month - 1]} ${year}` },
    totals: {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
      transactionCount: rows.length,
    },
    goal: goal ? { min: num(goal.min_amount), max: num(goal.max_amount) } : null,
    goalStatus,
    expenseByCategory: groupByCategory(expenses, catName),
    incomeByCategory: groupByCategory(income, catName),
  };
}

export async function buildAnnualReport(admin: SupabaseClient, userId: string, year: number) {
  const { txns, catName } = await loadYear(admin, userId, year);
  const expenses = txns.filter((t) => t.type === 'expense');
  const income = txns.filter((t) => t.type === 'income');

  const byMonth = MONTH_ABBR.map((label, i) => {
    const m = i + 1;
    const mExp = expenses
      .filter((t) => Number(t.date.split('-')[1]) === m)
      .reduce((s, t) => s + num(t.amount), 0);
    const mInc = income
      .filter((t) => Number(t.date.split('-')[1]) === m)
      .reduce((s, t) => s + num(t.amount), 0);
    return { month: m, label, income: mInc, expense: mExp, net: mInc - mExp };
  });

  const totalExpense = expenses.reduce((s, t) => s + num(t.amount), 0);
  const totalIncome = income.reduce((s, t) => s + num(t.amount), 0);

  return {
    period: { type: 'annual', year, label: String(year) },
    totals: {
      income: totalIncome,
      expense: totalExpense,
      net: totalIncome - totalExpense,
      transactionCount: txns.length,
      monthsWithData: byMonth.filter((m) => m.income || m.expense).length,
    },
    byMonth,
    expenseByCategory: groupByCategory(expenses, catName),
    incomeByCategory: groupByCategory(income, catName),
  };
}

export type Report =
  | Awaited<ReturnType<typeof buildMonthlyReport>>
  | Awaited<ReturnType<typeof buildAnnualReport>>;
