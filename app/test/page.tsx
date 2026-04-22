'use client';

import { useTranslations } from 'next-intl';
import { FlaskConical } from 'lucide-react';

export default function TestPage() {
  const t = useTranslations('navigation');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-8 flex items-center gap-3">
        <FlaskConical className="w-8 h-8 text-theme-accent-600" />
        <h1 className="text-3xl md:text-4xl font-bold">{t('test')}</h1>
      </div>

      <div className="p-6 rounded-lg border border-theme-border bg-theme-bg-secondary">
        <p className="text-theme-text-secondary">
          This is a placeholder test page used to verify that new routes can be
          added to the places app and reach production via Cloudflare Tunnel.
        </p>
      </div>
    </div>
  );
}
