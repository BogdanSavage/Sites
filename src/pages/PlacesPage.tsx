import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { Place } from '../types'
import { CATEGORIES } from '../utils/storage'

interface PlacesPageProps {
  places: Place[]
}

export default function PlacesPage({ places }: PlacesPageProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | Place['status']>('all')

  const filteredPlaces = places.filter((place) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      place.name.toLowerCase().includes(q) ||
      place.notes.toLowerCase().includes(q)

    const matchesCategory = selectedCategory === 'all' || place.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || place.status === selectedStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusLabel = (status: Place['status']) => {
    switch (status) {
      case 'want-to-go':
        return '📌 À visiter'
      case 'visited':
        return '✓ Visité'
      case 'favorite':
        return '⭐ Coup de cœur'
      default:
        return ''
    }
  }

  return (
    <div className="page-container places-page">
      <div className="page-header">
        <h1>Lieux enregistrés ({places.length})</h1>
        <Link to="/add-place" className="btn-primary-sm">
          ➕ Ajouter un lieu
        </Link>
      </div>

      <div className="list-search-filters">
        <input
          type="search"
          placeholder="Rechercher par nom"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        {/* Category Filters */}
        <div className="filter-group-row">
          <span className="filter-label-inline">Catégorie :</span>
          <div className="filter-chips">
            <button
              className={`filter-chip ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              Tout
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                className={`filter-chip ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filters */}
        <div className="filter-group-row">
          <span className="filter-label-inline">Statut :</span>
          <div className="filter-chips">
            <button
              className={`filter-chip ${selectedStatus === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('all')}
            >
              Tout
            </button>
            <button
              className={`filter-chip ${selectedStatus === 'want-to-go' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('want-to-go')}
            >
              📌 À visiter
            </button>
            <button
              className={`filter-chip ${selectedStatus === 'visited' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('visited')}
            >
              ✓ Visité
            </button>
            <button
              className={`filter-chip ${selectedStatus === 'favorite' ? 'active' : ''}`}
              onClick={() => setSelectedStatus('favorite')}
            >
              ⭐ Coup de cœur
            </button>
          </div>
        </div>
      </div>

      <div className="places-list">
        {places.length === 0 ? (
          /* ── no places at all ── */
          <div className="empty-state">
            <span className="empty-icon">🗺️</span>
            <p style={{ fontWeight: 700 }}>Aucun lieu enregistré pour le moment.</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center' }}>
              Touchez la carte pour épingler votre première adresse, ou utilisez Ajouter ➕ ci-dessus.
            </p>
            <Link to="/add-place" className="btn-primary" style={{ marginTop: 8 }}>
              ➕ Ajouter un premier lieu
            </Link>
          </div>
        ) : filteredPlaces.length === 0 ? (
          /* ── filter / search miss ── */
          <div className="empty-state">
            <span className="empty-icon">🔍</span>
            <p style={{ fontWeight: 700 }}>Aucun résultat trouvé.</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Essayez d'ajuster vos filtres ou vos termes de recherche.
            </p>
          </div>
        ) : (
          filteredPlaces.map((place) => {
            const cat = CATEGORIES.find(c => c.id === place.category)
            return (
              <div
                key={place.id}
                className="place-item-card clickable-place-card"
                onClick={() => navigate(`/places/${place.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/places/${place.id}`)
                  }
                }}
              >
                <div className="place-item-main">
                  <div
                    className="category-indicator"
                    style={{
                      backgroundColor: (cat?.color ?? '#6B7280') + '15',
                      color: cat?.color,
                    }}
                  >
                    {cat?.icon || '📍'}
                  </div>
                  <div className="place-item-details">
                    <div className="place-title-row">
                      <h3>{place.name}</h3>
                    </div>
                    <div className="place-meta-subrow">
                      <span className="category-label" style={{ color: cat?.color }}>
                        {cat?.name}
                      </span>
                      <span className="status-indicator-tag">{getStatusLabel(place.status)}</span>
                    </div>
                  </div>
                </div>
                <div className="place-item-meta">
                  {place.status !== 'want-to-go' && place.rating > 0 && (
                    <div className="star-rating">
                      {'★'.repeat(place.rating)}{'☆'.repeat(5 - place.rating)}
                    </div>
                  )}
                  <div className="place-card-buttons">
                    <button
                      type="button"
                      className="btn-map-shortcut"
                      title="Voir sur la carte"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('/', { state: { center: [place.lat, place.lng] } })
                      }}
                    >
                      🗺️ Carte
                    </button>
                    <span className="view-detail-link">Détails ➔</span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
