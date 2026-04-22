'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { Place } from '@/lib/places-match';

const defaultIcon = L.icon({
  iconUrl: icon.src,
  iconRetinaUrl: iconRetina.src,
  shadowUrl: iconShadow.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const JAPAN_BOUNDS: L.LatLngBoundsLiteral = [
  [24.0, 123.0],
  [46.0, 146.0],
];

interface Props {
  places: Place[];
}

export default function JapanMap({ places }: Props) {
  return (
    <MapContainer
      bounds={JAPAN_BOUNDS}
      style={{ height: '70vh', width: '100%', borderRadius: '0.75rem' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        subdomains={['a', 'b', 'c', 'd']}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={20}
      />

      {places.map((p) => (
        <Marker key={p.slug} position={[p.lat, p.lng]}>
          <Popup>
            <div style={{ minWidth: '180px' }}>
              <div style={{ fontWeight: 600 }}>
                {p.name}
                {p.nameJa && (
                  <span style={{ fontWeight: 400 }}> ({p.nameJa})</span>
                )}
              </div>
              <div style={{ fontSize: '0.85em', color: '#666' }}>{p.prefecture}</div>
              {p.notes.length > 0 && (
                <ul
                  style={{
                    margin: '0.5em 0 0',
                    paddingLeft: '1.2em',
                    fontSize: '0.85em',
                  }}
                >
                  {p.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
