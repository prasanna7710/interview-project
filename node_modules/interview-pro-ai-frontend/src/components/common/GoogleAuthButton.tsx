import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/api';
import { Loader2 } from 'lucide-react';

interface GoogleAuthButtonProps {
  label?: string;
  redirectTo?: string;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  label = 'Continue with Google',
  redirectTo = '/dashboard',
}) => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleGoogleSuccess = async (response: any) => {
    setLoading(true);
    try {
      const idToken = response.credential || response.access_token;
      const res = await api.post('/auth/google', { idToken });
      login(res.data.token, res.data.user);
      showToast('Successfully authenticated with Google!', 'success');
      navigate(redirectTo);
    } catch (err: any) {
      console.error('Google auth backend error:', err);
      const msg = err.response?.data?.error || 'Google login failed. Please try again.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = (error?: any) => {
    console.warn('Google Auth Prompt Error:', error);
    showToast('Google authentication was cancelled or unavailable.', 'info');
  };

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
    flow: 'implicit',
  });

  const handleClick = () => {
    if (googleClientId && googleClientId !== 'YOUR_GOOGLE_CLIENT_ID' && !googleClientId.includes('dummy')) {
      googleLogin();
    } else {
      setLoading(true);
      setTimeout(async () => {
        try {
          const res = await api.post('/auth/google', {
            mockPayload: {
              email: 'google_user_demo@gmail.com',
              name: 'Google Candidate',
              picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
            },
          });
          login(res.data.token, res.data.user);
          showToast('Signed in with Google (Development Mode)', 'success');
          navigate(redirectTo);
        } catch (e: any) {
          showToast('Google authentication failed.', 'error');
        } finally {
          setLoading(false);
        }
      }, 500);
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="relative flex items-center justify-center my-2">
        <div className="border-t border-gray-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-medium uppercase tracking-wider text-gray-400 absolute">
          or
        </span>
      </div>

      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold py-2.5 px-4 rounded-xl text-sm transition shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            <span>Authenticating with Google...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{label}</span>
          </>
        )}
      </button>
    </div>
  );
};
