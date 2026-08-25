import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Place } from '../types'
import { CATEGORIES } from '../utils/storage'

interface AddPlacePageProps {
  onAddPlace: (place: Place) => void
}

export default function AddPlacePage({ onAddPlace }: AddPlacePageProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [name, setName] = useState('')
  const [category, setCategory] = useState('food')
  const [status, setStatus] = useState<Place['status']>('want-to-go')
  const [rating, setRating] = useState(5)
  const [lat, setLat] = useState(48.8566)
  const [lng, setLng] = useState(2.3522)
  const [notes, setNotes] = useState('')

  // Sync coords from query params if available
  useEffect(() => {
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    if (latParam) setLat(+latParam)
    if (lngParam) setLng(+lngParam)
  }, [searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newPlace: Place = {
      id: `place-${Date.now()}`,
      name: name.trim(),
      category,
      status,
      rating: status === 'want-to-go' ? 0 : rating, // Reset rating to 0 if want to go
      lat,
      lng,
      notes: notes.trim(),
      collectionIds: [],
      createdAt: Date.now()
    }

    onAddPlace(newPlace)
    navigate('/places')
  }

  return (
    <div className="page-container add-place-page">
      <div className="page-header">
        <h1>Ajouter un lieu</h1>
      </div>

      <form onSubmit={handleSubmit} className="standard-form">
        <div className="form-group">
          <label>Nom du lieu</label>
          <input
            type="text"
            required
            placeholder="ex. Pizzeria Panini ..."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Catégorie</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Statut</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Place['status'])}>
              <option value="want-to-go">📌 À visiter</option>
              <option value="visited">✓ Visité</option>
              <option value="favorite">⭐ Coup de cœur</option>
            </select>
          </div>
        </div>

        {status !== 'want-to-go' && (
          <div className="form-group">
            <label>Note</label>
            <div className="stars-input">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  type="button"
                  className={`star-select-btn ${rating >= num ? 'active' : ''}`}
                  onClick={() => setRating(num)}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>Latitude</label>
            <input
              type="number"
              step="any"
              required
              value={lat}
              onChange={(e) => setLat(+e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Longitude</label>
            <input
              type="number"
              step="any"
              required
              value={lng}
              onChange={(e) => setLng(+e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Notes </label>
          <textarea
            placeholder="Plats conseillés, Wi-Fi, astuces d'accès..."
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
            Annuler
          </button>
          <button type="submit" className="btn-primary">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  )
}
