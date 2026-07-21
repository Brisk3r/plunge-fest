import { useState, useEffect } from 'react';
import { EVENTS, ZONES, ARTISTS } from '../data';
import MapSection from '../components/MapSection';
import WeatherWidget from '../components/WeatherWidget';

export default function Home() {
    const DB_VERSION = '2026_v4';

    // DB Versioning to force updates when the data.js file changes
    const checkDbVersion = () => {
        const currentVersion = localStorage.getItem('plunge_db_version');
        if (currentVersion !== DB_VERSION) {
            localStorage.setItem('plunge_db_version', DB_VERSION);
            localStorage.setItem('plunge_events', JSON.stringify(EVENTS));
            localStorage.setItem('plunge_artists', JSON.stringify(ARTISTS));
            return true;
        }
        return false;
    };
    
    const isReset = checkDbVersion();

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http') || path.startsWith('data:')) return path;
        return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    };

    const [activeSection, setActiveSection] = useState('program');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [selectedArtist, setSelectedArtist] = useState(null);
    
    const [events] = useState(() => {
        if (isReset) return EVENTS;
        const saved = localStorage.getItem('plunge_events');
        return saved ? JSON.parse(saved) : EVENTS;
    });
    
    const [artists] = useState(() => {
        if (isReset) return ARTISTS;
        const saved = localStorage.getItem('plunge_artists');
        return saved ? JSON.parse(saved) : ARTISTS;
    });

    const [itinerary, setItinerary] = useState(() => {
        const saved = localStorage.getItem('plunge_itinerary');
        return saved ? JSON.parse(saved) : [];
    });

    const [sharedItinerary, setSharedItinerary] = useState(null);

    // Filter States
    const [selectedZone, setSelectedZone] = useState('all');
    const [selectedType, setSelectedType] = useState('all');
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        localStorage.setItem('plunge_itinerary', JSON.stringify(itinerary));
    }, [itinerary]);

    // Parse shared itinerary link on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const shared = params.get('itinerary');
        if (shared) {
            const ids = shared.split(',');
            setSharedItinerary(ids);
            setActiveSection('itinerary');
        }
    }, []);

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

    const toggleItinerary = (eventId, e) => {
        e.stopPropagation();
        if (itinerary.includes(eventId)) {
            setItinerary(itinerary.filter(id => id !== eventId));
        } else {
            setItinerary([...itinerary, eventId]);
        }
    };

    // Filtered Events logic
    const filteredEvents = events.filter(event => {
        const zoneMatch = selectedZone === 'all' || event.zoneId === selectedZone;
        const typeMatch = selectedType === 'all' || event.type === selectedType;
        const dateMatch = !selectedDate || event.date === selectedDate;
        return zoneMatch && typeMatch && dateMatch;
    });

    const renderedItineraryIds = sharedItinerary || itinerary;
    const itineraryEvents = events
        .filter(e => renderedItineraryIds.includes(e.id))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    // Group filtered events by date for April Calendar Timeline
    const eventsByDate = filteredEvents.reduce((groups, event) => {
        const date = event.date;
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(event);
        return groups;
    }, {});

    const sortedDates = Object.keys(eventsByDate).sort((a, b) => new Date(a) - new Date(b));

    const scrollToDate = (dateStr) => {
        const element = document.getElementById(`date-group-${dateStr}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    return (
        <div>
            {/* Sub-navigation for sections */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '100px', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <button className={`btn ${activeSection === 'program' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveSection('program')}>Grid Program</button>
                <button className={`btn ${activeSection === 'timeline' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveSection('timeline')}>April Calendar</button>
                <button className={`btn ${activeSection === 'artists' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveSection('artists')}>Artists</button>
                <button className={`btn ${activeSection === 'itinerary' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveSection('itinerary')}>
                    Plan My Day {itinerary.length > 0 && <span style={{ background: 'white', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{itinerary.length}</span>}
                </button>
            </div>

            {activeSection === 'program' && (
                <>
                    <header className="hero" style={{ marginTop: '0' }}>
                        <h1>Dive Into Culture</h1>
                        <p>Plunge Festival 2026: 100+ exhibitions, performances, and workshops across the Clarence Valley.</p>
                    </header>

                    <main className="container">
                        <h2 className="section-title">Festival Forecast</h2>
                        <WeatherWidget />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <h2 className="section-title" style={{ margin: 0 }}>Festival Program</h2>
                            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                Showing {filteredEvents.length} of {events.length} events
                            </span>
                        </div>

                        {/* Filter Toolbar */}
                        <div className="filter-toolbar" style={{
                            display: 'flex',
                            gap: '1rem',
                            flexWrap: 'wrap',
                            padding: '1.5rem',
                            background: 'var(--bg-sidebar)',
                            borderRadius: 'var(--border-radius-md)',
                            marginBottom: '3rem',
                            alignItems: 'center',
                            border: '1px solid var(--border-color)'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px' }}>
                                <label htmlFor="zone-filter" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Town / Area</label>
                                <select id="zone-filter" value={selectedZone} onChange={e => setSelectedZone(e.target.value)} style={{ padding: '0.6rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', background: 'white', fontSize: '0.95rem' }}>
                                    <option value="all">All Regions</option>
                                    {ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                </select>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '200px' }}>
                                <label htmlFor="category-filter" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
                                <select id="category-filter" value={selectedType} onChange={e => setSelectedType(e.target.value)} style={{ padding: '0.6rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', background: 'white', fontSize: '0.95rem' }}>
                                    <option value="all">All Categories</option>
                                    <option value="Workshop">Workshops & Talks</option>
                                    <option value="Exhibition">Exhibitions & Studios</option>
                                    <option value="Performance">Performances</option>
                                    <option value="Market">Markets</option>
                                    <option value="Museum">Museums</option>
                                    <option value="Youth/Kids">Youth & Kids</option>
                                    <option value="Cultural Experience">Cultural Experiences</option>
                                    <option value="Event">Other Events</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: '150px' }}>
                                <label htmlFor="date-filter" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter by Date</label>
                                <input id="date-filter" type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ padding: '0.6rem', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)', background: 'white', fontSize: '0.95rem' }} />
                            </div>

                            <button className="btn btn-outline" onClick={() => { setSelectedZone('all'); setSelectedType('all'); setSelectedDate(''); }} style={{ alignSelf: 'flex-end', height: '42px', padding: '0 1.5rem', border: '1px solid var(--border-color)' }}>
                                Reset Filters
                            </button>
                        </div>

                        {filteredEvents.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-sidebar)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)', marginBottom: '4rem' }}>
                                <i className="ph ph-magnifying-glass" style={{ fontSize: '3rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}></i>
                                <h3>No events match your search criteria</h3>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Try clearing your filters or selecting a different town or category.</p>
                            </div>
                        ) : (
                            <div className="grid">
                                {filteredEvents.map(event => {
                                    const zone = ZONES.find(z => z.id === event.zoneId);
                                    const isSaved = itinerary.includes(event.id);
                                    return (
                                        <div key={event.id} className="card" onClick={() => handleEventClick(event)}>
                                            <div style={{ position: 'relative' }}>
                                                <img src={getImageUrl(event.image)} alt={event.title} className="card-img" />
                                                <button 
                                                    onClick={(e) => toggleItinerary(event.id, e)}
                                                    style={{ position: 'absolute', top: '10px', right: '10px', background: isSaved ? 'var(--accent-primary)' : 'rgba(255,255,255,0.9)', color: isSaved ? 'white' : 'var(--text-primary)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-md)', transition: 'background-color 0.2s' }}
                                                >
                                                    <i className={`ph ${isSaved ? 'ph-check' : 'ph-plus'}`}></i>
                                                </button>
                                            </div>
                                            <div className="card-content">
                                                <span className="card-tag" style={{ color: zone?.color }}>{zone?.name || 'Clarence Valley'}</span>
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
                        )}

                        <h2 className="section-title">Explore the Valley Map</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                            Interactive map of currently filtered events happening near you from Grafton to the coast.
                        </p>
                        <MapSection events={filteredEvents} onEventClick={handleEventClick} />
                    </main>
                </>
            )}

            {activeSection === 'timeline' && (
                <main className="container" style={{ marginTop: '40px' }}>
                    <h2 className="section-title">April Calendar Timeline</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
                        Browse all scheduled events sequentially day-by-day through the entire festival.
                    </p>

                    {/* Date quick navigation */}
                    <div style={{ 
                        display: 'flex', 
                        gap: '0.5rem', 
                        overflowX: 'auto', 
                        paddingBottom: '1rem',
                        marginBottom: '3rem',
                        borderBottom: '1px solid var(--border-color)'
                    }}>
                        {sortedDates.map(dateStr => {
                            const day = new Date(dateStr).getDate();
                            return (
                                <button 
                                    key={dateStr}
                                    className="btn btn-outline" 
                                    style={{ padding: '0.5rem 1rem', minWidth: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                                    onClick={() => scrollToDate(dateStr)}
                                >
                                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>
                                        {new Date(dateStr).toLocaleDateString('en-AU', { weekday: 'short' })}
                                    </span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{day}</span>
                                </button>
                            );
                        })}
                    </div>

                    {sortedDates.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-sidebar)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)' }}>
                            <i className="ph ph-calendar-x" style={{ fontSize: '3rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}></i>
                            <h3>No scheduled dates found</h3>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>No events match the current filter selection.</p>
                        </div>
                    ) : (
                        <div className="timeline">
                            {sortedDates.map(dateStr => {
                                const dayEvents = eventsByDate[dateStr];
                                const formattedDate = new Date(dateStr).toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
                                
                                return (
                                    <div key={dateStr} id={`date-group-${dateStr}`} className="timeline-day-group">
                                        <div className="timeline-date-header">
                                            {formattedDate}
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                            {dayEvents.map(event => {
                                                const zone = ZONES.find(z => z.id === event.zoneId);
                                                const isSaved = itinerary.includes(event.id);
                                                return (
                                                    <div 
                                                        key={event.id} 
                                                        className="timeline-container"
                                                    >
                                                        <div className="timeline-time">
                                                            {event.time.split(' - ')[0] || event.time}
                                                        </div>
                                                        <div className="timeline-track">
                                                            <div className="timeline-node"></div>
                                                        </div>
                                                        <div 
                                                            className="timeline-card"
                                                            onClick={() => handleEventClick(event)}
                                                        >
                                                            <img src={getImageUrl(event.image)} alt={event.title} className="timeline-img" />
                                                            <div className="timeline-text">
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                                    <span className="card-tag" style={{ color: zone?.color, margin: 0 }}>{zone?.name || 'Clarence Valley'}</span>
                                                                    <button 
                                                                        onClick={(e) => toggleItinerary(event.id, e)}
                                                                        style={{ 
                                                                            background: isSaved ? 'var(--accent-primary)' : 'var(--bg-sidebar)', 
                                                                            color: isSaved ? 'white' : 'var(--text-primary)', 
                                                                            border: '1px solid var(--border-color)', 
                                                                            borderRadius: '50%', 
                                                                            width: '32px', 
                                                                            height: '32px', 
                                                                            display: 'flex', 
                                                                            alignItems: 'center', 
                                                                            justifyContent: 'center', 
                                                                            cursor: 'pointer' 
                                                                        }}
                                                                    >
                                                                        <i className={`ph ${isSaved ? 'ph-check' : 'ph-plus'}`}></i>
                                                                    </button>
                                                                </div>
                                                                <h4 className="card-title" style={{ fontSize: '1.1rem', margin: '0.25rem 0' }}>{event.title}</h4>
                                                                <div className="card-meta" style={{ margin: '0.25rem 0' }}>
                                                                    <span><i className="ph ph-clock"></i> {event.time}</span>
                                                                    <span><i className="ph ph-tag"></i> {event.type}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            )}

            {activeSection === 'artists' && (
                <main className="container" style={{ marginTop: '40px' }}>
                    <h2 className="section-title">Featured Presenters & Artists</h2>
                    <div className="grid">
                        {artists.map(artist => (
                            <div key={artist.id} className="card" onClick={() => handleArtistClick(artist)}>
                                <img src={getImageUrl(artist.image)} alt={artist.name} className="card-img" style={{ objectPosition: 'top' }} />
                                <div className="card-content" style={{ textAlign: 'center' }}>
                                    <h3 className="card-title" style={{ fontSize: '1.5rem' }}>{artist.name}</h3>
                                    <span className="card-tag" style={{ display: 'inline-block', margin: '0.5rem 0 1rem 0' }}>{artist.type}</span>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                        {artist.bio.substring(0, 100)}...
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            )}

            {activeSection === 'itinerary' && (
                <main className="container" style={{ marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h2 className="section-title" style={{ margin: 0 }}>Plan My Day</h2>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                                Your personalized festival schedule.
                            </p>
                        </div>
                        
                        {/* Share Itinerary Trigger */}
                        {sharedItinerary === null && itinerary.length > 0 && (
                            <button className="btn btn-primary" style={{ background: 'var(--accent-secondary)' }} onClick={() => {
                                const shareUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?itinerary=${itinerary.join(',')}`;
                                navigator.clipboard.writeText(shareUrl).then(() => {
                                    alert("Shareable itinerary link copied to clipboard!");
                                }).catch(err => {
                                    console.error("Could not copy link:", err);
                                    alert("Here is your shareable link:\n" + shareUrl);
                                });
                            }}>
                                <i className="ph ph-share-network"></i> Share Itinerary
                            </button>
                        )}
                    </div>

                    {/* Shared Itinerary Header Banner */}
                    {sharedItinerary !== null && (
                        <div style={{
                            background: 'var(--accent-primary)',
                            color: 'white',
                            padding: '1.5rem',
                            borderRadius: 'var(--border-radius-md)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '3rem',
                            flexWrap: 'wrap',
                            gap: '1rem',
                            boxShadow: 'var(--shadow-md)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <i className="ph ph-users-three" style={{ fontSize: '2rem' }}></i>
                                <div>
                                    <h3 style={{ color: 'white', fontSize: '1.25rem', margin: 0 }}>Viewing a shared itinerary</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '0.9rem' }}>This itinerary has {sharedItinerary.length} selected events.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button className="btn" style={{ background: 'white', color: 'var(--accent-primary)', padding: '0.5rem 1.25rem', fontSize: '0.95rem' }} onClick={() => {
                                    const merged = Array.from(new Set([...itinerary, ...sharedItinerary]));
                                    setItinerary(merged);
                                    setSharedItinerary(null);
                                    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                                    window.history.pushState({ path: newUrl }, '', newUrl);
                                    alert("Itinerary imported successfully!");
                                }}>
                                    Import Schedule
                                </button>
                                <button className="btn" style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '0.5rem 1.25rem', fontSize: '0.95rem' }} onClick={() => {
                                    setSharedItinerary(null);
                                    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                                    window.history.pushState({ path: newUrl }, '', newUrl);
                                }}>
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {itineraryEvents.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: 'var(--border-radius-lg)', border: '1px solid var(--border-color)' }}>
                            <i className="ph ph-calendar-plus" style={{ fontSize: '3rem', color: 'var(--text-tertiary)', marginBottom: '1rem' }}></i>
                            <h3>Your itinerary is empty</h3>
                            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Browse the program and click the + icon to save events here.</p>
                            <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={() => setActiveSection('program')}>Browse Program</button>
                        </div>
                    ) : (
                        <div className="timeline">
                            {itineraryEvents.map(event => {
                                const zone = ZONES.find(z => z.id === event.zoneId);
                                return (
                                    <div key={event.id} className="timeline-item">
                                        <div className="timeline-dot"></div>
                                        <div className="timeline-content" onClick={() => handleEventClick(event)}>
                                            <img src={getImageUrl(event.image)} alt={event.title} className="timeline-img" />
                                            <div className="timeline-text">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                    <span className="card-tag" style={{ color: zone?.color, margin: 0 }}>{zone?.name || 'Clarence Valley'}</span>
                                                    {sharedItinerary === null && (
                                                        <button 
                                                            onClick={(e) => toggleItinerary(event.id, e)}
                                                            style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: '1.2rem' }}
                                                            title="Remove from itinerary"
                                                        >
                                                            <i className="ph ph-x"></i>
                                                        </button>
                                                    )}
                                                </div>
                                                <h3 className="card-title">{event.title}</h3>
                                                <div className="card-meta">
                                                    <span><i className="ph ph-calendar-blank"></i> {event.date}</span>
                                                    <span><i className="ph ph-clock"></i> {event.time}</span>
                                                </div>
                                                <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                    {event.description.substring(0, 120)}...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
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
                                <img src={getImageUrl(selectedEvent.image)} alt={selectedEvent.title} className="modal-hero" />
                                <div className="modal-body">
                                    <span className="card-tag" style={{ marginBottom: '1rem', display: 'inline-block', background: 'var(--bg-sidebar)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                                        {selectedEvent.type}
                                    </span>
                                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{selectedEvent.title}</h2>
                                    
                                    <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                                        <div>
                                            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Date & Time</h4>
                                            <p><i className="ph ph-calendar-blank"></i> {selectedEvent.date}</p>
                                            <p><i className="ph ph-clock"></i> {selectedEvent.time}</p>
                                        </div>
                                        <div>
                                            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Location</h4>
                                            <p><i className="ph ph-map-pin"></i> {ZONES.find(z => z.id === selectedEvent.zoneId)?.name || 'Clarence Valley'}</p>
                                        </div>
                                        <div>
                                            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Cost</h4>
                                            <p><i className="ph ph-currency-dollar"></i> {selectedEvent.cost || 'Free'}</p>
                                        </div>
                                    </div>
                                    
                                    <div style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                        {selectedEvent.description}
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <button 
                                            className={`btn ${itinerary.includes(selectedEvent.id) ? 'btn-outline' : 'btn-primary'}`}
                                            onClick={(e) => toggleItinerary(selectedEvent.id, e)}
                                            style={{ flex: 1, minWidth: '200px' }}
                                        >
                                            <i className={`ph ${itinerary.includes(selectedEvent.id) ? 'ph-check' : 'ph-plus'}`}></i>
                                            {itinerary.includes(selectedEvent.id) ? 'Saved to Itinerary' : 'Add to Itinerary'}
                                        </button>
                                        
                                        {selectedEvent.bookingUrl && (
                                            <a 
                                                href={selectedEvent.bookingUrl} 
                                                target="_blank" 
                                                rel="noreferrer"
                                                className="btn btn-primary"
                                                style={{ flex: 1, minWidth: '200px', background: 'var(--accent-secondary)' }}
                                            >
                                                <i className="ph ph-ticket"></i> Book Tickets
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {selectedArtist && (
                            <>
                                <img src={getImageUrl(selectedArtist.image)} alt={selectedArtist.name} className="modal-hero" style={{ objectPosition: 'top' }} />
                                <div className="modal-body">
                                    <span className="card-tag" style={{ marginBottom: '1rem', display: 'inline-block', background: 'var(--bg-sidebar)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                                        {selectedArtist.type}
                                    </span>
                                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{selectedArtist.name}</h2>
                                    
                                    <div style={{ fontSize: '1.1rem', lineHeight: '1.7', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                                        {selectedArtist.bio}
                                    </div>

                                    <h3 style={{ color: 'var(--accent-primary)', marginBottom: '1rem' }}>Performing At:</h3>
                                    <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.5rem' }}>
                                        {events.filter(e => e.artistId === selectedArtist.id).map(event => {
                                            const zone = ZONES.find(z => z.id === event.zoneId);
                                            return (
                                                <div key={event.id} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <div>
                                                        <h4 style={{ margin: 0, fontSize: '0.95rem' }}>{event.title}</h4>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{event.date} | {zone?.name || 'Clarence Valley'}</span>
                                                    </div>
                                                    <button 
                                                        className="btn btn-primary" 
                                                        style={{ padding: '0.3rem 0.8rem', fontSize: '0.85rem' }}
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
                                        {events.filter(e => e.artistId === selectedArtist.id).length === 0 && (
                                            <div style={{ padding: '1rem', color: 'var(--text-tertiary)', textAlign: 'center' }}>
                                                No listed events for this presenter at the moment.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
