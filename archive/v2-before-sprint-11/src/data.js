export const ZONES = [
    { id: 'grafton', name: 'Grafton', color: '#004B87' },
    { id: 'maclean', name: 'Maclean', color: '#F26419' },
    { id: 'yamba', name: 'Yamba', color: '#00A896' },
    { id: 'iluka', name: 'Iluka', color: '#8A1C7C' }
];

export const EVENTS = [
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

export const ARTISTS = [
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
