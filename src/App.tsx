import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import type { Place, Collection } from './types'
import {
  loadPlaces,
  savePlaces,
  loadCollections,
  saveCollections,
} from './utils/storage'

// Page Components
import MapPage from './pages/MapPage'
import PlacesPage from './pages/PlacesPage'
import PlaceDetailPage from './pages/PlaceDetailPage'
import AddPlacePage from './pages/AddPlacePage'
import CollectionsPage from './pages/CollectionsPage'

export default function App() {
  const [places, setPlaces] = useState<Place[]>(() => loadPlaces())
  const [collections, setCollections] = useState<Collection[]>(() => loadCollections())

  // Persist places changes
  useEffect(() => {
    savePlaces(places)
  }, [places])

  // Persist collections changes
  useEffect(() => {
    saveCollections(collections)
  }, [collections])

  const handleAddPlace = (newPlace: Place) => {
    setPlaces((prev) => [newPlace, ...prev])
  }

  const handleDeletePlace = (id: string) => {
    setPlaces((prev) => prev.filter((p) => p.id !== id))
  }

  const handleUpdatePlace = (updated: Place) => {
    setPlaces((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
  }

  const handleCreateCollection = (newCol: Collection) => {
    setCollections((prev) => [newCol, ...prev])
  }

  const handleDeleteCollection = (id: string) => {
    setCollections((prev) => prev.filter((c) => c.id !== id))
    // Remove reference from places
    setPlaces((prev) =>
      prev.map((p) => ({
        ...p,
        collectionIds: p.collectionIds.filter((cid) => cid !== id),
      }))
    )
  }

  return (
    <HashRouter>
      <div className="app-container">
        <header className="app-header">
          <div className="header-brand">
            <span className="brand-logo">🗺️</span>
            <h2>Mes Lieux Favoris</h2>
          </div>
        </header>

        <main className="content">
          <Routes>
            <Route path="/" element={<MapPage places={places} />} />
            <Route path="/places" element={<PlacesPage places={places} />} />
            <Route
              path="/places/:id"
              element={
                <PlaceDetailPage
                  places={places}
                  collections={collections}
                  onDeletePlace={handleDeletePlace}
                  onUpdatePlace={handleUpdatePlace}
                />
              }
            />
            <Route path="/add-place" element={<AddPlacePage onAddPlace={handleAddPlace} />} />
            <Route
              path="/collections"
              element={
                <CollectionsPage
                  collections={collections}
                  places={places}
                  onCreateCollection={handleCreateCollection}
                  onDeleteCollection={handleDeleteCollection}
                />
              }
            />
          </Routes>
        </main>

        <NavBar />
      </div>
    </HashRouter>
  )
}

function NavBar() {
  const location = useLocation()

  return (
    <nav className="bottom-nav">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <span className="nav-icon">🗺️</span>
        <span className="nav-label">Carte</span>
      </Link>
      <Link to="/places" className={`nav-item ${location.pathname.startsWith('/places') ? 'active' : ''}`}>
        <span className="nav-icon">⭐</span>
        <span className="nav-label">Lieux</span>
      </Link>
      <Link to="/add-place" className={`nav-item ${location.pathname === '/add-place' ? 'active' : ''}`}>
        <span className="nav-icon">➕</span>
        <span className="nav-label">Ajouter</span>
      </Link>
      <Link to="/collections" className={`nav-item ${location.pathname === '/collections' ? 'active' : ''}`}>
        <span className="nav-icon">📁</span>
        <span className="nav-label">Collections</span>
      </Link>
    </nav>
  )
}
