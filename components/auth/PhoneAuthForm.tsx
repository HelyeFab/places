'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function PhoneAuthForm() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    // Initialize reCAPTCHA verifier when component mounts
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal',
          callback: () => {
            // reCAPTCHA solved - do nothing, user will click send button
          },
          'expired-callback': () => {
            setError(t('error', { message: 'reCAPTCHA expired. Please try again.' }));
          },
        });
      } catch (error) {
        console.error('Error initializing reCAPTCHA:', error);
      }
    }

    // Cleanup on unmount
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    };
  }, []);

  const validatePhoneNumber = (phone: string): boolean => {
    // E.164 format: +[country code][number]
    return /^\+?[1-9]\d{1,14}$/.test(phone);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!phoneNumber) {
      setError(t('emailRequired')); // Using emailRequired as placeholder
      return;
    }
    if (!validatePhoneNumber(phoneNumber)) {
      setError(t('invalidPhone'));
      return;
    }

    setLoading(true);

    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setCodeSent(true);
    } catch (error: any) {
      console.error('Error sending verification code:', error);

      switch (error.code) {
        case 'auth/invalid-phone-number':
          setError(t('invalidPhone'));
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

      // Reset reCAPTCHA on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = undefined;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!verificationCode) {
      setError(t('error', { message: 'Verification code is required' }));
      return;
    }

    if (!confirmationResult) {
      setError(t('error', { message: 'Please request a verification code first' }));
      return;
    }

    setLoading(true);

    try {
      await confirmationResult.confirm(verificationCode);
      router.push('/');
    } catch (error: any) {
      console.error('Error verifying code:', error);

      switch (error.code) {
        case 'auth/invalid-verification-code':
          setError(t('invalidActionCode'));
          break;
        case 'auth/code-expired':
          setError(t('invalidActionCode'));
          break;
        default:
          setError(t('error', { message: error.message }));
      }
    } finally {
      setLoading(false);
    }
  };

  if (codeSent) {
    return (
      <div className="w-full">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
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
              <p className="text-sm font-medium text-green-800">{t('codeSent')}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleVerifyCode} className="space-y-4">
          <div>
            <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-1">
              {t('verificationCode')}
            </label>
            <input
              type="text"
              id="verification-code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder={t('enterCode')}
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
              t('verifyCode')
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setCodeSent(false);
              setVerificationCode('');
              setConfirmationResult(null);
            }}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('backToLogin')}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSendCode} className="space-y-4">
        <div>
          <label htmlFor="phone-number" className="block text-sm font-medium text-gray-700 mb-1">
            {t('phoneNumber')}
          </label>
          <input
            type="tel"
            id="phone-number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder={t('enterPhone')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            {t('invalidPhone')}
          </p>
        </div>

        <div id="recaptcha-container" className="flex justify-center"></div>

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
            t('sendVerificationCode')
          )}
        </button>
      </form>
    </div>
  );
}

// Extend Window interface to include recaptchaVerifier
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier | undefined;
  }
}
