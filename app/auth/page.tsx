'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import GoogleAuthButton from '@/components/auth/GoogleAuthButton';
import EmailAuthForm from '@/components/auth/EmailAuthForm';
import MagicLinkForm from '@/components/auth/MagicLinkForm';
import PhoneAuthForm from '@/components/auth/PhoneAuthForm';

type AuthMethod = 'email' | 'magic' | 'phone' | 'google';
type AuthMode = 'login' | 'signup';

export default function AuthPage() {
  const t = useTranslations('auth');
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Redirect if user is already logged in
  // Use window.location for more reliable redirect
  if (user && !loading) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-theme-bg-secondary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-theme-border-hover border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-theme-text-secondary">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-theme-accent-50 to-theme-accent-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-theme-text-primary mb-2">
            {authMode === 'login' ? t('login') : t('signup')}
          </h1>
          <p className="text-theme-text-secondary">{t('authMethodsTitle')}</p>
        </div>

        {/* Auth Card */}
        <div className="bg-theme-bg-primary rounded-2xl shadow-xl p-8">
          {/* Method Selection - Vertical Stack */}
          <div className="space-y-3 mb-8">
            <button
              onClick={() => setAuthMethod('google')}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${
                authMethod === 'google'
                  ? 'bg-theme-accent-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-bg-tertiary border-2 border-theme-border'
              }`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
            </button>

            <button
              onClick={() => setAuthMethod('email')}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${
                authMethod === 'email'
                  ? 'bg-theme-accent-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-bg-tertiary border-2 border-theme-border'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{t('emailAuth')}</span>
            </button>

            <button
              onClick={() => setAuthMethod('magic')}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${
                authMethod === 'magic'
                  ? 'bg-theme-accent-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-bg-tertiary border-2 border-theme-border'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span>{t('magicLink')}</span>
            </button>

            <button
              onClick={() => setAuthMethod('phone')}
              className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-medium transition-all ${
                authMethod === 'phone'
                  ? 'bg-theme-accent-600 text-white shadow-lg shadow-blue-200'
                  : 'bg-theme-bg-secondary text-theme-text-primary hover:bg-theme-bg-tertiary border-2 border-theme-border'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>{t('phoneAuth')}</span>
            </button>
          </div>

          {/* Auth Method Content */}
          <div>
            {authMethod === 'email' && (
              <EmailAuthForm mode={authMode} onModeChange={setAuthMode} />
            )}
            {authMethod === 'magic' && <MagicLinkForm />}
            {authMethod === 'phone' && <PhoneAuthForm />}
            {authMethod === 'google' && (
              <div className="space-y-6">
                <GoogleAuthButton />
                {authMode === 'login' && (
                  <div className="text-center pt-4 border-t border-theme-border">
                    <p className="text-sm text-theme-text-secondary">
                      {t('dontHaveAccount')}{' '}
                      <button
                        onClick={() => {
                          setAuthMode('signup');
                          setAuthMethod('email');
                        }}
                        className="text-theme-accent-600 hover:text-theme-accent-700 font-semibold"
                      >
                        {t('switchToSignup')}
                      </button>
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mode Switch for non-email methods */}
          {authMethod !== 'email' && authMethod !== 'google' && (
            <div className="mt-8 pt-6 border-t border-theme-border">
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setAuthMethod('email');
                  }}
                  className="text-sm text-theme-text-secondary hover:text-theme-accent-600 font-medium"
                >
                  {t('switchToLogin')}
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthMethod('email');
                  }}
                  className="text-sm text-theme-text-secondary hover:text-theme-accent-600 font-medium"
                >
                  {t('switchToSignup')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-theme-text-secondary">
            Australia 2026 - Shared Photo Album
          </p>
        </div>
      </div>
    </div>
  );
}
