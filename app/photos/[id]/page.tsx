'use client';

import { useParams, useRouter } from 'next/navigation';
import { X, ArrowLeft } from 'lucide-react';

function photoUrl(id: string) {
  return "/api/photos/proxy?id=" + id;
}

export default function PhotoDetailPage() {
  const params = useParams();
  const router = useRouter();
  const photoId = params?.id as string;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Top bar */}
      <div className="absolute top-4 left-4 z-20">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => router.back()}
          className="p-3 bg-white/10 text-white rounded-full hover:bg-white/20 backdrop-blur-sm transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Full-screen image */}
      <img
        src={photoUrl(photoId)}
        alt="Photo"
        className="max-w-full max-h-full object-contain"
      />
    </div>
  );
}
