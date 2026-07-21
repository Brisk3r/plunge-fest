import { useState, useEffect } from 'react';

// Open-Meteo API doesn't require keys
// Coordinates for Grafton: -29.6910, 152.9333
const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast?latitude=-29.6910&longitude=152.9333&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Australia%2FSydney&forecast_days=3';

// Simple mapping from WMO Weather code to an icon/description
const getWeatherInfo = (code) => {
    if (code <= 3) return { icon: 'ph-sun', desc: 'Clear/Partly Cloudy' };
    if (code <= 49) return { icon: 'ph-cloud-fog', desc: 'Foggy' };
    if (code <= 69) return { icon: 'ph-cloud-rain', desc: 'Rain' };
    if (code <= 79) return { icon: 'ph-snowflake', desc: 'Snow' };
    if (code <= 99) return { icon: 'ph-cloud-lightning', desc: 'Storms' };
    return { icon: 'ph-cloud', desc: 'Cloudy' };
};

export default function WeatherWidget() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(WEATHER_API_URL)
            .then(res => res.json())
            .then(data => {
                setWeather(data.daily);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch weather:", err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div style={{ padding: '1rem', color: 'var(--text-tertiary)' }}>Loading forecast...</div>;
    if (!weather) return null;

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '1.5rem', 
            padding: '2rem',
            marginBottom: '4rem',
            background: 'var(--bg-sidebar)',
            borderRadius: 'var(--border-radius-lg)',
            boxShadow: 'inset var(--shadow-sm)'
        }}>
            {weather.time.map((dateStr, idx) => {
                const date = new Date(dateStr);
                const dayName = date.toLocaleDateString('en-AU', { weekday: 'short' });
                const { icon, desc } = getWeatherInfo(weather.weathercode[idx]);
                
                return (
                    <div key={dateStr} style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--border-radius-md)',
                        padding: '1.5rem',
                        minWidth: '150px',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow-md)',
                        transition: 'transform 0.2s',
                        cursor: 'default'
                    }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>{dayName}</div>
                        <i className={`ph ${icon}`} style={{ fontSize: '3rem', color: 'var(--accent-primary)', margin: '0.5rem 0' }}></i>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '500' }}>{desc}</div>
                        <div style={{ fontWeight: '800', fontSize: '1.2rem' }}>
                            {Math.round(weather.temperature_2m_max[idx])}° <span style={{ color: 'var(--text-tertiary)', fontWeight: '500', marginLeft: '0.5rem' }}>{Math.round(weather.temperature_2m_min[idx])}°</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
