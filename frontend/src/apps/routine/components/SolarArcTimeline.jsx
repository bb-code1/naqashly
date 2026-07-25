import React, { useState, useEffect } from 'react';
import { CITY_PRESETS, calculateSolarBoundaries } from '../../../utils/solarCalculator';

/**
 * ☀️ Zen Minimalist Solar Horizon Component
 * 
 * Provides a slim micro-arc strip by default, with a 1-tap collapsible details drawer
 * displaying astronomical solstices and city selection.
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const SolarArcTimeline = ({ selectedCity, onCityChange, isExpanded, onToggleExpand }) => {
  const [solarData, setSolarData] = useState(() => calculateSolarBoundaries(selectedCity));

  useEffect(() => {
    const update = () => setSolarData(calculateSolarBoundaries(selectedCity));
    update();
    const timer = setInterval(update, 30000);
    return () => clearInterval(timer);
  }, [selectedCity]);

  return (
    <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.85rem 1.15rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* 1. SLIM MICRO-SOLAR STRIP & TOGGLE ROW */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.1rem' }}>☀️</span>
          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-heading)' }}>
            {solarData.currentPhaseLabel}
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: '800', background: 'rgba(245, 158, 11, 0.12)', color: '#F59E0B', padding: '0.15rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.25)' }}>
            {solarData.nextCutoffLabel}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {/* Micro Sun Track Strip */}
          <div style={{ position: 'relative', width: '120px', height: '6px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, width: `${solarData.arcPercentage}%`, height: '100%', background: 'linear-gradient(to right, #6366F1, #F59E0B, #10B981)' }} />
          </div>

          <button
            type="button"
            onClick={onToggleExpand}
            style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
          >
            {isExpanded ? '▲ Hide Details' : '☀️ Solar Times ▾'}
          </button>
        </div>
      </div>

      {/* 2. 1-TAP COLLAPSIBLE SOLAR DETAILS DRAWER */}
      {isExpanded && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Astronomical Boundaries for 📍 <strong>{solarData.city.name}</strong> ({solarData.city.method})
            </span>

            <select
              value={selectedCity.name}
              onChange={(e) => {
                const matched = CITY_PRESETS.find(c => c.name === e.target.value);
                if (matched) {
                  onCityChange(matched.name);
                } else {
                  onCityChange(e.target.value);
                }
              }}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.75rem', outline: 'none', cursor: 'pointer' }}
            >
              {!CITY_PRESETS.some(c => c.name === selectedCity.name) && selectedCity.name && (
                <option value={selectedCity.name}>📍 {selectedCity.name}</option>
              )}
              {CITY_PRESETS.map(c => (
                <option key={c.name} value={c.name}>📍 {c.name} ({c.method})</option>
              ))}
            </select>
          </div>

          {/* Prayer Time Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '0.5rem', background: 'var(--bg-surface)', padding: '0.65rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            {[
              { label: 'Fajr', time: solarData.fajrStr, icon: '🌅' },
              { label: 'Sunrise', time: solarData.sunriseStr, icon: '☀️' },
              { label: 'Dhuhr', time: solarData.dhuhrStr, icon: '🌤️' },
              { label: 'Asr', time: solarData.asrStr, icon: '⛅' },
              { label: 'Maghrib', time: solarData.maghribStr, icon: '🌇' },
              { label: 'Isha', time: solarData.ishaStr, icon: '🌙' }
            ].map((item, idx) => (
              <div key={idx} style={{ textAlign: 'center', padding: '0.35rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-heading)' }}>{item.icon} {item.label}</div>
                <div style={{ fontSize: '0.7rem', color: '#F59E0B', fontWeight: '800', fontFamily: 'monospace' }}>{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
