import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext.jsx'
import { usePageTitle } from '../../../hooks/usePageTitle.js'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './MapPage.css'

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom icons
const pharmacyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const hospitalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Component to update map center
function MapUpdater({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom())
    }
  }, [center, zoom, map])
  return null
}

const MapPage = () => {
  usePageTitle('Bản đồ')
  const { isAuthenticated } = useAuth()
  const [userLocation, setUserLocation] = useState([10.8231, 106.6297]) // Default: Ho Chi Minh City
  const [searchType, setSearchType] = useState('pharmacy') // 'pharmacy' hoặc 'hospital'
  const [searchQuery, setSearchQuery] = useState('')
  const [places, setPlaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mapCenter, setMapCenter] = useState([10.8231, 106.6297])
  const [mapZoom, setMapZoom] = useState(13)

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = [position.coords.latitude, position.coords.longitude]
          setUserLocation(location)
          setMapCenter(location)
          searchNearbyPlaces(location)
        },
        (err) => {
          console.error('Error getting location:', err)
          // Default to Ho Chi Minh City
          searchNearbyPlaces([10.8231, 106.6297])
        }
      )
    } else {
      // Default to Ho Chi Minh City
      searchNearbyPlaces([10.8231, 106.6297])
    }
  }, [])

  useEffect(() => {
    if (userLocation) {
      searchNearbyPlaces(userLocation)
    }
  }, [searchType])

  const searchNearbyPlaces = async (location) => {
    if (!location || location.length !== 2) return

    setLoading(true)
    setError('')

    try {
      const [lat, lon] = location
      const radius = 5000 // 5km in meters
      
      // Use Overpass API to search for pharmacies or hospitals
      const overpassUrl = 'https://overpass-api.de/api/interpreter'
      
      // Query for pharmacies or hospitals
      const query = searchType === 'pharmacy' 
        ? `[out:json][timeout:25];
          (
            node["amenity"="pharmacy"](around:${radius},${lat},${lon});
            way["amenity"="pharmacy"](around:${radius},${lat},${lon});
            relation["amenity"="pharmacy"](around:${radius},${lat},${lon});
          );
          out center meta;`
        : `[out:json][timeout:25];
          (
            node["amenity"="hospital"](around:${radius},${lat},${lon});
            way["amenity"="hospital"](around:${radius},${lat},${lon});
            relation["amenity"="hospital"](around:${radius},${lat},${lon});
          );
          out center meta;`

      const response = await fetch(overpassUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`
      })

      if (!response.ok) {
        throw new Error('Không thể tìm kiếm địa điểm')
      }

      const data = await response.json()
      
      if (data.elements && data.elements.length > 0) {
        // Helper function to build address from tags
        const buildAddress = (tags) => {
          const parts = []
          
          // Check for full address first
          if (tags['addr:full']) {
            return tags['addr:full']
          }
          
          // Build address from components
          if (tags['addr:housenumber']) parts.push(tags['addr:housenumber'])
          if (tags['addr:street']) parts.push(tags['addr:street'])
          if (tags['addr:ward']) parts.push(tags['addr:ward'])
          if (tags['addr:district'] || tags['addr:subdistrict']) {
            parts.push(tags['addr:district'] || tags['addr:subdistrict'])
          }
          if (tags['addr:city']) parts.push(tags['addr:city'])
          if (tags['addr:province'] || tags['addr:state']) {
            parts.push(tags['addr:province'] || tags['addr:state'])
          }
          
          if (parts.length > 0) {
            return parts.join(', ')
          }
          
          // Fallback to other address fields
          if (tags['addr:place']) return tags['addr:place']
          if (tags['addr:hamlet']) return tags['addr:hamlet']
          if (tags['addr:suburb']) return tags['addr:suburb']
          
          return null
        }

        // Helper function to reverse geocode coordinates
        const reverseGeocode = async (lat, lon) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'CheckMyHealth App'
                }
              }
            )
            if (response.ok) {
              const data = await response.json()
              if (data.address) {
                const addr = data.address
                const parts = []
                if (addr.road) parts.push(addr.road)
                if (addr.ward || addr.suburb) parts.push(addr.ward || addr.suburb)
                if (addr.district || addr.city_district) parts.push(addr.district || addr.city_district)
                if (addr.city || addr.town) parts.push(addr.city || addr.town)
                if (parts.length > 0) {
                  return parts.join(', ')
                }
                return data.display_name || null
              }
            }
          } catch (err) {
            console.error('Reverse geocoding error:', err)
          }
          return null
        }

        // Process elements and get addresses
        const elementsWithCoords = data.elements
          .filter(element => {
            const coords = element.center || (element.lat && element.lon ? { lat: element.lat, lon: element.lon } : null)
            return coords && element.tags && element.tags.name
          })
          .slice(0, 20)

        // Process all elements and reverse geocode if needed
        const placesList = await Promise.all(
          elementsWithCoords.map(async (element) => {
            const coords = element.center || { lat: element.lat, lon: element.lon }
            let address = buildAddress(element.tags)
            
            // If no address from tags, try reverse geocoding
            if (!address) {
              address = await reverseGeocode(coords.lat, coords.lon)
            }
            
            // Calculate distance from user location
            const distance = userLocation && userLocation.length === 2
              ? calculateDistance(userLocation[0], userLocation[1], coords.lat, coords.lon)
              : null
            
            return {
              id: element.id,
              name: element.tags.name || 'Không có tên',
              address: address || 'Địa chỉ không xác định',
              phone: element.tags['phone'] || element.tags['contact:phone'] || element.tags['contact:mobile'] || '',
              location: [coords.lat, coords.lon],
              tags: element.tags,
              distance: distance
            }
          })
        )

        // Sort by distance (closest first)
        const sortedPlaces = placesList.sort((a, b) => {
          if (a.distance === null && b.distance === null) return 0
          if (a.distance === null) return 1
          if (b.distance === null) return -1
          return a.distance - b.distance
        })

        setPlaces(sortedPlaces)
        
        // Update map bounds to show all markers
        if (placesList.length > 0) {
          const bounds = L.latLngBounds([location, ...placesList.map(p => p.location)])
          setMapCenter(bounds.getCenter())
        }
      } else {
        setPlaces([])
        setError('Không tìm thấy kết quả trong khu vực này. Vui lòng thử khu vực khác.')
      }
    } catch (err) {
      console.error('Error searching places:', err)
      setError('Lỗi khi tìm kiếm. Vui lòng thử lại sau.')
      setPlaces([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearchTypeChange = (type) => {
    setSearchType(type)
    if (userLocation) {
      searchNearbyPlaces(userLocation)
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in km
  }

  const handlePlaceClick = (place) => {
    setMapCenter(place.location)
    setMapZoom(16)
  }

  const handleReturnToUserLocation = () => {
    if (userLocation && userLocation.length === 2) {
      setMapCenter(userLocation)
      setMapZoom(13)
      // Re-search places around user location
      searchNearbyPlaces(userLocation)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    setError('')

    try {
      // Use Nominatim API for geocoding
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=vn`
      
      const response = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'CheckMyHealth App'
        }
      })

      if (!response.ok) {
        throw new Error('Không thể tìm kiếm địa chỉ')
      }

      const data = await response.json()
      
      if (data && data.length > 0) {
        const location = [parseFloat(data[0].lat), parseFloat(data[0].lon)]
        setUserLocation(location)
        setMapCenter(location)
        setMapZoom(13)
        searchNearbyPlaces(location)
      } else {
        setError('Không tìm thấy địa chỉ. Vui lòng thử lại với địa chỉ khác.')
      }
    } catch (err) {
      console.error('Error geocoding:', err)
      setError('Lỗi khi tìm kiếm địa chỉ. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="history-container">
        <div className="history-card">
          <h2>Yêu cầu đăng nhập</h2>
          <p>Bạn cần đăng nhập để sử dụng tính năng bản đồ.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="map-page">
      <div className="map-page__header">
        <h1 className="map-page__title">Tìm nhà thuốc & Bệnh viện</h1>
        <p className="map-page__subtitle">Tìm kiếm các cơ sở y tế gần bạn nhất</p>
      </div>

      <div className="map-page__controls">
        <div className="map-page__search-bar">
          <input
            type="text"
            placeholder="Nhập địa chỉ để tìm kiếm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="map-page__search-input"
          />
          <button onClick={handleSearch} className="map-page__search-btn" disabled={loading}>
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>

        <div className="map-page__type-selector">
          <button
            className={`map-page__type-btn ${searchType === 'pharmacy' ? 'active' : ''}`}
            onClick={() => handleSearchTypeChange('pharmacy')}
            disabled={loading}
          >
            💊 Nhà thuốc
          </button>
          <button
            className={`map-page__type-btn ${searchType === 'hospital' ? 'active' : ''}`}
            onClick={() => handleSearchTypeChange('hospital')}
            disabled={loading}
          >
            🏥 Bệnh viện
          </button>
        </div>
      </div>

      {error && (
        <div className="map-page__error">
          {error}
        </div>
      )}

      <div className="map-page__content">
        <div className="map-page__map-container">
          <button
            className="map-page__location-btn"
            onClick={handleReturnToUserLocation}
            title="Quay về vị trí của bạn"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
          </button>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%', minHeight: '500px' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} zoom={mapZoom} />
            
            {/* User location marker */}
            <Marker position={userLocation} icon={userIcon}>
              <Popup>
                <strong>Vị trí của bạn</strong>
              </Popup>
            </Marker>

            {/* Places markers */}
            {places.map((place) => (
              <Marker
                key={place.id}
                position={place.location}
                icon={searchType === 'pharmacy' ? pharmacyIcon : hospitalIcon}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600 }}>
                      {place.name}
                    </h3>
                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                      {place.address}
                    </p>
                    {place.phone && (
                      <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                        📞 {place.phone}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="map-page__sidebar">
          <h3 className="map-page__sidebar-title">
            {searchType === 'pharmacy' ? 'Nhà thuốc gần bạn' : 'Bệnh viện gần bạn'}
          </h3>
          {loading ? (
            <div className="map-page__loading-list">
              <div className="map-page__spinner"></div>
              <p>Đang tìm kiếm...</p>
            </div>
          ) : places.length === 0 ? (
            <div className="map-page__empty">
              <p>Không tìm thấy kết quả nào.</p>
              <p>Hãy thử tìm kiếm ở khu vực khác.</p>
            </div>
          ) : (
            <div className="map-page__places-list">
              {places.map((place) => (
                <div
                  key={place.id}
                  className="map-page__place-item"
                  onClick={() => handlePlaceClick(place)}
                >
                  <div className="map-page__place-header">
                    <h4 className="map-page__place-name">{place.name}</h4>
                    {place.distance !== null && (
                      <span className="map-page__place-distance">
                        {place.distance < 1 
                          ? `${Math.round(place.distance * 1000)}m` 
                          : `${place.distance.toFixed(1)}km`}
                      </span>
                    )}
                  </div>
                  <p className="map-page__place-address">{place.address}</p>
                  {place.phone && (
                    <p className="map-page__place-phone">📞 {place.phone}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MapPage
