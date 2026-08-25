import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import type { Place, Collection } from '../types'
import { CATEGORIES } from '../utils/storage'

interface PlaceDetailPageProps {
  places: Place[]
  collections: Collection[]
  onDeletePlace: (id: string) => void
  onUpdatePlace: (updated: Place) => void
}

const STATUS_OPTIONS: { value: Place['status']; label: string; icon: string }[] = [
  { value: 'want-to-go', label: 'À visiter', icon: '📌' },
  { value: 'visited', label: 'Visité', icon: '✓' },
  { value: 'favorite', label: 'Coup de cœur', icon: '⭐' },
]

export default function PlaceDetailPage({
  places,
  collections,
  onDeletePlace,
  onUpdatePlace,
}: PlaceDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const place = places.find((p) => p.id === id)

  // ── edit state (null = view mode, populated = edit mode)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editStatus, setEditStatus] = useState<Place['status']>('visited')
  const [editRating, setEditRating] = useState(3)
  const [editNeighborhood, setEditNeighborhood] = useState('')
  const [editTagsInput, setEditTagsInput] = useState('')
  const [editLat, setEditLat] = useState(0)
  const [editLng, setEditLng] = useState(0)
  const [editNotes, setEditNotes] = useState('')

  if (!place) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <p>Lieu introuvable.</p>
          <Link to="/places" className="btn-primary" style={{ marginTop: 16 }}>
            ← Retour aux lieux
          </Link>
        </div>
      </div>
    )
  }

  const cat = CATEGORIES.find((c) => c.id === place.category)

  // ── enter edit mode
  const startEdit = () => {
    setEditName(place.name)
    setEditCategory(place.category)
    setEditStatus(place.status)
    setEditRating(place.rating || 3)
    setEditLat(place.lat)
    setEditLng(place.lng)
    setEditNotes(place.notes || '')
    setEditing(true)
  }

  // ── save edits
  const saveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    const updated: Place = {
      ...place,
      name: editName.trim(),
      category: editCategory,
      status: editStatus,
      rating: editStatus === 'want-to-go' ? 0 : editRating,
      lat: editLat,
      lng: editLng,
      notes: editNotes.trim(),
    }
    onUpdatePlace(updated)
    setEditing(false)
  }

  // ── delete
  const handleDelete = () => {
    if (window.confirm(`Supprimer « ${place.name} » ? Cette action est irréversible.`)) {
      onDeletePlace(place.id)
      navigate('/places')
    }
  }

  // ── collection toggle (persisted via full-place update)
  const handleCollectionToggle = (colId: string) => {
    const has = place.collectionIds.includes(colId)
    const newIds = has
      ? place.collectionIds.filter((c) => c !== colId)
      : [...place.collectionIds, colId]
    onUpdatePlace({ ...place, collectionIds: newIds })
  }

  return (
    <div className="page-container detail-page">
      {/* ─── top action bar ─────────────────────────── */}
      <div className="detail-topbar">
        <Link to="/places" className="back-link">← Lieux</Link>
        <div className="detail-topbar-actions">
          {!editing && (
            <button className="btn-ghost" onClick={startEdit}>✏️ Modifier</button>
          )}
          <button className="btn-danger-sm" onClick={handleDelete}>🗑️ Supprimer</button>
        </div>
      </div>

      {/* ─── VIEW MODE ──────────────────────────────── */}
      {!editing && (
        <>
          {/* hero card */}
          <div className="detail-hero" style={{ borderLeft: `6px solid ${cat?.color}` }}>
            <span className="detail-hero-icon">{cat?.icon}</span>
            <div className="detail-hero-text">
              <h2 className="detail-hero-name">{place.name}</h2>
              <div className="detail-hero-sub">
                <span style={{ color: cat?.color, fontWeight: 700, fontSize: 12 }}>{cat?.name}</span>
              </div>
            </div>
          </div>

          {/* status + rating row */}
          <div className="detail-meta-row">
            <div className="detail-meta-block">
              <span className="section-label">Statut</span>
              <span className="status-pill" data-status={place.status}>
                {STATUS_OPTIONS.find((s) => s.value === place.status)?.icon}{' '}
                {STATUS_OPTIONS.find((s) => s.value === place.status)?.label}
              </span>
            </div>
            {place.status !== 'want-to-go' && (
              <div className="detail-meta-block">
                <span className="section-label">Note</span>
                <span className="detail-stars">
                  {'★'.repeat(place.rating)}{'☆'.repeat(5 - place.rating)}
                </span>
              </div>
            )}
          </div>

         
          {/* coordinates */}
          <div className="detail-block">
            <span className="section-label">Coordonnées</span>
            <div className="coordinates-tag">
              <span>📍 {place.lat.toFixed(5)}, {place.lng.toFixed(5)}</span>
              <a
                href={`https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}#map=16/${place.lat}/${place.lng}`}
                target="_blank"
                rel="noreferrer"
                className="coord-link"
              >
                Ouvrir dans OSM ↗
              </a>
            </div>
          </div>

          {/* notes */}
          {place.notes ? (
            <div className="detail-block">
              <span className="section-label">Notes privées</span>
              <p className="detail-notes-text">{place.notes}</p>
            </div>
          ) : (
            <div className="detail-block empty-notes-cta" onClick={startEdit}>
              <span className="section-label">Notes privées</span>
              <p className="empty-notes-hint">Appuyez sur ✏️ Modifier pour ajouter des conseils, mot de passe Wi-Fi...</p>
            </div>
          )}

          {/* collections */}
          <div className="detail-block">
            <span className="section-label">Collections</span>
            {collections.length === 0 ? (
              <p className="detail-notes-text muted">
                Aucune collection —{' '}
                <Link to="/collections" className="inline-link">créez-en une</Link>.
              </p>
            ) : (
              <div className="collections-checkbox-grid">
                {collections.map((col) => {
                  const checked = place.collectionIds.includes(col.id)
                  return (
                    <label key={col.id} className={`collection-checkbox-item ${checked ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleCollectionToggle(col.id)}
                      />
                      <span className="color-dot" style={{ backgroundColor: col.color }} />
                      <span className="col-name">{col.name}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── EDIT MODE ──────────────────────────────── */}
      {editing && (
        <form onSubmit={saveEdit} className="standard-form edit-form">
          <h3 className="edit-form-title">Modification : {place.name}</h3>

          <div className="form-group">
            <label>Nom du lieu</label>
            <input
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Nom du lieu"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Catégorie</label>
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Statut</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value as Place['status'])}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {editStatus !== 'want-to-go' && (
            <div className="form-group">
              <label>Note</label>
              <div className="stars-input">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`star-select-btn ${editRating >= n ? 'active' : ''}`}
                    onClick={() => setEditRating(n)}
                  >★</button>
                ))}
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Quartier</label>
              <input
                value={editNeighborhood}
                onChange={(e) => setEditNeighborhood(e.target.value)}
                placeholder="ex. Pigalle"
              />
            </div>
            <div className="form-group">
              <label>Tags (séparés par une virgule)</label>
              <input
                value={editTagsInput}
                onChange={(e) => setEditTagsInput(e.target.value)}
                placeholder="wifi, terrasse, calme"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Latitude</label>
              <input
                type="number"
                step="any"
                value={editLat}
                onChange={(e) => setEditLat(+e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Longitude</label>
              <input
                type="number"
                step="any"
                value={editLng}
                onChange={(e) => setEditLng(+e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes privées</label>
            <textarea
              rows={4}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Wi-Fi, astuces d'accès..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setEditing(false)}>
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              Enregistrer les modifications
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
