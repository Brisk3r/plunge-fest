// Grafton Art Gallery - App Logic and Dummy Data

// --- DUMMY DATA / LOCAL STORAGE INITIALIZATION ---
const ZONES = [
    { id: 'grafton', name: 'Grafton', color: '#004B87' },
    { id: 'maclean', name: 'Maclean', color: '#F26419' },
    { id: 'yamba', name: 'Yamba', color: '#00C4B5' },
    { id: 'iluka', name: 'Iluka', color: '#6B8E23' }
];

const DEFAULT_PLUNGE_EVENTS = [
    {
        id: 'p1',
        title: 'Plunge Opening Night Spectacular',
        zoneId: 'grafton',
        date: '2027-04-01',
        endDate: '2027-04-01',
        time: '6:00 PM - 10:00 PM',
        image: 'https://picsum.photos/seed/plunge_opening/800/600',
        description: 'Kick off a month of culture! Live music, street food, and light projections on the Grafton Regional Gallery facade.',
        type: 'Event',
        featured: true,
        lat: -29.6910,
        lng: 152.9333,
        artistId: 'a1'
    },
    {
        id: 'p2',
        title: 'Maclean Highland Art Walk',
        zoneId: 'maclean',
        date: '2027-04-05',
        endDate: '2027-04-10',
        time: 'All Day',
        image: 'https://picsum.photos/seed/maclean_art/800/600',
        description: 'Explore the Scottish town of Maclean as local businesses transform their windows into vibrant pop-up galleries.',
        type: 'Exhibition',
        featured: false,
        lat: -29.4608,
        lng: 153.1979,
        artistId: 'a2'
    },
    {
        id: 'p3',
        title: 'Yamba Beachside Ceramics Workshop',
        zoneId: 'yamba',
        date: '2027-04-12',
        endDate: '2027-04-12',
        time: '10:00 AM - 2:00 PM',
        image: 'https://picsum.photos/seed/yamba_pottery/800/600',
        description: 'Get your hands dirty overlooking Main Beach. Learn hand-building techniques from local potters.',
        type: 'Workshop',
        featured: false,
        lat: -29.4361,
        lng: 153.3619,
        artistId: null
    },
    {
        id: 'p4',
        title: 'Iluka Coastal Weaving',
        zoneId: 'iluka',
        date: '2027-04-18',
        endDate: '2027-04-18',
        time: '1:00 PM - 4:00 PM',
        image: 'https://picsum.photos/seed/iluka_weave/800/600',
        description: 'Learn traditional and contemporary basket weaving using foraged coastal materials.',
        type: 'Workshop',
        featured: false,
        lat: -29.4089,
        lng: 153.3524,
        artistId: null
    },
    {
        id: 'p5',
        title: 'Clarence Valley Creatives Showcase',
        zoneId: 'grafton',
        date: '2027-04-01',
        endDate: '2027-04-30',
        time: '10:00 AM - 4:00 PM',
        image: 'https://picsum.photos/seed/clarence_creatives/800/600',
        description: 'A month-long exhibition showcasing the diverse talent of artists living in the Clarence Valley.',
        type: 'Exhibition',
        featured: false,
        lat: -29.6920,
        lng: 152.9340,
        artistId: 'a2'
    }
];

const DEFAULT_ARTISTS = [
    {
        id: 'a1',
        name: 'Luna Sounds',
        type: 'Musician / Band',
        bio: 'An ambient coastal indie band known for their ethereal soundscapes that blend acoustic roots with modern electronic elements.',
        image: 'https://picsum.photos/seed/lunasounds/400/400'
    },
    {
        id: 'a2',
        name: 'Cassidy River',
        type: 'Visual Artist',
        bio: 'A contemporary painter focusing on the raw, natural textures of the Clarence River basin. Her work often incorporates local clays and pigments.',
        image: 'https://picsum.photos/seed/cassidy/400/400'
    }
];

// Provide reliable fallback images via Picsum to avoid Unsplash hotlinking issues
DEFAULT_PLUNGE_EVENTS.forEach((e, i) => {
    e.image = `https://picsum.photos/seed/plungefest${i}/800/600`;
});

// Load from localStorage or use defaults
let EVENTS = JSON.parse(localStorage.getItem('plunge_events'));
if (!EVENTS || EVENTS.length === 0) {
    EVENTS = DEFAULT_PLUNGE_EVENTS;
}

let ARTISTS = JSON.parse(localStorage.getItem('plunge_artists'));
if (!ARTISTS || ARTISTS.length === 0) {
    ARTISTS = DEFAULT_ARTISTS;
}

// Load user tickets
let USER_TICKETS = JSON.parse(localStorage.getItem('plunge_user_tickets')) || [];

// --- APP STATE ---
let currentView = 'grid'; // 'grid' or 'map'
let currentDate = new Date(2027, 3, 1); // April 2027 for Plunge dummy data context
let activeZones = ZONES.map(z => z.id);
let activeTypeFilter = 'all'; // 'all', 'Exhibition', 'Workshop', 'tickets'

let leafletMap = null;
let mapMarkers = [];

// --- DOM ELEMENTS ---
const elements = {
    eventsGrid: document.getElementById('eventsGrid'),
    artistsGrid: document.getElementById('artistsGrid'),
    programSection: document.getElementById('programSection'),
    artistsSection: document.getElementById('artistsSection'),
    filtersSection: document.getElementById('program'),
    mapSection: document.getElementById('mapSection'),
    mapView: document.getElementById('mapView'),
    zoneFilters: document.getElementById('zoneFilters'),
    eventModal: document.getElementById('eventModal'),
    modalBody: document.getElementById('modalBody'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    currentViewTitle: document.getElementById('currentViewTitle'),
    navbar: document.getElementById('navbar'),
    featuredSection: document.getElementById('featuredSection')
};

window.showSection = function(section) {
    if (section === 'program') {
        elements.programSection.style.display = 'block';
        elements.filtersSection.style.display = 'flex';
        elements.mapSection.style.display = 'block';
        elements.featuredSection.style.display = 'block';
        elements.artistsSection.style.display = 'none';
        
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        document.querySelectorAll('.nav-links a')[0].classList.add('active');
    } else if (section === 'artists') {
        elements.programSection.style.display = 'none';
        elements.filtersSection.style.display = 'none';
        elements.mapSection.style.display = 'none';
        elements.featuredSection.style.display = 'none';
        elements.artistsSection.style.display = 'block';
        
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        document.querySelectorAll('.nav-links a')[1].classList.add('active');
        renderArtists();
    }
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderFeaturedEvent();
    renderZoneFilters();
    renderGrid();
    renderArtists();
    renderMap();
    
    // Add scroll listener for navbar glassmorphism
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            elements.navbar.classList.add('scrolled');
        } else {
            elements.navbar.classList.remove('scrolled');
        }
    });

    // Close modal listeners
    if (elements.closeModalBtn) elements.closeModalBtn.addEventListener('click', closeModal);
    if (elements.eventModal) elements.eventModal.addEventListener('click', (e) => {
        if(e.target === elements.eventModal) closeModal();
    });

    if (typeof setupEventListeners === 'function') {
        setupEventListeners();
    }
});

// --- RENDERING FUNCTIONS ---

function renderFeaturedEvent() {
    const featured = EVENTS.find(e => e.featured);
    if (!featured || !elements.featuredSection) {
        if(elements.featuredSection) elements.featuredSection.style.display = 'none';
        return;
    }

    const zone = ZONES.find(z => z.id === featured.zoneId) || { name: 'Various Locations', color: '#999' };
    const zoneName = zone.name;

    elements.featuredSection.style.display = 'block';
    elements.featuredSection.innerHTML = `
        <div class="featured-card" onclick="openFeaturedModal('${featured.id}')">
            <img src="${featured.image}" alt="${featured.title}">
            <div class="featured-details">
                <span class="featured-badge">Featured Event</span>
                <div style="font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.5rem;">${zoneName}</div>
                <h2 class="featured-title">${featured.title}</h2>
                <div style="display:flex; gap:1rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
                    <span><i class="ph ph-calendar-blank"></i> ${featured.date}</span>
                    <span><i class="ph ph-clock"></i> ${featured.time || 'All Day'}</span>
                </div>
                <p style="color: var(--text-secondary); font-size: 1.1rem; opacity: 0.9;">${featured.description ? featured.description.substring(0, 150) + '...' : ''}</p>
            </div>
        </div>
    `;
}

// Helper to open modal from string literal in HTML
window.openFeaturedModal = function(id) {
    const ev = EVENTS.find(e => e.id === id);
    if(ev) openModal(ev);
};

function renderZoneFilters() {
    elements.zoneFilters.innerHTML = ZONES.map(zone => `
        <div class="zone-filter ${activeZones.includes(zone.id) ? '' : 'inactive'}" data-zone="${zone.id}">
            <div class="zone-color" style="background-color: ${zone.color};"></div>
            <span class="font-heading">${zone.name}</span>
        </div>
    `).join('');

    // Add event listeners to newly created filters
    document.querySelectorAll('.zone-filter').forEach(el => {
        el.addEventListener('click', (e) => {
            const zoneId = e.currentTarget.dataset.zone;
            toggleZone(zoneId);
        });
    });
}

function getFilteredEvents() {
    if (activeTypeFilter === 'tickets') {
        return EVENTS.filter(e => USER_TICKETS.includes(e.id));
    }

    return EVENTS.filter(e => {
        const zoneMatch = activeZones.includes(e.zoneId);
        const typeMatch = activeTypeFilter === 'all' || e.type === activeTypeFilter;
        return zoneMatch && typeMatch;
    });
}

function renderGrid() {
    const eventsToRender = getFilteredEvents();
    
    if (eventsToRender.length === 0) {
        elements.eventsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-tertiary);">No events found for selected zones.</div>`;
        return;
    }

    let eventsGridHTML = '';
    eventsToRender.forEach(e => {
        const z = ZONES.find(zone => zone.id === e.zoneId) || { name: 'Various Locations', color: '#999' };
        
        eventsGridHTML += `
            <div class="event-card" data-id="${e.id}">
                <div class="img-wrapper">
                    <img src="${e.image}" alt="${e.title}" class="event-image">
                </div>
                <div class="event-details">
                    <div class="event-zone" style="color: ${z.color};">${z.name}</div>
                    <h3 class="event-title">${e.title}</h3>
                    <div class="event-meta">
                        <span><i class="ph ph-calendar-blank"></i> ${e.date}</span>
                        <span><i class="ph ph-clock"></i> ${e.time || 'All Day'}</span>
                        <span><i class="ph ph-tag"></i> ${e.type}</span>
                    </div>
                </div>
            </div>
        `;
    });
    if(elements.eventsGrid) elements.eventsGrid.innerHTML = eventsGridHTML;

    // Add click listeners to cards
    document.querySelectorAll('.event-card').forEach(card => {
        card.addEventListener('click', () => {
            const ev = EVENTS.find(e => e.id === card.dataset.id);
            openModal(ev);
        });
    });
}

function renderArtists() {
    if (!elements.artistsGrid) return;
    
    let html = '';
    ARTISTS.forEach(a => {
        html += `
            <div class="event-card" onclick="openArtistModal('${a.id}')">
                <div class="img-wrapper" style="height: 250px;">
                    <img src="${a.image}" alt="${a.name}" class="event-image" style="height: 100%; object-position: top;">
                </div>
                <div class="event-details" style="text-align: center;">
                    <h3 class="event-title" style="margin-bottom: 0.5rem; font-size: 1.5rem;">${a.name}</h3>
                    <div class="featured-badge" style="display:inline-block; margin-bottom: 1rem; padding: 0.3rem 0.8rem;">${a.type}</div>
                    <p style="color: var(--text-secondary); font-size: 0.95rem;">${a.bio.substring(0, 80)}...</p>
                </div>
            </div>
        `;
    });
    elements.artistsGrid.innerHTML = html;
}

window.openArtistModal = function(id) {
    const a = ARTISTS.find(art => art.id === id);
    if(!a) return;
    
    const artistEvents = EVENTS.filter(e => e.artistId === id);
    
    let eventsHtml = '';
    if (artistEvents.length > 0) {
        eventsHtml = `<h3 style="margin-top: 2rem; margin-bottom: 1rem; color: var(--accent-primary);">Performing At:</h3>`;
        artistEvents.forEach(e => {
            const zone = ZONES.find(z => z.id === e.zoneId) || { name: 'Various Locations', color: '#999' };
            eventsHtml += `
                <div style="padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin:0;">${e.title}</h4>
                        <span style="font-size:0.85rem; color: var(--text-tertiary);">${e.date} | ${zone.name}</span>
                    </div>
                    <button class="btn-outline" onclick="openEvent('${e.id}')" style="padding: 0.4rem 1rem;">View</button>
                </div>
            `;
        });
    }

    elements.modalBody.innerHTML = `
        <img src="${a.image}" alt="${a.name}" class="modal-hero" style="object-position: top;">
        <div class="modal-info">
            <span class="featured-tag" style="background: var(--bg-sidebar); color: var(--text-primary); border-color: rgba(0,0,0,0.1)">${a.type}</span>
            <h2 class="font-heading" style="font-size: 2.5rem;">${a.name}</h2>
            
            <div class="modal-desc" style="font-size: 1.1rem; line-height: 1.7; margin-top: 1.5rem;">
                ${a.bio}
            </div>
            
            ${eventsHtml}
        </div>
    `;

    elements.eventModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
};    

function renderMap() {
    const eventsToRender = getFilteredEvents();
    
    // Initialize map if it doesn't exist
    if (!leafletMap) {
        leafletMap = L.map('mapView').setView([-29.6910, 152.9333], 14); // Centered on Grafton

        // Using Google Maps tiles to provide the requested Google Maps experience for free
        L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
            maxZoom: 20,
            subdomains:['mt0','mt1','mt2','mt3'],
            attribution: '&copy; Google Maps'
        }).addTo(leafletMap);
    }
    
    // Ensure map tiles load correctly when unhidden
    setTimeout(() => { leafletMap.invalidateSize(); }, 100);

    // Clear existing markers
    mapMarkers.forEach(marker => leafletMap.removeLayer(marker));
    mapMarkers = [];

    // Add markers for filtered events
    eventsToRender.forEach(e => {
        // Fallback coord if none generated
        const lat = e.lat || (-29.6910 + (Math.random() * 0.02 - 0.01));
        const lng = e.lng || (152.9333 + (Math.random() * 0.02 - 0.01));
        
        const z = ZONES.find(zone => zone.id === e.zoneId) || { name: 'Various Locations', color: '#999' };
        
        // Google Maps style teardrop pin
        const pinSvg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width: 28px; height: 38px; filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.4)); transform: translate(-14px, -38px);">
              <path fill="#EA4335" d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0z"/>
              <circle cx="192" cy="192" r="70" fill="${z.color}"/>
            </svg>
        `;

        const customIcon = L.divIcon({
            className: "custom-pin",
            iconAnchor: [0, 0], // Anchoring handled by SVG transform to ensure pixel-perfect drop point
            html: pinSvg
        });

        const marker = L.marker([lat, lng], {icon: customIcon}).addTo(leafletMap);
        
        marker.bindPopup(`
            <div style="font-family: var(--font-body);">
                <strong style="display:block; margin-bottom: 5px; color: var(--accent-primary);">${e.title}</strong>
                <span style="display:block; font-size: 0.85em; color: var(--text-tertiary);">${e.date} | ${e.time}</span>
                <button onclick="window.openEvent('${e.id}')" style="margin-top: 10px; padding: 5px 10px; border: none; background: var(--accent-primary); color: white; border-radius: 4px; cursor: pointer; width: 100%;">View Event</button>
            </div>
        `);
        
        mapMarkers.push(marker);
    });

    // Fit map bounds to markers if there are any
    if (mapMarkers.length > 0) {
        const group = new L.featureGroup(mapMarkers);
        leafletMap.fitBounds(group.getBounds(), {padding: [50, 50]});
    }
}

// --- INTERACTIONS ---

function toggleZone(zoneId) {
    if (activeZones.includes(zoneId)) {
        activeZones = activeZones.filter(id => id !== zoneId);
    } else {
        activeZones.push(zoneId);
    }
    renderZoneFilters();
    renderGrid();
}

function openModal(event) {
    const zone = ZONES.find(z => z.id === event.zoneId) || { name: 'Various Locations', color: '#999' };
    const d = new Date(event.date);
    const dateStr = d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    elements.modalBody.innerHTML = `
        <img src="${event.image}" alt="${event.title}" class="modal-hero">
        <div class="modal-info">
            <span class="featured-tag" style="background: var(--bg-sidebar); color: var(--text-primary); border-color: rgba(0,0,0,0.1)">${event.type}</span>
            <h2 class="font-heading">${event.title}</h2>
            
            <div class="modal-details">
                <div class="detail-item">
                    <i class="ph ph-calendar-blank"></i>
                    <div class="detail-text">
                        <h4>Date & Time</h4>
                        <p>${dateStr}<br>${event.time}</p>
                    </div>
                </div>
                <div class="detail-item">
                    <i class="ph ph-map-pin"></i>
                    <div class="detail-text">
                        <h4>Location</h4>
                        <p>${zone.name}</p>
                    </div>
                </div>
            </div>
            
            <div class="modal-desc">
                ${event.description}
            </div>
            
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <button class="btn-primary" id="bookTicketBtn" data-id="${event.id}">
                    <i class="ph ${event.bookingUrl ? 'ph-arrow-square-out' : 'ph-ticket'}"></i> 
                    ${event.bookingUrl ? 'Book via External Site' : (USER_TICKETS.includes(event.id) ? 'Ticket Booked!' : 'Book Tickets')}
                </button>
                <button class="btn-outline" id="icsDownloadBtn" style="padding: 1rem 2rem; border-radius: 30px; display: inline-flex; align-items: center; gap: 0.5rem; font-weight: 600; cursor: pointer; border: 1px solid var(--border-color); background: white;">
                    <i class="ph ph-calendar-plus"></i> Save to Calendar
                </button>
            </div>
        </div>
    `;

    elements.eventModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent scrolling

    // Handle ICS Download
    document.getElementById('icsDownloadBtn').addEventListener('click', () => {
        downloadICS(event, zone.name);
    });

    // Handle booking
    const bookBtn = document.getElementById('bookTicketBtn');
    if (event.bookingUrl) {
        bookBtn.addEventListener('click', () => window.open(event.bookingUrl, '_blank'));
    } else if (USER_TICKETS.includes(event.id)) {
        bookBtn.style.opacity = '0.7';
        bookBtn.style.cursor = 'default';
    } else {
        bookBtn.addEventListener('click', () => {
            if (!USER_TICKETS.includes(event.id)) {
                USER_TICKETS.push(event.id);
                localStorage.setItem('plunge_user_tickets', JSON.stringify(USER_TICKETS));
                alert('Ticket booked successfully! You can view it in your Tickets view.');
                closeModal();
                if(activeTypeFilter === 'tickets') renderGrid(); // refresh
            } else {
                alert('You already have a ticket for this event.');
            }
        });
    }
}

function closeModal() {
    elements.eventModal.classList.add('hidden');
    document.body.style.overflow = '';
}

function downloadICS(event, location) {
    // Generate simple ICS format
    const start = new Date(event.date).toISOString().replace(/-|:|\.\d+/g, '');
    let endStr;
    if (event.endDate) {
        const d = new Date(event.endDate);
        d.setDate(d.getDate() + 1); // Full day events usually end the next day in ICS
        endStr = d.toISOString().replace(/-|:|\.\d+/g, '');
    } else {
        endStr = start;
    }

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Grafton Regional Gallery//EN
BEGIN:VEVENT
DTSTAMP:${new Date().toISOString().replace(/-|:|\.\d+/g, '')}
DTSTART;VALUE=DATE:${start.substring(0, 8)}
DTEND;VALUE=DATE:${endStr.substring(0, 8)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Attach to window for inline onclick in calendar pills
window.openEvent = (eventId) => {
    const ev = EVENTS.find(e => e.id === eventId);
    if(ev) openModal(ev);
};

function setupEventListeners() {
    // Month Navigation
    if (elements.prevPeriod) {
        elements.prevPeriod.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            updateView();
        });
    }

    if (elements.nextPeriod) {
        elements.nextPeriod.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            updateView();
        });
    }

    // Modal Close
    if (elements.closeModalBtn) {
        elements.closeModalBtn.addEventListener('click', closeModal);
    }
    if (elements.eventModal) {
        elements.eventModal.addEventListener('click', (e) => {
            if (e.target === elements.eventModal) closeModal();
        });
    }

    // Sidebar Navigation Filtering
    const navItems = document.querySelectorAll('#mainNav .nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            activeTypeFilter = item.dataset.filter;
            if(activeTypeFilter === 'tickets') {
                if(elements.currentViewTitle) elements.currentViewTitle.textContent = "My Booked Tickets";
                const ticketEvents = getFilteredEvents();
                if (ticketEvents.length === 0) {
                    elements.eventsGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 4rem; color: var(--text-tertiary); background: var(--bg-card); border-radius: var(--border-radius-lg); box-shadow: var(--shadow-soft);">
                        <i class="ph ph-ticket" style="font-size: 3rem; margin-bottom: 1rem; color: var(--accent-primary); opacity: 0.5;"></i>
                        <h3 class="font-heading" style="color: var(--text-primary); font-size: 1.5rem; margin-bottom: 0.5rem;">No upcoming tickets</h3>
                        <p>Browse the festival program and book an event to see it here!</p>
                    </div>`;
                } else {
                    renderGrid();
                }
            } else {
                elements.currentViewTitle.textContent = "Festival Program";
                renderGrid();
            }
        });
    });
}

}
