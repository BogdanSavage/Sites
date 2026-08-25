export interface Place {
  id: string;
  name: string;
  category: string; // e.g., 'food', 'cafe', 'park', 'shopping', 'culture', 'other'
  status: 'want-to-go' | 'visited' | 'favorite';
  rating: number; // 1 to 5
  lat: number;
  lng: number;
  notes: string;
  collectionIds: string[]; // List of collection IDs this place belongs to
  createdAt: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color: string; // HSL or Hex string
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}
