import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const center = [-29.5600, 153.1500];

export default function MapSection({ events, onEventClick }) {
    return (
        <div className="map-container">
            <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
                {/* 
                    Using Google Maps tiles directly in Leaflet.
                    This perfectly matches the Google Maps aesthetic for free without watermarks!
                */}
                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    maxZoom={20}
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    attribution="&copy; Google Maps"
                />
                
                {events.map(event => (
                    <Marker key={event.id} position={[event.lat, event.lng]}>
                        <Popup>
                            <div style={{ padding: '0.2rem' }}>
                                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent-primary)' }}>{event.title}</h4>
                                <button 
                                    className="btn-primary" 
                                    style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                                    onClick={() => onEventClick(event)}
                                >
                                    View Details
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
