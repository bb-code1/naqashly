import React, { useState, useEffect } from 'react';
import { CITY_PRESETS, calculateSolarBoundaries } from '../../../utils/solarCalculator';

/**
 * ☀️ Atmospheric Solar Arc Visual Horizon Component
 * 
 * Renders a glowing astronomical solar arc representing Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha.
 * Includes a live moving celestial sun/moon orb and live cutoff countdown warnings!
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const SolarArcTimeline = ({ selectedCity, onCityChange }) => {
  const [solarData, setSolarData] = useState(() => calculateSolarBoundaries(selectedCity));

  useEffect(() => {
    const update = () => setSolarData(calculateSolarBoundaries(selectedCity));
    update();
    const timer = setInterval(update, 30000); // Refresh every 30s
    return () => clearInterval(timer);
  }, [selectedCity]);

  return (
    <div style={{ background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.98))', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)' }}>
      {/* Header Info & Location Pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.3rem' }}>☀️</span>
          <div>
            <h3 style={{ fontSize: '1.02rem', fontWeight: '800', color: '#F59E0B', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Solar Astronomical Horizon
              <span style={{ fontSize: '0.68rem', fontWeight: '900', background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', padding: '0.1rem 0.45rem', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                DYNAMIC SOLAR MODE
              </span>
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {solarData.currentPhaseLabel}
            </span>
          </div>
        </div>

        {/* Live Cutoff Countdown & Location Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '0.4rem 0.85rem', borderRadius: '8px', fontSize: '0.78rem', fontWeight: '800', color: '#F59E0B' }}>
            {solarData.nextCutoffLabel}
          </div>

          <select
            value={selectedCity.name}
            onChange={(e) => {
              const matched = CITY_PRESETS.find(c => c.name === e.target.value);
              if (matched) onCityChange(matched);
            }}
            style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', padding: '0.4rem 0.75rem', fontSize: '0.78rem', fontWeight: '700', outline: 'none', cursor: 'pointer' }}
          >
            {CITY_PRESETS.map(c => (
              <option key={c.name} value={c.name}>📍 {c.name} ({c.method})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Atmospheric Solar Arc Banner Graphic */}
      <div style={{ position: 'relative', height: '60px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
        {/* Arc Background Track Line */}
        <div style={{ position: 'absolute', left: '2rem', right: '2rem', height: '2px', background: 'linear-gradient(to right, #4338CA, #F59E0B, #10B981, #EC4899, #6366F1)' }} />

        {/* Celestial Moving Orb Indicator */}
        <div
          style={{
            position: 'absolute',
            left: `calc(${solarData.arcPercentage}% - 10px)`,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#F59E0B',
            boxShadow: '0 0 16px #F59E0B, 0 0 32px #F59E0B',
            transition: 'left 1s ease',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem'
          }}
          title={`Sun Position: ${solarData.arcPercentage}%`}
        >
          ☀️
        </div>

        {/* Prayer Time Micro Milestone Badges */}
        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', zIndex: 1, position: 'relative' }}>
          {[
            { label: 'Fajr', time: solarData.fajrStr, icon: '🌅' },
            { label: 'Sunrise', time: solarData.sunriseStr, icon: '☀️' },
            { label: 'Dhuhr', time: solarData.dhuhrStr, icon: '🌤️' },
            { label: 'Asr', time: solarData.asrStr, icon: '⛅' },
            { label: 'Maghrib', time: solarData.maghribStr, icon: '🌇' },
            { label: 'Isha', time: solarData.ishaStr, icon: '🌙' }
          ].map((item, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-heading)' }}>{item.icon} {item.label}</span>
              <span style={{ fontSize: '0.68rem', color: '#F59E0B', fontFamily: 'monospace', fontWeight: '700' }}>{item.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
