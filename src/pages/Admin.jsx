import { useState, useEffect } from 'react';
import { EVENTS as DEFAULT_EVENTS, ARTISTS as DEFAULT_ARTISTS, ZONES } from '../data';

export default function Admin() {
    const DB_VERSION = '2026_v4';

    // DB Versioning check
    const checkDbVersion = () => {
        const currentVersion = localStorage.getItem('plunge_db_version');
        if (currentVersion !== DB_VERSION) {
            localStorage.setItem('plunge_db_version', DB_VERSION);
            localStorage.setItem('plunge_events', JSON.stringify(DEFAULT_EVENTS));
            localStorage.setItem('plunge_artists', JSON.stringify(DEFAULT_ARTISTS));
            return true;
        }
        return false;
    };
    
    const isReset = checkDbVersion();

    const [events, setEvents] = useState(() => {
        if (isReset) return DEFAULT_EVENTS;
        const saved = localStorage.getItem('plunge_events');
        return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
    });

    const [artists, setArtists] = useState(() => {
        if (isReset) return DEFAULT_ARTISTS;
        const saved = localStorage.getItem('plunge_artists');
        return saved ? JSON.parse(saved) : DEFAULT_ARTISTS;
    });

    // Form States
    const [editingEvent, setEditingEvent] = useState(null);
    const [editingArtist, setEditingArtist] = useState(null);

    // Image Upload States
    const [eventImageBase64, setEventImageBase64] = useState("");
    const [artistImageBase64, setArtistImageBase64] = useState("");

    useEffect(() => {
        localStorage.setItem('plunge_events', JSON.stringify(events));
    }, [events]);

    useEffect(() => {
        localStorage.setItem('plunge_artists', JSON.stringify(artists));
    }, [artists]);

    const resetDefaults = () => {
        if (window.confirm('Wipe all custom data and restore initial mock data?')) {
            setEvents(DEFAULT_EVENTS);
            setArtists(DEFAULT_ARTISTS);
            localStorage.setItem('plunge_events', JSON.stringify(DEFAULT_EVENTS));
            localStorage.setItem('plunge_artists', JSON.stringify(DEFAULT_ARTISTS));
            localStorage.setItem('plunge_db_version', DB_VERSION);
            setEventImageBase64("");
            setArtistImageBase64("");
            alert('Data Reset!');
        }
    };

    // Handle converting file uploads to base64 strings
    const handleImageUpload = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'event') {
                    setEventImageBase64(reader.result);
                } else if (type === 'artist') {
                    setArtistImageBase64(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // --- EVENT CRUD ---
    const handleEventSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        // Choose base64 if uploaded, else URL input, else default
        const finalImage = eventImageBase64 || formData.get('image') || (editingEvent?.image) || 'https://picsum.photos/seed/event/800/600';

        const newEvent = {
            id: editingEvent?.id || 'p' + (events.length + 1),
            title: formData.get('title'),
            zoneId: formData.get('zoneId'),
            date: formData.get('date'),
            time: formData.get('time'),
            image: finalImage,
            description: formData.get('description'),
            type: formData.get('type'),
            lat: parseFloat(formData.get('lat')),
            lng: parseFloat(formData.get('lng')),
            artistId: formData.get('artistId') || null,
            cost: formData.get('cost') || 'Free',
            bookingUrl: formData.get('bookingUrl') || null
        };

        if (editingEvent?.id) {
            setEvents(events.map(ev => ev.id === editingEvent.id ? newEvent : ev));
        } else {
            setEvents([...events, newEvent]);
        }
        setEditingEvent(null);
        setEventImageBase64("");
    };

    const deleteEvent = (id) => {
        if(window.confirm('Delete this event?')) setEvents(events.filter(e => e.id !== id));
    };

    // --- ARTIST CRUD ---
    const handleArtistSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const finalImage = artistImageBase64 || formData.get('image') || (editingArtist?.image) || 'https://picsum.photos/seed/artist/400/400';

        const newArtist = {
            id: editingArtist?.id || 'a' + (artists.length + 1),
            name: formData.get('name'),
            type: formData.get('type'),
            bio: formData.get('bio'),
            image: finalImage
        };

        if (editingArtist?.id) {
            setArtists(artists.map(ar => ar.id === editingArtist.id ? newArtist : ar));
        } else {
            setArtists([...artists, newArtist]);
        }
        setEditingArtist(null);
        setArtistImageBase64("");
    };

    const deleteArtist = (id) => {
        if(window.confirm('Delete this artist?')) {
            setArtists(artists.filter(a => a.id !== id));
            setEvents(events.map(e => e.artistId === id ? { ...e, artistId: null } : e));
        }
    };

    return (
        <div style={{ padding: '120px 2rem 4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="font-heading" style={{ fontSize: '2.5rem', margin: 0 }}>Festival Admin Panel</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Add, edit, or delete items in the database locally.</p>
                </div>
                <button className="btn btn-primary" onClick={resetDefaults} style={{ background: 'var(--accent-secondary)' }}>Factory Reset Data</button>
            </div>

            {/* EVENT EDITOR */}
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: '3rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ color: 'var(--accent-primary)', margin: 0 }}>Manage Events ({events.length})</h2>
                    <button className="btn btn-primary" onClick={() => { setEditingEvent({}); setEventImageBase64(""); }} style={{ padding: '0.5rem 1rem' }}>+ Add Event</button>
                </div>

                {editingEvent !== null && (
                    <form onSubmit={handleEventSubmit} style={{ background: 'var(--bg-sidebar)', padding: '1.5rem', borderRadius: 'var(--border-radius-md)', marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{editingEvent.id ? 'Edit Event' : 'New Event'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="event-title" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Event Title</label>
                                <input id="event-title" name="title" defaultValue={editingEvent.title} placeholder="Event Title" required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="event-type" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Category</label>
                                <select id="event-type" name="type" defaultValue={editingEvent.type} required>
                                    <option value="Workshop">Workshop</option>
                                    <option value="Exhibition">Exhibition</option>
                                    <option value="Performance">Performance</option>
                                    <option value="Market">Market</option>
                                    <option value="Museum">Museum</option>
                                    <option value="Youth/Kids">Youth/Kids</option>
                                    <option value="Cultural Experience">Cultural Experience</option>
                                    <option value="Event">Event</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="event-date" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Date</label>
                                <input id="event-date" name="date" type="date" defaultValue={editingEvent.date} required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="event-time" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Time</label>
                                <input id="event-time" name="time" defaultValue={editingEvent.time} placeholder="Time (e.g. 6:00 PM - 10:00 PM)" required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="event-zoneId" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Region / Town</label>
                                <select id="event-zoneId" name="zoneId" defaultValue={editingEvent.zoneId} required>
                                    {ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="event-artistId" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Presenter / Artist</label>
                                <select id="event-artistId" name="artistId" defaultValue={editingEvent.artistId || ""}>
                                    <option value="">No Artist Attached</option>
                                    {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="event-lat" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Latitude</label>
                                <input id="event-lat" name="lat" type="number" step="any" defaultValue={editingEvent.lat || -29.6910} placeholder="Latitude" required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="event-lng" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Longitude</label>
                                <input id="event-lng" name="lng" type="number" step="any" defaultValue={editingEvent.lng || 152.9333} placeholder="Longitude" required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="event-cost" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Cost</label>
                                <input id="event-cost" name="cost" defaultValue={editingEvent.cost} placeholder="e.g. Free, $15, etc." />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="event-bookingUrl" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Booking URL (Optional)</label>
                                <input id="event-bookingUrl" name="bookingUrl" defaultValue={editingEvent.bookingUrl} placeholder="https://..." />
                            </div>
                            
                            {/* Image Options (URL + Local File upload) */}
                            <div style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 1' }}>
                                <label htmlFor="event-image" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Image URL</label>
                                <input id="event-image" name="image" defaultValue={editingEvent.image && !editingEvent.image.startsWith('data:') ? editingEvent.image : ""} placeholder="Image URL (optional)" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 1' }}>
                                <label htmlFor="event-image-file" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Or Upload File</label>
                                <input id="event-image-file" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'event')} style={{ padding: '0.3rem', border: '1px dashed var(--border-color)', borderRadius: '4px', background: 'white' }} />
                                {eventImageBase64 && <span style={{ fontSize: '0.8rem', color: 'green', marginTop: '0.2rem', fontWeight: 'bold' }}>✓ Loaded: {(eventImageBase64.length / 1024).toFixed(0)} KB</span>}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
                                <label htmlFor="event-description" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Description</label>
                                <textarea id="event-description" name="description" defaultValue={editingEvent.description} placeholder="Description" required rows="3" style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}></textarea>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Save Event</button>
                            <button type="button" className="btn btn-outline" onClick={() => { setEditingEvent(null); setEventImageBase64(""); }} style={{ padding: '0.5rem 1.5rem' }}>Cancel</button>
                        </div>
                    </form>
                )}

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', position: 'sticky', top: 0, background: 'white' }}>
                                <th style={{ padding: '1rem' }}>Title</th>
                                <th style={{ padding: '1rem' }}>Date</th>
                                <th style={{ padding: '1rem' }}>Zone</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(e => {
                                const zone = ZONES.find(z => z.id === e.zoneId);
                                return (
                                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>{e.title}</td>
                                        <td style={{ padding: '1rem' }}>{e.date}</td>
                                        <td style={{ padding: '1rem' }}>{zone?.name || 'Various'}</td>
                                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                            <button className="btn-outline" style={{ padding: '0.3rem 0.6rem' }} onClick={() => { setEditingEvent(e); setEventImageBase64(""); }}>Edit</button>
                                            <button className="btn-outline" style={{ padding: '0.3rem 0.6rem', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => deleteEvent(e.id)}>Delete</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ARTIST EDITOR */}
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <h2 style={{ color: 'var(--accent-primary)', margin: 0 }}>Manage Artists ({artists.length})</h2>
                    <button className="btn btn-primary" onClick={() => { setEditingArtist({}); setArtistImageBase64(""); }} style={{ padding: '0.5rem 1rem' }}>+ Add Artist</button>
                </div>

                {editingArtist !== null && (
                    <form onSubmit={handleArtistSubmit} style={{ background: 'var(--bg-sidebar)', padding: '1.5rem', borderRadius: 'var(--border-radius-md)', marginBottom: '2rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{editingArtist.id ? 'Edit Artist' : 'New Artist'}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="artist-name" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Artist Name</label>
                                <input id="artist-name" name="name" defaultValue={editingArtist.name} placeholder="Artist Name" required />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="artist-type" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Type</label>
                                <input id="artist-type" name="type" defaultValue={editingArtist.type} placeholder="Type (e.g. Musician, Visual Artist)" required />
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="artist-image" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Image URL</label>
                                <input id="artist-image" name="image" defaultValue={editingArtist.image && !editingArtist.image.startsWith('data:') ? editingArtist.image : ""} placeholder="Image URL (optional)" />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <label htmlFor="artist-image-file" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Or Upload File</label>
                                <input id="artist-image-file" type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'artist')} style={{ padding: '0.3rem', border: '1px dashed var(--border-color)', borderRadius: '4px', background: 'white' }} />
                                {artistImageBase64 && <span style={{ fontSize: '0.8rem', color: 'green', marginTop: '0.2rem', fontWeight: 'bold' }}>✓ Loaded: {(artistImageBase64.length / 1024).toFixed(0)} KB</span>}
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gridColumn: 'span 2' }}>
                                <label htmlFor="artist-bio" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Biography</label>
                                <textarea id="artist-bio" name="bio" defaultValue={editingArtist.bio} placeholder="Biography" required rows="3" style={{ width: '100%', padding: '0.8rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}></textarea>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Save Artist</button>
                            <button type="button" className="btn btn-outline" onClick={() => { setEditingArtist(null); setArtistImageBase64(""); }} style={{ padding: '0.5rem 1.5rem' }}>Cancel</button>
                        </div>
                    </form>
                )}

                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-secondary)', position: 'sticky', top: 0, background: 'white' }}>
                                <th style={{ padding: '1rem' }}>Name</th>
                                <th style={{ padding: '1rem' }}>Type</th>
                                <th style={{ padding: '1rem' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {artists.map(a => (
                                <tr key={a.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', fontWeight: '500' }}>{a.name}</td>
                                    <td style={{ padding: '1rem' }}>{a.type}</td>
                                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                                        <button className="btn-outline" style={{ padding: '0.3rem 0.6rem' }} onClick={() => { setEditingArtist(a); setArtistImageBase64(""); }}>Edit</button>
                                        <button className="btn-outline" style={{ padding: '0.3rem 0.6rem', borderColor: '#ef4444', color: '#ef4444' }} onClick={() => deleteArtist(a.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
