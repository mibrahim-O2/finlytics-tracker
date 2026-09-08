import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

/**
 * Gate for every authenticated screen. No session -> redirect to /login,
 * remembering where the user was headed.
 */
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-accent-cyan">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
