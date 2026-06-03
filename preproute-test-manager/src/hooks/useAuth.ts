import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';

export function useAuth(redirectIfAuthenticated = false) {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (redirectIfAuthenticated && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, redirectIfAuthenticated, navigate]);

  return { isAuthenticated };
}

export function useRequireAuth() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return { isAuthenticated };
}
