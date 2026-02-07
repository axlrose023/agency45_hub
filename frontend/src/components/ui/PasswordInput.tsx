import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useI18n } from '@/i18n/locale';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
}

export default function PasswordInput({
  value,
  onChange,
  placeholder,
  id,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const { t } = useI18n();

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? t('passwordLabel')}
        className="w-full border border-brand-gray-300 rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-black focus:border-transparent pr-12 transition-colors"
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400 hover:text-brand-black transition-colors cursor-pointer"
      >
        {visible ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}
