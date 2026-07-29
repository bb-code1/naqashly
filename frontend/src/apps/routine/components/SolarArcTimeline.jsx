import React, { useState, useEffect } from 'react';
import { calculateSolarBoundaries, calculateSolarBoundariesAsync } from '../../../utils/solarCalculator';

/**
 * ☀️ Zen Minimalist Solar Horizon Component
 * 
 * Displays live astronomical solar boundaries with 1-tap collapsible details drawer.
 */
export const SolarArcTimeline = ({ selectedCity, onCityChange, isExpanded, onToggleExpand }) => {
  const [solarData, setSolarData] = useState(() => calculateSolarBoundaries(selectedCity));

  useEffect(() => {
    let isMounted = true;
    const update = async () => {
      try {
        const asyncData = await calculateSolarBoundariesAsync(selectedCity);
        if (isMounted && asyncData) {
          setSolarData(asyncData);
        }
      } catch (err) {
        if (isMounted) {
          setSolarData(calculateSolarBoundaries(selectedCity));
        }
      }
    };

    update();
    const timer = setInterval(update, 30000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [selectedCity]);

  const cityName = typeof selectedCity === 'object' ? selectedCity.name : selectedCity;
  const lat = typeof selectedCity === 'object' ? selectedCity.lat : 51.5074;
  const lng = typeof selectedCity === 'object' ? selectedCity.lng : -0.1278;
  const method = typeof selectedCity === 'object' ? selectedCity.method || 'MWL' : 'MWL';

  return (
    <div className="solar-timeline-card">
      {/* 1. SLIM MICRO-SOLAR STRIP & TOGGLE ROW */}
      <div className="solar-timeline-banner">
        <div className="solar-timeline-title-row">
          <span className="solar-icon">☀️</span>
          <span className="solar-phase-label">
            {solarData.currentPhaseLabel}
          </span>
          <span className="solar-cutoff-badge">
            {solarData.nextCutoffLabel}
          </span>
        </div>

        <div className="solar-timeline-actions-row">
          {/* Micro Sun Track Strip */}
          <div className="solar-track-bar">
            <div className="solar-track-progress" style={{ width: `${solarData.arcPercentage}%` }} />
          </div>

          <button
            type="button"
            onClick={onToggleExpand}
            className="solar-expand-btn"
          >
            {isExpanded ? '▲ Hide Details' : '☀️ Solar Times ▾'}
          </button>
        </div>
      </div>

      {/* 2. 1-TAP COLLAPSIBLE SOLAR DETAILS DRAWER */}
      {isExpanded && (
        <div className="solar-details-drawer">
          <div className="solar-meta-row">
            <span className="solar-meta-text">
              Astronomical Solstice Boundaries for 📍 <strong>{cityName}</strong> <span className="solar-coordinates-meta">({Number(lat).toFixed(2)}°, {Number(lng).toFixed(2)}° • Method: {method})</span>
            </span>
          </div>

          {/* Prayer Time Grid */}
          <div className="solar-prayer-grid">
            {[
              { label: 'Fajr', time: solarData.fajrStr, icon: '🌅' },
              { label: 'Sunrise', time: solarData.sunriseStr, icon: '☀️' },
              { label: 'Dhuhr', time: solarData.dhuhrStr, icon: '🌤️' },
              { label: 'Asr', time: solarData.asrStr, icon: '⛅' },
              { label: 'Maghrib', time: solarData.maghribStr, icon: '🌇' },
              { label: 'Isha', time: solarData.ishaStr, icon: '🌙' }
            ].map((item, idx) => (
              <div key={idx} className="solar-prayer-item">
                <div className="solar-prayer-label">{item.icon} {item.label}</div>
                <div className="solar-prayer-time font-mono">{item.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
