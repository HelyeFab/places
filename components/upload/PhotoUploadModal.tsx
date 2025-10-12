'use client';

import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';
import PhotoUploadForm from '@/components/upload/PhotoUploadForm';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumId?: string;
}

export default function PhotoUploadModal({
  isOpen,
  onClose,
  albumId,
}: PhotoUploadModalProps) {
  const t = useTranslations('upload');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('title')}
      size="xl"
    >
      <PhotoUploadForm onSuccess={onClose} preselectedAlbumId={albumId} />
    </Modal>
  );
}
