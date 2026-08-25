import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Collection, Place } from '../types'

interface CollectionsPageProps {
  collections: Collection[]
  places: Place[]
  onCreateCollection: (col: Collection) => void
  onDeleteCollection: (id: string) => void
}

const PALETTE = [
  '#EF4444', '#F97316', '#F59E0B',
  '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#6B7280',
]

export default function CollectionsPage({
  collections,
  places,
  onCreateCollection,
  onDeleteCollection,
}: CollectionsPageProps) {
  // ── create-form state
  const [showForm, setShowForm] = useState(false)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formColor, setFormColor] = useState(PALETTE[0])

  // ── which collection is expanded (showing place list)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return
    onCreateCollection({
      id: `col-${Date.now()}`,
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      color: formColor,
      createdAt: Date.now(),
    })
    setFormName('')
    setFormDescription('')
    setFormColor(PALETTE[0])
    setShowForm(false)
  }

  const handleDelete = (col: Collection) => {
    if (
      window.confirm(
        `Supprimer la collection « ${col.name} » ? Les lieux de cette collection ne seront pas supprimés.`
      )
    ) {
      onDeleteCollection(col.id)
      if (expandedId === col.id) setExpandedId(null)
    }
  }

  const placesInCollection = (colId: string) =>
    places.filter((p) => p.collectionIds.includes(colId))

  return (
    <div className="page-container collections-page">
      {/* ── header ── */}
      <div className="page-header">
        <h1>Collections ({collections.length})</h1>
        <button
          className="btn-primary-sm"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? '✕ Annuler' : '➕ Nouvelle collection'}
        </button>
      </div>

      {/* ── create form ── */}
      {showForm && (
        <form onSubmit={handleCreate} className="standard-form card-form">
          <h3>Nouvelle collection</h3>

          <div className="form-group">
            <label>Nom</label>
            <input
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="ex. Meilleurs cafés de Paris"
            />
          </div>

          <div className="form-group">
            <label>Description (optionnel)</label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="De quoi s'agit-il dans cette collection ?"
            />
          </div>

          <div className="form-group">
            <label>Couleur d'accent</label>
            <div className="color-selectors">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-dot-btn ${formColor === c ? 'active' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setFormColor(c)}
                  title={c}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary">
            Créer la collection
          </button>
        </form>
      )}

      {/* ── empty state ── */}
      {collections.length === 0 && !showForm && (
        <div className="empty-state">
          <span className="empty-icon">📁</span>
          <p>Aucune collection pour le moment.</p>
          <p className="muted" style={{ fontSize: 13 }}>
            Créez-en une pour regrouper vos lieux favoris par thématique.
          </p>
        </div>
      )}

      {/* ── collection cards ── */}
      <div className="collections-grid">
        {collections.map((col) => {
          const members = placesInCollection(col.id)
          const isExpanded = expandedId === col.id

          return (
            <div key={col.id} className="collection-card" style={{ borderTop: `4px solid ${col.color}` }}>
              {/* card header */}
              <div className="collection-card-header">
                <button
                  className="col-name-btn"
                  onClick={() => setExpandedId(isExpanded ? null : col.id)}
                >
                  <h3>{col.name}</h3>
                  <span className="col-chevron">{isExpanded ? '▲' : '▼'}</span>
                </button>
                <button
                  className="delete-col-btn"
                  onClick={() => handleDelete(col)}
                  title="Supprimer la collection"
                >
                  ✕
                </button>
              </div>

              {col.description && (
                <p className="col-desc">{col.description}</p>
              )}

              {/* badge row */}
              <div className="col-badge-row">
                <span
                  className="col-count-badge"
                  style={{ backgroundColor: col.color + '18', color: col.color }}
                >
                  📌 {members.length} {members.length === 1  ? 'lieu' : 'lieux'}
                </span>
                <Link to="/places" className="col-add-places-link">
                  + Voir les lieux enregistrés
                </Link>
              </div>

              {/* expanded place list */}
              {isExpanded && (
                <div className="col-places-list">
                  {members.length === 0 ? (
                    <p className="col-empty-hint">
                      Aucun lieu associé pour l'instant. Ouvrez la vue détaillée d'un lieu et cochez cette collection.
                    </p>
                  ) : (
                    members.map((p) => (
                      <Link key={p.id} to={`/places/${p.id}`} className="col-place-item">
                        <span>{p.name}</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
