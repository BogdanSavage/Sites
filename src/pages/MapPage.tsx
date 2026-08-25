import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Place } from '../types'
import { CATEGORIES } from '../utils/storage'

// ─── Custom emoji marker ──────────────────────────────────────────────────────
const createCustomIcon = (category: string, isSelected = false) => {
  const cat = CATEGORIES.find((c) => c.id === category) || CATEGORIES[5]
  const bg = isSelected ? '#1E293B' : cat.color
  const scale = isSelected ? 'scale(1.2)' : 'scale(1)'
  return L.divIcon({
    html: `<div style="
      background-color:${bg};
      border:${isSelected ? '3px solid #F59E0B' : '2.5px solid white'};
      border-radius:50%;
      width:38px;height:38px;
      display:flex;align-items:center;justify-content:center;
      font-size:20px;
      box-shadow:0 4px 10px rgba(0,0,0,0.35);
      cursor:pointer;
      transform:${scale};
      transition:transform 0.2s ease;
    ">${cat.icon}</div>`,
    className: 'custom-leaflet-marker-icon',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -40],
  })
}

// ─── Map click → navigate to /add-place?lat=…&lng=… ──────────────────────────
function MapClickHandler({ onMapClick }: { onMapClick: (ll: L.LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      // Only trigger if clicking on bare map tiles (not a marker or control)
      const target = e.originalEvent.target as HTMLElement
      if (
        target &&
        (target.closest('.leaflet-marker-icon') ||
          target.closest('.leaflet-popup') ||
          target.closest('.map-place-preview-sheet'))
      ) {
        return
      }
      onMapClick(e.latlng)
    },
  })
  return null
}

// ─── Re-centre imperatively when center prop changes ─────────────────────────
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap()
  const prev = useRef<[number, number] | null>(null)
  useEffect(() => {
    if (
      prev.current === null ||
      prev.current[0] !== center[0] ||
      prev.current[1] !== center[1]
    ) {
      map.setView(center, Math.max(map.getZoom(), 14), { animate: true })
      prev.current = center
    }
  }, [center, map])
  return null
}

// ─── helpers ─────────────────────────────────────────────────────────────────
const isValidCoord = (lat: number, lng: number) =>
  isFinite(lat) &&
  isFinite(lng) &&
  lat >= -90 &&
  lat <= 90 &&
  lng >= -180 &&
  lng <= 180

interface MapPageProps {
  places: Place[]
}

export default function MapPage({ places }: MapPageProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // Grab incoming center parameter from router state
  const routeCenter = location.state?.center as [number, number] | undefined

  const firstValidPlace = places.find((p) => isValidCoord(p.lat, p.lng))
  const defaultCenter: [number, number] = firstValidPlace
    ? [firstValidPlace.lat, firstValidPlace.lng]
    : [48.8566, 2.3522] // Paris fallback

  const [mapCenter, setMapCenter] = useState<[number, number]>(
    routeCenter ?? defaultCenter
  )

  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)

  // Sync whenever we arrive with state
  useEffect(() => {
    if (routeCenter) {
      setMapCenter(routeCenter)
      const matching = places.find(
        (p) => Math.abs(p.lat - routeCenter[0]) < 0.0001 && Math.abs(p.lng - routeCenter[1]) < 0.0001
      )
      if (matching) setSelectedPlace(matching)
    }
  }, [routeCenter, places])

  const handleMapClick = (latlng: L.LatLng) => {
    navigate(`/add-place?lat=${latlng.lat.toFixed(6)}&lng=${latlng.lng.toFixed(6)}`)
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('La géolocalisation n\'est pas prise en charge par ce navigateur.')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setMapCenter([pos.coords.latitude, pos.coords.longitude]),
      () => alert('Impossible de récupérer votre position. Veuillez vérifier vos autorisations.')
    )
  }

  // Filter valid places
  const validPlaces = places.filter((p) => isValidCoord(p.lat, p.lng))
  const invalidCount = places.length - validPlaces.length

  const selectedCategory = selectedPlace
    ? CATEGORIES.find((c) => c.id === selectedPlace.category)
    : null

  return (
    <div className="map-page-full">
      {/* ── floating header ── */}
      <div className="map-absolute-header">
        <button onClick={handleGeolocate} className="geo-button-floating">
          🎯 Me localiser
        </button>
      </div>

      {/* ── Leaflet map ── */}
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributeurs'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapRecenter center={mapCenter} />
        <MapClickHandler onMapClick={handleMapClick} />

        {validPlaces.map((place) => {
          const isSelected = selectedPlace?.id === place.id
          const cat = CATEGORIES.find((c) => c.id === place.category)
          return (
            <Marker
              key={place.id}
              position={[place.lat, place.lng]}
              icon={createCustomIcon(place.category, isSelected)}
              eventHandlers={{
                click: () => {
                  setSelectedPlace(place)
                },
              }}
            >
              <Popup>
                <div className="map-popup-bubble">
                  <strong>{place.name}</strong>
                  <div className="popup-body">
                    <span className="popup-cat">
                      {cat?.icon} {cat?.name}
                    </span>
                    {place.status !== 'want-to-go' && place.rating > 0 && (
                      <span className="popup-stars">{'★'.repeat(place.rating)}</span>
                    )}
                  </div>
                  {place.status === 'want-to-go' && (
                    <span className="popup-want-badge">📌 À visiter</span>
                  )}
                  <button
                    type="button"
                    className="popup-detail-btn-native"
                    onClick={() => navigate(`/places/${place.id}`)}
                  >
                    Voir les détails du lieu ➔
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>

      {/* ── Selected Place Bottom Sheet Preview ── */}
      {selectedPlace && (
        <div className="map-place-preview-sheet">
          <div className="preview-sheet-header">
            <div className="preview-icon-wrapper" style={{ backgroundColor: selectedCategory?.color + '20' }}>
              <span style={{ fontSize: 24 }}>{selectedCategory?.icon || '📍'}</span>
            </div>
            <div className="preview-info">
              <h3 className="preview-title">{selectedPlace.name}</h3>
              <div className="preview-meta">
                <span className="preview-category" style={{ color: selectedCategory?.color }}>
                  {selectedCategory?.name}
                </span>
                {selectedPlace.status !== 'want-to-go' && selectedPlace.rating > 0 && (
                  <span className="preview-stars">{'★'.repeat(selectedPlace.rating)}</span>
                )}
              </div>
            </div>
            <button
              type="button"
              className="preview-close-btn"
              onClick={() => setSelectedPlace(null)}
              aria-label="Fermer l'aperçu"
            >
              ✕
            </button>
          </div>

          {selectedPlace.notes && (
            <p className="preview-notes-snippet">{selectedPlace.notes}</p>
          )}

          <div className="preview-actions">
            <button
              type="button"
              className="btn-primary preview-open-btn"
              onClick={() => navigate(`/places/${selectedPlace.id}`)}
            >
              Voir les détails ➔
            </button>
          </div>
        </div>
      )}

      {/* ── bottom instruction strip (hidden when preview sheet is active) ── */}
      {!selectedPlace && (
        <div className="map-instruction-footer">
          {invalidCount > 0 ? (
            <p>⚠️ {invalidCount} lieu{invalidCount > 1 ? 'x' : ''} masqué{invalidCount > 1 ? 's' : ''} — coordonnées invalides.</p>
          ) : (
            <p>💡 Touchez la carte pour ajouter un lieu.</p>
          )}
        </div>
      )}

      {/* ── no places empty state (overlaid on map) ── */}
      {validPlaces.length === 0 && (
        <div className="map-empty-overlay">
          <span>🗺️</span>
          <p>Aucun lieu sur la carte pour l'instant.</p>
          <button
            type="button"
            className="btn-primary-sm"
            onClick={() => navigate('/add-place')}
          >
            ➕ Ajouter un premier lieu
          </button>
        </div>
      )}
    </div>
  )
}
