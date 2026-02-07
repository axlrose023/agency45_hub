import { useEffect, useState } from 'react';
import { getFacebookAuthStatus } from '@/api/facebook';
import { useI18n } from '@/i18n/locale';
import { cn } from '@/utils/cn';

const FB_OAUTH_URL = 'https://www.facebook.com/v21.0/dialog/oauth';
const FB_SCOPES = 'ads_read,ads_management,business_management';

function getRedirectUri() {
  return `${window.location.origin}/facebook/callback`;
}

interface FacebookConnectProps {
  onConnected: () => void;
}

export default function FacebookConnect({ onConnected }: FacebookConnectProps) {
  const { t } = useI18n();
  const [appId, setAppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFacebookAuthStatus()
      .then((status) => {
        setAppId(status.app_id);
        if (status.connected) {
          onConnected();
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [onConnected]);

  const handleLogin = () => {
    if (!appId) return;
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: getRedirectUri(),
      scope: FB_SCOPES,
      response_type: 'code',
      state: crypto.randomUUID(),
    });
    window.location.href = `${FB_OAUTH_URL}?${params.toString()}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-brand-gray-200 p-8 sm:p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-[#1877F2]/10 flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#1877F2]" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </div>

          <h2 className="text-xl font-heading font-bold text-brand-black mb-2">
            {t('facebookNotConnected')}
          </h2>
          <p className="text-sm text-brand-gray-500 font-body mb-8">
            {t('facebookNotConnectedDescription')}
          </p>

          <button
            type="button"
            onClick={handleLogin}
            disabled={loading || !appId}
            className={cn(
              'w-full h-12 rounded-xl text-white font-heading font-semibold text-sm transition-all',
              'bg-[#1877F2] hover:bg-[#166FE5] active:bg-[#1565D8]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center justify-center gap-3',
            )}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            {t('facebookConnectButton')}
          </button>
        </div>
      </div>
    </div>
  );
}
