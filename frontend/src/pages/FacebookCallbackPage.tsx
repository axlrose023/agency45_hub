import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCode } from '@/api/facebook';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useI18n } from '@/i18n/locale';

export default function FacebookCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [error, setError] = useState('');

  useEffect(() => {
    const code = searchParams.get('code');
    const fbError = searchParams.get('error');

    if (fbError || !code) {
      setError(t('facebookConnectError'));
      return;
    }

    const redirectUri = `${window.location.origin}/facebook/callback`;

    exchangeCode(code, redirectUri)
      .then(() => {
        navigate('/dashboard', { replace: true });
      })
      .catch(() => {
        setError(t('facebookConnectError'));
      });
  }, [searchParams, navigate, t]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-brand-gray-50 p-4">
        <div className="bg-white rounded-2xl border border-brand-gray-200 p-8 sm:p-10 text-center shadow-sm max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-red-500" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>
          <h2 className="text-xl font-heading font-bold text-brand-black mb-2">
            {t('facebookConnectError')}
          </h2>
          <button
            type="button"
            onClick={() => navigate('/dashboard', { replace: true })}
            className="mt-6 w-full h-10 bg-brand-black text-white rounded-xl text-sm font-heading font-medium hover:bg-brand-gray-800 transition-colors"
          >
            {t('backToAccounts')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-gray-50">
      <LoadingSpinner size="lg" />
    </div>
  );
}
