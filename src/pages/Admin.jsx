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

    // Bulk Import States
    const [importMode, setImportMode] = useState("merge"); // 'merge' or 'overwrite'
    const [bulkStatusMsg, setBulkStatusMsg] = useState("");

    // Embed Generator States
    const [embedZone, setEmbedZone] = useState("all");
    const [embedType, setEmbedType] = useState("all");
    const [embedSection, setEmbedSection] = useState("program");
    const [embedHideNav, setEmbedHideNav] = useState(true);
    const [embedHeight, setEmbedHeight] = useState("650");
    const [copySuccess, setCopySuccess] = useState(false);

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

    // --- BULK DATA EXPORT / TEMPLATE DOWNLOAD ---
    const downloadJSON = (data, filename) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const downloadTemplate = () => {
        const templateData = {
            events: [
                {
                    id: "p_sample1",
                    title: "Sample Festival Workshop",
                    zoneId: "grafton",
                    date: "2026-04-15",
                    time: "10:00 AM - 12:00 PM",
                    image: "/images/CRLS/14 - Wearable Art Workshop.webp",
                    description: "Sample description for bulk data upload template.",
                    type: "Workshop",
                    lat: -29.6910,
                    lng: 152.9333,
                    artistId: "a1",
                    cost: "Free",
                    bookingUrl: "https://example.com/book"
                }
            ],
            artists: [
                {
                    id: "a_sample1",
                    name: "Jane Doe",
                    type: "Visual Artist",
                    bio: "Sample bio description for artist template.",
                    image: "/images/Grafton Regional Gallery/GRG - ART CART - 009 - Media.webp"
                }
            ]
        };
        downloadJSON(templateData, "plunge_data_template.json");
    };

    const exportFullDatabase = () => {
        const dbExport = { events, artists, exportDate: new Date().toISOString() };
        downloadJSON(dbExport, `plunge_database_backup_${new Date().toISOString().slice(0,10)}.json`);
    };

    // --- BULK DATA IMPORT ---
    const handleBulkImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const parsed = JSON.parse(evt.target.result);
                const importedEvents = parsed.events || (Array.isArray(parsed) ? parsed : []);
                const importedArtists = parsed.artists || [];

                if (importedEvents.length === 0 && importedArtists.length === 0) {
                    alert("No valid events or artists array found in JSON file.");
                    return;
                }

                if (importMode === 'overwrite') {
                    if (window.confirm(`Overwriting entire database! Found ${importedEvents.length} events and ${importedArtists.length} artists. Proceed?`)) {
                        setEvents(importedEvents);
                        if (importedArtists.length > 0) setArtists(importedArtists);
                        setBulkStatusMsg(`Success! Fully rewrote database with ${importedEvents.length} events and ${importedArtists.length} artists.`);
                    }
                } else {
                    // Merge Mode
                    const existingEventIds = new Set(events.map(ev => ev.id));
                    const newEvents = [...events];

                    importedEvents.forEach(item => {
                        const idx = newEvents.findIndex(ev => ev.id === item.id);
                        if (idx >= 0) {
                            newEvents[idx] = { ...newEvents[idx], ...item };
                        } else {
                            newEvents.push(item);
                        }
                    });

                    setEvents(newEvents);

                    if (importedArtists.length > 0) {
                        const newArtists = [...artists];
                        importedArtists.forEach(art => {
                            const idx = newArtists.findIndex(a => a.id === art.id);
                            if (idx >= 0) {
                                newArtists[idx] = { ...newArtists[idx], ...art };
                            } else {
                                newArtists.push(art);
                            }
                        });
                        setArtists(newArtists);
                    }

                    setBulkStatusMsg(`Success! Merged ${importedEvents.length} events and ${importedArtists.length} artists into active dataset.`);
                }
            } catch (err) {
                console.error("Failed to parse JSON file:", err);
                alert("Invalid JSON file format. Please check the file and try again.");
            }
        };
        reader.readAsText(file);
    };

    // --- IFRAME GENERATOR LOGIC ---
    const getBaseSiteUrl = () => {
        return `${window.location.protocol}//${window.location.host}${import.meta.env.BASE_URL}`;
    };

    const generateEmbedUrl = () => {
        const baseUrl = getBaseSiteUrl();
        const params = new URLSearchParams();
        if (embedZone !== 'all') params.append('zone', embedZone);
        if (embedType !== 'all') params.append('type', embedType);
        if (embedSection !== 'program') params.append('section', embedSection);
        if (embedHideNav) params.append('embed', 'true');
        
        const queryString = params.toString();
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    };

    const generateIframeCode = () => {
        const embedUrl = generateEmbedUrl();
        return `<iframe src="${embedUrl}" width="100%" height="${embedHeight}px" style="border: 1px solid var(--border-color, #e2e8f0); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);" title="Plunge Festival 2026 Schedule"></iframe>`;
    };

    const copyIframeToClipboard = () => {
        const code = generateIframeCode();
        navigator.clipboard.writeText(code).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        }).catch(err => {
            console.error("Clipboard copy failed:", err);
            alert("Copy failed. Code:\n" + code);
        });
    };

    // --- EVENT CRUD ---
    const handleEventSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
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
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Add, edit, bulk upload, or embed items in the database.</p>
                </div>
                <button className="btn btn-primary" onClick={resetDefaults} style={{ background: 'var(--accent-secondary)' }}>Factory Reset Data</button>
            </div>

            {/* BULK DATA IMPORT & EXPORT SUITE */}
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: '3rem', border: '1px solid var(--border-color)' }}>
                <h2 style={{ color: 'var(--accent-primary)', margin: '0 0 0.5rem 0' }}>📦 Bulk Content Import & Export Suite</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Download clean templates, backup active festival data, or bulk-upload events and artists via JSON.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    {/* DOWNLOAD TEMPLATE */}
                    <div style={{ background: 'var(--bg-sidebar)', padding: '1.25rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>1. Download JSON Template</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Get a pre-formatted sample dataset to fill out with your new events.
                        </p>
                        <button className="btn btn-outline" onClick={downloadTemplate} style={{ width: '100%', padding: '0.5rem' }}>
                            <i className="ph ph-download-simple"></i> Download Template
                        </button>
                    </div>

                    {/* EXPORT FULL BACKUP */}
                    <div style={{ background: 'var(--bg-sidebar)', padding: '1.25rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>2. Export Current Data</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                            Export all {events.length} active events and {artists.length} artists as a JSON backup.
                        </p>
                        <button className="btn btn-outline" onClick={exportFullDatabase} style={{ width: '100%', padding: '0.5rem' }}>
                            <i className="ph ph-export"></i> Export Active Database
                        </button>
                    </div>

                    {/* UPLOAD / IMPORT DATA */}
                    <div style={{ background: 'var(--bg-sidebar)', padding: '1.25rem', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>3. Bulk Upload JSON</h4>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                            <label style={{ cursor: 'pointer' }}>
                                <input type="radio" name="importMode" value="merge" checked={importMode === 'merge'} onChange={() => setImportMode('merge')} /> Merge Mode
                            </label>
                            <label style={{ cursor: 'pointer', color: '#ef4444' }}>
                                <input type="radio" name="importMode" value="overwrite" checked={importMode === 'overwrite'} onChange={() => setImportMode('overwrite')} /> Full Rewrite
                            </label>
                        </div>
                        <input type="file" accept=".json" onChange={handleBulkImportFile} style={{ width: '100%', fontSize: '0.85rem' }} />
                    </div>
                </div>

                {bulkStatusMsg && (
                    <div style={{ padding: '0.75rem 1rem', background: '#ecfdf5', color: '#065f46', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600 }}>
                        {bulkStatusMsg}
                    </div>
                )}
            </div>

            {/* INTERACTIVE IFRAME EMBED GENERATOR */}
            <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: 'var(--border-radius-lg)', boxShadow: 'var(--shadow-md)', marginBottom: '3rem', border: '1px solid var(--border-color)' }}>
                <h2 style={{ color: 'var(--accent-primary)', margin: '0 0 0.5rem 0' }}>🔗 Custom Iframe Embed Generator</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                    Generate a customizable embed code to embed the live festival schedule into CVC Council or Grafton Regional Gallery web pages.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label htmlFor="embed-zone" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Filter Region</label>
                        <select id="embed-zone" value={embedZone} onChange={e => setEmbedZone(e.target.value)}>
                            <option value="all">All Regions</option>
                            {ZONES.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label htmlFor="embed-type" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Filter Category</label>
                        <select id="embed-type" value={embedType} onChange={e => setEmbedType(e.target.value)}>
                            <option value="all">All Categories</option>
                            <option value="Workshop">Workshops & Talks</option>
                            <option value="Exhibition">Exhibitions & Studios</option>
                            <option value="Performance">Performances</option>
                            <option value="Market">Markets</option>
                            <option value="Museum">Museums</option>
                            <option value="Youth/Kids">Youth & Kids</option>
                            <option value="Cultural Experience">Cultural Experiences</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label htmlFor="embed-section" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Default View</label>
                        <select id="embed-section" value={embedSection} onChange={e => setEmbedSection(e.target.value)}>
                            <option value="program">Program Grid</option>
                            <option value="timeline">April Calendar Timeline</option>
                            <option value="artists">Presenters & Artists</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label htmlFor="embed-height" style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Iframe Height (px)</label>
                        <input id="embed-height" type="number" value={embedHeight} onChange={e => setEmbedHeight(e.target.value)} placeholder="650" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
                        <input id="embed-hidenav" type="checkbox" checked={embedHideNav} onChange={e => setEmbedHideNav(e.target.checked)} style={{ width: '18px', height: '18px' }} />
                        <label htmlFor="embed-hidenav" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Seamless Embed (Hide Nav Bar)</label>
                    </div>
                </div>

                {/* GENERATED CODE SNIPPET */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Generated Embed Code</label>
                        <button className="btn btn-primary" onClick={copyIframeToClipboard} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                            <i className="ph ph-copy"></i> {copySuccess ? '✓ Copied to Clipboard!' : 'Copy Embed Code'}
                        </button>
                    </div>
                    <textarea 
                        readOnly 
                        value={generateIframeCode()} 
                        rows="3" 
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.85rem', padding: '0.8rem', borderRadius: '6px', background: 'var(--bg-sidebar)', border: '1px solid var(--border-color)' }} 
                    />
                </div>

                {/* LIVE PREVIEW CONTAINER */}
                <div>
                    <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--text-secondary)' }}>Live Iframe Preview</h4>
                    <iframe 
                        src={generateEmbedUrl()} 
                        width="100%" 
                        height={`${embedHeight}px`} 
                        style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}
                        title="Live Embed Preview"
                    />
                </div>
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
