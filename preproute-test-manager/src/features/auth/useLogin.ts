import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import axiosClient from '../../api/axiosClient';
import { MESSAGES } from '../../constants/messages';
import { setCredentials } from './authSlice';
import type { LoginFormValues } from '../../validations/loginSchema';
import type { ApiEnvelope, User } from '../../types';

interface LoginApiData {
  token: string;
  user: User & { userId?: string };
}

export function useLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const login = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post<ApiEnvelope<LoginApiData>>(
        '/auth/login',
        values
      );
      const body = response.data;
      if (body.status === 'success' && body.data?.token) {
        const user: User = {
          id: String(body.data.user.id),
          userId: body.data.user.userId ?? values.userId,
          name: body.data.user.name,
        };
        dispatch(setCredentials({ token: body.data.token, user }));
        toast.success(MESSAGES.auth.loginSuccess);
        navigate('/dashboard');
      } else {
        toast.error(MESSAGES.auth.loginFailed);
      }
    } catch {
      toast.error(MESSAGES.auth.loginFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return { login, isLoading };
}
