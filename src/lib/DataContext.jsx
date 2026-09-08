import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { useAuth } from './AuthContext';
import { DEFAULT_CATEGORIES } from './constants';
import { currentMonthKey } from './format';

const DataContext = createContext(null);

/** pg numeric comes back as a string — normalise money fields to numbers. */
const normTx = (r) => ({ ...r, amount: Number(r.amount) });
const normGoal = (r) => ({
  ...r,
  min_amount: Number(r.min_amount),
  max_amount: Number(r.max_amount),
});

const byNameAsc = (a, b) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });

/**
 * Loads categories / transactions / goals once after sign-in and keeps them in
 * memory. Every mutation updates local state immediately, so the dashboard
 * charts and totals re-render the moment a transaction is added/edited/deleted
 * (no page refresh, no realtime subscription needed).
 *
 * Mounted inside ProtectedRoute, so `session` is always present here in practice.
 */
export function DataProvider({ children }) {
  const { session } = useAuth();

  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const seededForUser = useRef(null); // guards against double-seeding (StrictMode)

  const seedDefaultCategories = useCallback(async (userId) => {
    if (seededForUser.current === userId) {
      // Another (StrictMode / concurrent) load already triggered seeding —
      // return whatever is there now rather than an empty list.
      const { data: existing } = await supabase.from('categories').select('*');
      return existing ?? [];
    }
    seededForUser.current = userId;
    const rows = DEFAULT_CATEGORIES.map((c) => ({ ...c }));
    const { data, error: seedErr } = await supabase
      .from('categories')
      .insert(rows)
      .select();
    if (seedErr) {
      // Unique-violation is fine (a parallel load already seeded); surface others.
      if (seedErr.code !== '23505') setError(seedErr);
      const { data: after } = await supabase.from('categories').select('*');
      return after ?? [];
    }
    return data ?? [];
  }, []);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured || !session) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const [catRes, txRes, goalRes] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('transactions').select('*').order('date', { ascending: false }),
      supabase.from('goals').select('*'),
    ]);

    const firstErr = catRes.error || txRes.error || goalRes.error;
    if (firstErr) setError(firstErr);

    let cats = catRes.data ?? [];
    if (!catRes.error && cats.length === 0) {
      cats = await seedDefaultCategories(session.user.id);
    }

    setCategories([...cats].sort(byNameAsc));
    setTransactions((txRes.data ?? []).map(normTx));
    setGoals((goalRes.data ?? []).map(normGoal));
    setLoading(false);
  }, [session, seedDefaultCategories]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (cancelled) return;
      await reload();
    })();
    return () => {
      cancelled = true;
    };
  }, [reload]);

  // ----- categories -------------------------------------------------------
  const addCategory = useCallback(async ({ name, icon, type }) => {
    const { data, error: e } = await supabase
      .from('categories')
      .insert({ name: name.trim(), icon, type: type === 'income' ? 'income' : 'expense' })
      .select()
      .single();
    if (e) return { error: e };
    setCategories((prev) => [...prev, data].sort(byNameAsc));
    return { data };
  }, []);

  const updateCategory = useCallback(async (id, patch) => {
    const clean = { ...patch };
    if (clean.name != null) clean.name = clean.name.trim();
    const { data, error: e } = await supabase
      .from('categories')
      .update(clean)
      .eq('id', id)
      .select()
      .single();
    if (e) return { error: e };
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? data : c)).sort(byNameAsc)
    );
    return { data };
  }, []);

  const deleteCategory = useCallback(async (id) => {
    const { error: e } = await supabase.from('categories').delete().eq('id', id);
    if (e) return { error: e };
    setCategories((prev) => prev.filter((c) => c.id !== id));
    // Mirror the DB's ON DELETE SET NULL so totals/labels stay correct locally.
    setTransactions((prev) =>
      prev.map((t) => (t.category_id === id ? { ...t, category_id: null } : t))
    );
    return {};
  }, []);

  // ----- transactions ---------------------------------------------------
  const addTransaction = useCallback(async (tx) => {
    const { data, error: e } = await supabase
      .from('transactions')
      .insert({
        amount: tx.amount,
        type: tx.type,
        category_id: tx.category_id || null,
        note: tx.note?.trim() || null,
        date: tx.date,
      })
      .select()
      .single();
    if (e) return { error: e };
    setTransactions((prev) =>
      [normTx(data), ...prev].sort((a, b) => b.date.localeCompare(a.date))
    );
    return { data };
  }, []);

  const updateTransaction = useCallback(async (id, patch) => {
    const clean = { ...patch };
    if ('category_id' in clean) clean.category_id = clean.category_id || null;
    if ('note' in clean) clean.note = clean.note?.trim() || null;
    const { data, error: e } = await supabase
      .from('transactions')
      .update(clean)
      .eq('id', id)
      .select()
      .single();
    if (e) return { error: e };
    setTransactions((prev) =>
      prev
        .map((t) => (t.id === id ? normTx(data) : t))
        .sort((a, b) => b.date.localeCompare(a.date))
    );
    return { data };
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    const { error: e } = await supabase.from('transactions').delete().eq('id', id);
    if (e) return { error: e };
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    return {};
  }, []);

  // ----- goals (write UI arrives in Phase 6; read is used by the dashboard) --
  const upsertGoal = useCallback(async ({ month, year, min_amount, max_amount }) => {
    const { data, error: e } = await supabase
      .from('goals')
      .upsert(
        { month, year, min_amount, max_amount },
        { onConflict: 'user_id,year,month' }
      )
      .select()
      .single();
    if (e) return { error: e };
    setGoals((prev) => {
      const rest = prev.filter((g) => !(g.month === month && g.year === year));
      return [...rest, normGoal(data)];
    });
    return { data };
  }, []);

  // ----- derived --------------------------------------------------------
  const categoryById = useMemo(() => {
    const m = new Map();
    categories.forEach((c) => m.set(c.id, c));
    return m;
  }, [categories]);

  const expenseCategories = useMemo(
    () => categories.filter((c) => c.type !== 'income'),
    [categories]
  );
  const incomeCategories = useMemo(
    () => categories.filter((c) => c.type === 'income'),
    [categories]
  );

  const currentGoal = useMemo(() => {
    const { month, year } = currentMonthKey();
    return goals.find((g) => g.month === month && g.year === year) ?? null;
  }, [goals]);

  const value = useMemo(
    () => ({
      categories,
      transactions,
      goals,
      categoryById,
      expenseCategories,
      incomeCategories,
      currentGoal,
      loading,
      error,
      reload,
      addCategory,
      updateCategory,
      deleteCategory,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      upsertGoal,
    }),
    [
      categories,
      transactions,
      goals,
      categoryById,
      expenseCategories,
      incomeCategories,
      currentGoal,
      loading,
      error,
      reload,
      addCategory,
      updateCategory,
      deleteCategory,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      upsertGoal,
    ]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within <DataProvider>');
  return ctx;
}
