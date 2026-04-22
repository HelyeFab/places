import placesData from '@/data/japan-places.json';

export interface Place {
  slug: string;
  name: string;
  nameJa: string;
  prefecture: string;
  lat: number;
  lng: number;
  aliases: string[];
  notes: string[];
}

export const PLACES: Place[] = placesData as Place[];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\s\-_/()']/g, '')
    .replace(/[`]/g, '');
}

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .normalize('NFKC')
    .split(/[\s\-_/()',.]+/)
    .map((t) => t.replace(/[`']/g, ''))
    .filter((t) => t.length >= 2);
}

export function matchAlbumToPlace(albumName: string): Place | null {
  if (!albumName) return null;

  const albumNorm = normalize(albumName);
  if (!albumNorm) return null;
  const albumTokens = new Set(tokens(albumName));

  for (const p of PLACES) {
    for (const c of [p.name, p.nameJa, p.slug, ...p.aliases]) {
      if (normalize(c) === albumNorm) return p;
    }
  }

  if (albumTokens.size === 0) return null;
  for (const p of PLACES) {
    for (const c of [p.name, p.nameJa, p.slug, ...p.aliases]) {
      const cTokens = tokens(c);
      if (cTokens.length === 0) continue;
      if (cTokens.every((t) => albumTokens.has(t))) return p;
    }
  }

  return null;
}
