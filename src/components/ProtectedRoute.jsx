import { Navigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';

export default function ProtectedRoute({ children }) {
  const { auth } = useAuth();
  if (!auth?.sessionToken) return <Navigate to="/login" replace />;
  return children;
}
