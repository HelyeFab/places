'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { User, LogOut, Globe, Settings } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import Dropdown, { DropdownItem, DropdownDivider, DropdownLabel } from './ui/Dropdown';
import { useToast } from './ui/Toast';

interface UserMenuProps {
  user: {
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  };
  currentLocale: string;
}

export default function UserMenu({ user, currentLocale }: UserMenuProps) {
  const t = useTranslations('navigation');
  const router = useRouter();
  const { showToast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast(t('signedOut'), 'success');
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      showToast(t('signOutError'), 'error');
    }
  };

  const handleLanguageChange = (locale: string) => {
    // Set locale cookie
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    // Also store in localStorage as backup
    localStorage.setItem('locale', locale);
    // Reload to apply new locale
    window.location.reload();
  };

  const trigger = (
    <div className="flex items-center gap-2 hover:opacity-80 transition-opacity">
      {user.photoURL ? (
        <Image
          src={user.photoURL}
          alt={user.displayName || 'User'}
          width={32}
          height={32}
          className="rounded-full"
        />
      ) : (
        <div className="w-8 h-8 bg-theme-accent-600 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );

  return (
    <Dropdown trigger={trigger} align="right">
      {/* User Info */}
      <div className="px-4 py-3 border-b border-theme-border">
        <p className="text-sm font-medium text-theme-text-primary">{user.displayName || 'User'}</p>
        <p className="text-xs text-theme-text-secondary truncate">{user.email}</p>
      </div>

      {/* Language Selection */}
      <DropdownLabel>{t('language')}</DropdownLabel>
      <DropdownItem
        icon={<span className="text-lg">🇬🇧</span>}
        onClick={() => handleLanguageChange('en')}
      >
        <div className="flex items-center justify-between w-full">
          <span>English</span>
          {currentLocale === 'en' && (
            <span className="w-2 h-2 bg-theme-accent-600 rounded-full"></span>
          )}
        </div>
      </DropdownItem>
      <DropdownItem
        icon={<span className="text-lg">🇮🇹</span>}
        onClick={() => handleLanguageChange('it')}
      >
        <div className="flex items-center justify-between w-full">
          <span>Italiano</span>
          {currentLocale === 'it' && (
            <span className="w-2 h-2 bg-theme-accent-600 rounded-full"></span>
          )}
        </div>
      </DropdownItem>

      <DropdownDivider />

      {/* Sign Out */}
      <DropdownItem
        icon={<LogOut className="w-5 h-5" />}
        onClick={handleSignOut}
        variant="danger"
      >
        {t('signOut')}
      </DropdownItem>
    </Dropdown>
  );
}
