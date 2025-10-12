'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function MagicLinkForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Check if the user is completing the sign-in process
    // Use a ref or state to prevent multiple executions
    if (isSignInWithEmailLink(auth, window.location.href) && !verifying) {
      handleSignInWithLink();
    }
  }, []);

  const handleSignInWithLink = async () => {
    setVerifying(true);
    let emailForSignIn = localStorage.getItem('emailForSignIn');

    if (!emailForSignIn) {
      // If the email is not in localStorage, ask the user to provide it
      emailForSignIn = window.prompt(t('enterEmail'));
    }

    if (!emailForSignIn) {
      setVerifying(false);
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailLink(auth, emailForSignIn, window.location.href);
      localStorage.removeItem('emailForSignIn');

      // Clean URL params before redirect
      window.history.replaceState({}, document.title, '/auth');

      // Small delay to ensure auth state updates
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error: any) {
      console.error('Error signing in with email link:', error);
      setVerifying(false);

      switch (error.code) {
        case 'auth/invalid-action-code':
          setError(t('invalidActionCode'));
          break;
        case 'auth/network-request-failed':
          setError(t('networkError'));
          break;
        default:
          setError(t('error', { message: error.message }));
      }
      setLoading(false);
    }
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError(t('emailRequired'));
      return;
    }
    if (!validateEmail(email)) {
      setError(t('invalidEmail'));
      return;
    }

    setLoading(true);

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth`,
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      localStorage.setItem('emailForSignIn', email);
      setSent(true);
    } catch (error: any) {
      console.error('Error sending magic link:', error);

      switch (error.code) {
        case 'auth/invalid-email':
          setError(t('invalidEmail'));
          break;
        case 'auth/too-many-requests':
          setError(t('tooManyRequests'));
          break;
        case 'auth/network-request-failed':
          setError(t('networkError'));
          break;
        default:
          setError(t('error', { message: error.message }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Show verifying state when processing magic link
  if (loading && verifying) {
    return (
      <div className="w-full">
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="text-center">
              <p className="text-sm font-medium text-blue-900">{t('authSuccess')}</p>
              <p className="text-sm text-blue-700 mt-1">{t('loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="w-full">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-green-600 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-green-800">{t('magicLinkSent')}</p>
              <p className="text-sm text-green-700 mt-1">{t('checkEmail')}</p>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setSent(false);
            setEmail('');
          }}
          className="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {t('backToLogin')}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSendLink} className="space-y-4">
        <div>
          <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700 mb-1">
            {t('email')}
          </label>
          <input
            type="email"
            id="magic-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('enterEmail')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {t('loading')}
            </div>
          ) : (
            t('sendMagicLink')
          )}
        </button>
      </form>
    </div>
  );
}
