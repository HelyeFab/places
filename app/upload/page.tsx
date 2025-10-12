import { useTranslations } from 'next-intl';
import PhotoUploadForm from '@/components/upload/PhotoUploadForm';

export default function UploadPage() {
  const t = useTranslations('upload');

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">{t('title')}</h1>
      <PhotoUploadForm />
    </div>
  );
}
