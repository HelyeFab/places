import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="bg-theme-bg-secondary border-t border-theme-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-theme-text-secondary">
          <p className="text-sm">
            🇦🇺 {t('title')}
          </p>
          <p className="text-xs mt-2 text-theme-text-tertiary">
            {t('description')}
          </p>
        </div>
      </div>
    </footer>
  );
}
