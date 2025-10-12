'use client';

import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

// Fix for default marker icon issue in Leaflet
const pin = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

type Photo = {
  id: string;
  url: string;
  caption?: string;
  lat?: number | null;
  lng?: number | null;
  place?: string | null;
  userId: string;
  visibility: 'public' | 'friends' | 'hidden';
  createdAt: any;
};

export default function MapView() {
  const [user] = useAuthState(auth);
  const t = useTranslations('pages.map');
  const [points, setPoints] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGeotaggedPhotos = async () => {
      setLoading(true);

      try {
        // First, get all public photos
        const publicQuery = query(
          collection(db, 'photos'),
          where('visibility', '==', 'public'),
          orderBy('createdAt', 'desc')
        );

        const publicSnapshot = await getDocs(publicQuery);
        let allPhotos = publicSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Photo[];

        // If user is authenticated, also get their own photos
        if (user) {
          const userQuery = query(
            collection(db, 'photos'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc')
          );

          const userSnapshot = await getDocs(userQuery);
          const userPhotos = userSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Photo[];

          // Merge and deduplicate
          const photoMap = new Map<string, Photo>();
          [...allPhotos, ...userPhotos].forEach((photo) => {
            photoMap.set(photo.id, photo);
          });
          allPhotos = Array.from(photoMap.values());
        }

        // Filter to only photos with coordinates
        const geotaggedPhotos = allPhotos.filter(
          (photo) => photo.lat != null && photo.lng != null
        );

        setPoints(geotaggedPhotos);
      } catch (err) {
        console.error('Error loading geotagged photos:', err);
      } finally {
        setLoading(false);
      }
    };

    loadGeotaggedPhotos();
  }, [user]);

  // Default center: Sydney, Australia (most likely visit)
  // Will be overridden if we have photos
  const defaultCenter: [number, number] = [-33.8688, 151.2093]; // Sydney
  const center: [number, number] = points.length > 0 && points[0].lat && points[0].lng
    ? [points[0].lat, points[0].lng]
    : defaultCenter;

  if (loading) {
    return (
      <div className="h-[70vh] rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="h-[70vh] rounded-xl bg-gray-100 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-lg text-gray-600 mb-2">No geotagged photos yet</p>
          <p className="text-sm text-gray-500">Upload photos with location data to see them on the map</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[70vh] rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {points.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.lat as number, photo.lng as number]}
            icon={pin}
          >
            <Popup>
              <div className="text-sm min-w-[200px]">
                {photo.place && (
                  <div className="font-semibold mb-2 text-gray-900">{photo.place}</div>
                )}

                <div className="mb-2">
                  <img
                    src={photo.url}
                    alt={photo.caption || 'Photo'}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>

                {photo.caption && (
                  <div className="text-gray-700 mb-2 line-clamp-2">{photo.caption}</div>
                )}

                <Link
                  href={`/photos/${photo.id}`}
                  className="inline-block text-blue-600 hover:text-blue-700 font-medium"
                >
                  View Photo →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
