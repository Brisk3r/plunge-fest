import { useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { EVENTS, ZONES, ARTISTS } from './data';
import './index.css';

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const center = {
  lat: -29.5600,
  lng: 153.1500
};

function App() {
  const [activeSection, setActiveSection] = useState('program');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [mapMarkerOpen, setMapMarkerOpen] = useState(null);

  // Since we want to use Google Maps API without a key (for development/free purposes as requested)
  // we pass an empty string to googleMapsApiKey. It will show a development watermark but work perfectly.
  const googleMapsApiKey = ""; 

  const handleEventClick = (event) => {
    setSelectedArtist(null);
    setSelectedEvent(event);
  };

  const handleArtistClick = (artist) => {
    setSelectedEvent(null);
    setSelectedArtist(artist);
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setSelectedArtist(null);
  };

  return (
    <div>
      <nav className="navbar">
        <div className="logo">
          <h1>PLUNGE</h1>
          <span>Festival 2027</span>
        </div>
        <div className="nav-links">
          <button 
            className={activeSection === 'program' ? 'active' : ''} 
            onClick={() => setActiveSection('program')}
          >
            Program
          </button>
          <button 
            className={activeSection === 'artists' ? 'active' : ''} 
            onClick={() => setActiveSection('artists')}
          >
            Artists
          </button>
        </div>
      </nav>

      {activeSection === 'program' && (
        <>
          <header className="hero">
            <h1>Dive Into Culture</h1>
            <p>100+ exhibitions, performances, and workshops across the Clarence Valley.</p>
          </header>

          <main className="container">
            <h2 className="section-title">Festival Program</h2>
            <div className="grid">
              {EVENTS.map(event => {
                const zone = ZONES.find(z => z.id === event.zoneId);
                return (
                  <div key={event.id} className="card" onClick={() => handleEventClick(event)}>
                    <img src={event.image} alt={event.title} className="card-img" />
                    <div className="card-content">
                      <span className="card-tag" style={{ color: zone?.color }}>{zone?.name}</span>
                      <h3 className="card-title">{event.title}</h3>
                      <div className="card-meta">
                        <span><i className="ph ph-calendar-blank"></i> {event.date}</span>
                        <span><i className="ph ph-tag"></i> {event.type}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <h2 className="section-title">Explore the Valley</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Find events happening near you from Grafton to the coast.
            </p>
            
            <div className="map-container">
              <LoadScript googleMapsApiKey={googleMapsApiKey}>
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={10}
                >
                  {EVENTS.map(event => (
                    <Marker
                      key={event.id}
                      position={{ lat: event.lat, lng: event.lng }}
                      onClick={() => setMapMarkerOpen(event.id)}
                    >
                      {mapMarkerOpen === event.id && (
                        <InfoWindow onCloseClick={() => setMapMarkerOpen(null)}>
                          <div style={{ color: 'var(--text-primary)', padding: '0.5rem' }}>
                            <h4 style={{ margin: 0, color: 'var(--accent-primary)' }}>{event.title}</h4>
                            <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 1rem 0' }}>{event.date}</p>
                            <button 
                              className="btn btn-primary" 
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                              onClick={() => handleEventClick(event)}
                            >
                              View Event
                            </button>
                          </div>
                        </InfoWindow>
                      )}
                    </Marker>
                  ))}
                </GoogleMap>
              </LoadScript>
            </div>
          </main>
        </>
      )}

      {activeSection === 'artists' && (
        <>
          <div style={{ height: '120px' }}></div>
          <main className="container">
            <h2 className="section-title">Featured Artists & Performers</h2>
            <div className="grid">
              {ARTISTS.map(artist => (
                <div key={artist.id} className="card" onClick={() => handleArtistClick(artist)}>
                  <img src={artist.image} alt={artist.name} className="card-img" style={{ objectPosition: 'top' }} />
                  <div className="card-content" style={{ textAlign: 'center' }}>
                    <h3 className="card-title" style={{ fontSize: '1.5rem' }}>{artist.name}</h3>
                    <span className="card-tag" style={{ display: 'inline-block', margin: '0.5rem 0 1rem 0' }}>{artist.type}</span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                      {artist.bio.substring(0, 80)}...
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </>
      )}

      {/* Modals */}
      {(selectedEvent || selectedArtist) && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <i className="ph ph-x"></i>
            </button>
            
            {selectedEvent && (
              <>
                <img src={selectedEvent.image} alt={selectedEvent.title} className="modal-hero" />
                <div className="modal-body">
                  <span className="card-tag" style={{ marginBottom: '1rem', display: 'inline-block', background: 'var(--bg-sidebar)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                    {selectedEvent.type}
                  </span>
                  <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{selectedEvent.title}</h2>
                  
                  <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Date & Time</h4>
                      <p><i className="ph ph-calendar-blank"></i> {selectedEvent.date}</p>
                      <p><i className="ph ph-clock"></i> {selectedEvent.time}</p>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Location</h4>
                      <p><i className="ph ph-map-pin"></i> {ZONES.find(z => z.id === selectedEvent.zoneId)?.name}</p>
                    </div>
                  </div>
                  
                  <div style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                    {selectedEvent.description}
                  </div>
                </div>
              </>
            )}

            {selectedArtist && (
              <>
                <img src={selectedArtist.image} alt={selectedArtist.name} className="modal-hero" style={{ objectPosition: 'top' }} />
                <div className="modal-body">
                  <span className="card-tag" style={{ marginBottom: '1rem', display: 'inline-block', background: 'var(--bg-sidebar)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                    {selectedArtist.type}
                  </span>
                  <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{selectedArtist.name}</h2>
                  
                  <div style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                    {selectedArtist.bio}
                  </div>

                  <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Performing At:</h3>
                  {EVENTS.filter(e => e.artistId === selectedArtist.id).map(event => {
                    const zone = ZONES.find(z => z.id === event.zoneId);
                    return (
                      <div key={event.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ margin: 0 }}>{event.title}</h4>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>{event.date} | {zone?.name}</span>
                        </div>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '0.4rem 1rem' }}
                          onClick={() => {
                            setSelectedArtist(null);
                            setSelectedEvent(event);
                          }}
                        >
                          View
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
