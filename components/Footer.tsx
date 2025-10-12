import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('landing.footer');

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600">
          <p className="text-sm">
            🇦🇺 {t('title')}
          </p>
          <p className="text-xs mt-2 text-gray-500">
            {t('description')}
          </p>
        </div>
      </div>
    </footer>
  );
}
