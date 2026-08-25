import type { Place, Collection, Category } from '../types'

export const CATEGORIES: Category[] = [
  { id: 'food', name: 'Restaurants', icon: '🍔', color: '#EF4444' },
  { id: 'cafe', name: 'Cafés', icon: '☕', color: '#B45309' },
  { id: 'park', name: 'Nature', icon: '🌲', color: '#10B981' },
  { id: 'shopping', name: 'Boutiques', icon: '🛍️', color: '#8B5CF6' },
  { id: 'culture', name: 'Culture', icon: '🏛️', color: '#3B82F6' },
  { id: 'contacts', name: 'Contacts', icon: '👤', color: '#0EA5E9' },
  { id: 'other', name: 'Autre', icon: '📍', color: '#6B7280' },
]

export const DEMO_COLLECTIONS: Collection[] = [
  {
    id: 'col-1',
    name: '☕ Cafés pour travailler',
    description: 'Cafes avec bon Wi-Fi, prises électriques et excellent café.',
    color: '#B45309',
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'col-2',
    name: '🌲 Balades du week-end',
    description: 'Beaux espaces verts et parcours agréables pour se déconnecter.',
    color: '#10B981',
    createdAt: Date.now() - 86400000 * 4,
  },
  {
    id: 'col-3',
    name: '🍔 Bonnes tables du vendredi',
    description: 'Adresses gourmandes et conviviales pour fêter la fin de semaine.',
    color: '#EF4444',
    createdAt: Date.now() - 86400000 * 3,
  }
]

export const DEMO_PLACES: Place[] = [
  {
    id: 'place-1',
    name: 'Domicile',
    category: 'contact',
    status: 'favorite',
    rating: 5,
    lat: 50.297038,
    lng: 2.895968,
    notes: '',
    collectionIds: ['col-1'],
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'place-2',
    name: 'Parc des Buttes-Chaumont',
    category: 'park',
    status: 'visited',
    rating: 5,
    lat: 48.8809,
    lng: 2.3828,
    notes: 'Magnifiques falaises escarpées, pont suspendu et belvédère offrant une vue panoramique sur Paris.',
    collectionIds: ['col-2'],
    createdAt: Date.now() - 86400000 * 1,
  },
  {
    id: 'place-3',
    name: 'Blend Hamburger Pigalle',
    category: 'food',
    status: 'visited',
    rating: 4,
    lat: 48.8819,
    lng: 2.3364,
    notes: 'Burgers gourmets préparés avec des fromages affinés. Les frites de patates douces sont incontournables.',
    collectionIds: ['col-3'],
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'place-4',
    name: 'La Recyclerie',
    category: 'cafe',
    status: 'want-to-go',
    rating: 4,
    lat: 48.8979,
    lng: 2.3486,
    notes: 'Ambiance tiers-lieu et co-working dans une ancienne gare réaménagée. Belle démarche éco-responsable.',
    collectionIds: ['col-1'],
    createdAt: Date.now() - 3600000 * 2,
  }
]

const PLACES_KEY = 'local_places'
const COLLECTIONS_KEY = 'local_collections'

export function loadPlaces(): Place[] {
  const data = localStorage.getItem(PLACES_KEY)
  if (!data) {
    savePlaces(DEMO_PLACES)
    return DEMO_PLACES
  }
  try {
    return JSON.parse(data)
  } catch (e) {
    console.error('Échec de la lecture des données de lieux', e)
    return []
  }
}

export function savePlaces(places: Place[]): void {
  localStorage.setItem(PLACES_KEY, JSON.stringify(places))
}

export function loadCollections(): Collection[] {
  const data = localStorage.getItem(COLLECTIONS_KEY)
  if (!data) {
    saveCollections(DEMO_COLLECTIONS)
    return DEMO_COLLECTIONS
  }
  try {
    return JSON.parse(data)
  } catch (e) {
    console.error('Échec de la lecture des données de collections', e)
    return []
  }
}

export function saveCollections(collections: Collection[]): void {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections))
}

export function resetToDemoData(): void {
  savePlaces(DEMO_PLACES)
  saveCollections(DEMO_COLLECTIONS)
}
