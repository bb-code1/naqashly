/**
 * ☀️ Astronomical Solar Prayer Calculation & Window Bounds Engine
 * 
 * Provides live astronomical solar calculations via Aladhan REST API & HTML5 Geolocation,
 * with offline mathematical fallback for Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha.
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */

export const CITY_PRESETS = [
  { name: 'London, UK', lat: 51.5074, lng: -0.1278, method: 'MWL', tzOffset: 1 },
  { name: 'Riyadh, Saudi Arabia', lat: 24.7136, lng: 46.6753, method: 'Umm al-Qura', tzOffset: 3 },
  { name: 'Lahore / Karachi, Pakistan', lat: 31.5204, lng: 74.3587, method: 'Karachi', tzOffset: 5 },
  { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708, method: 'Umm al-Qura', tzOffset: 4 },
  { name: 'New York, USA', lat: 40.7128, lng: -74.0060, method: 'ISNA', tzOffset: -4 },
  { name: 'Istanbul, Turkey', lat: 41.0082, lng: 28.9784, method: 'MWL', tzOffset: 3 }
];

/**
 * HTML5 Browser Geolocation Helper
 */
export const getCurrentGPSLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  });
};

/**
 * Reverse Geocode GPS coordinates to human-readable City & Country Name
 */
export const reverseGeocodeLocation = async (lat, lng) => {
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
    if (!res.ok) throw new Error('Geocoding service error');
    const data = await res.json();
    const city = data.city || data.locality || data.principalSubdivision || 'Detected Location';
    const country = data.countryName || '';
    return country ? `${city}, ${country}` : city;
  } catch (err) {
    console.warn('⚠️ Reverse geocoding failed, falling back to coordinates:', err);
    return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
  }
};

/**
 * Forward Geocode custom city query to resolve global locations & coordinates
 */
export const searchGlobalCityLocation = async (query) => {
  if (!query || !query.trim()) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query.trim())}&format=json&limit=5&addressdetails=1`
    );
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    return data.map(item => {
      const city = item.address?.city || item.address?.town || item.address?.village || item.address?.state || item.display_name.split(',')[0];
      const country = item.address?.country || '';
      const name = country ? `${city}, ${country}` : city;
      return {
        name,
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      };
    });
  } catch (err) {
    console.warn('⚠️ Forward geocoding failed:', err);
    return [];
  }
};

/**
 * Fetch Live Prayer Times from Aladhan Open REST API
 */
export const fetchLiveAladhanPrayerTimes = async (lat, lng, methodId = 3) => {
  try {
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lng}&method=${methodId}`
    );
    if (!response.ok) throw new Error('Aladhan API error');
    const data = await response.json();
    return data?.data?.timings || null;
  } catch (err) {
    console.warn('⚠️ Aladhan API unavailable, switching to offline solar formula:', err);
    return null;
  }
};

/**
 * Mathematical Solar Calculator for any Latitude & Longitude on Earth
 */
export const calculateExactSolarTimes = (lat = 51.5074, lng = -0.1278, tzOffset = null, date = new Date()) => {
  const now = date;
  // If tzOffset not supplied, estimate from local Date timezone offset in hours
  const tz = tzOffset !== null ? tzOffset : -now.getTimezoneOffset() / 60;

  const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
  const B = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const EqT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B); // in minutes
  const decl = 23.45 * Math.sin(B); // solar declination in degrees

  const toRad = (deg) => (deg * Math.PI) / 180;
  const toDeg = (rad) => (rad * 180) / Math.PI;

  const latRad = toRad(lat);
  const declRad = toRad(decl);

  // Solar Noon (Dhuhr) in hours from midnight local time
  const dhuhrHours = 12 + (tz * 15 - lng) / 15 - EqT / 60;

  // Helper to compute hour angle w for a given sun altitude angle alpha (in degrees)
  const getHourAngle = (alphaDeg) => {
    const alphaRad = toRad(alphaDeg);
    const cosW = (Math.sin(alphaRad) - Math.sin(latRad) * Math.sin(declRad)) / (Math.cos(latRad) * Math.cos(declRad));
    if (cosW > 1) return 0; // Sun never rises
    if (cosW < -1) return Math.PI; // Sun never sets
    return Math.acos(cosW);
  };

  // Fajr: Sun 18 degrees below horizon
  const wFajr = getHourAngle(-18);
  const fajrMins = Math.round((dhuhrHours - toDeg(wFajr) / 15) * 60);

  // Sunrise: Sun 0.833 degrees below horizon
  const wSunrise = getHourAngle(-0.833);
  const sunriseMins = Math.round((dhuhrHours - toDeg(wSunrise) / 15) * 60);

  // Dhuhr: Solar Noon
  const dhuhrMins = Math.round(dhuhrHours * 60);

  // Asr (Standard / Shafi): shadow length = object length + noon shadow
  const phiMinusDelta = Math.abs(latRad - declRad);
  const asrAltRad = Math.atan(1 / (1 + Math.tan(phiMinusDelta)));
  const wAsr = getHourAngle(toDeg(asrAltRad));
  const asrMins = Math.round((dhuhrHours + toDeg(wAsr) / 15) * 60);

  // Maghrib / Sunset: Sun 0.833 degrees below horizon
  const maghribMins = Math.round((dhuhrHours + toDeg(wSunrise) / 15) * 60);

  // Isha: Sun 18 degrees below horizon
  const ishaMins = Math.round((dhuhrHours + toDeg(wFajr) / 15) * 60);

  return {
    fajrMins,
    sunriseMins,
    dhuhrMins,
    asrMins,
    maghribMins,
    ishaMins
  };
};

/**
 * Calculate today's solar prayer boundaries based on location and Date.
 */
export const calculateSolarBoundaries = (cityInput = CITY_PRESETS[0], customTimings = null) => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMins = currentHour * 60 + currentMinute;

  let cityObj = typeof cityInput === 'string' 
    ? (CITY_PRESETS.find(c => c.name === cityInput) || { name: cityInput, lat: 51.5074, lng: -0.1278 }) 
    : cityInput;

  let fajrMins, sunriseMins, dhuhrMins, asrMins, maghribMins, ishaMins;

  if (customTimings && customTimings.Fajr) {
    const parseTimeString = (str) => {
      if (!str) return 0;
      const clean = str.split(' ')[0];
      const [h, m] = clean.split(':').map(Number);
      return h * 60 + m;
    };
    fajrMins = parseTimeString(customTimings.Fajr);
    sunriseMins = parseTimeString(customTimings.Sunrise);
    dhuhrMins = parseTimeString(customTimings.Dhuhr);
    asrMins = parseTimeString(customTimings.Asr);
    maghribMins = parseTimeString(customTimings.Maghrib);
    ishaMins = parseTimeString(customTimings.Isha);
  } else {
    const lat = cityObj.lat || 51.5074;
    const lng = cityObj.lng || -0.1278;
    const tzOffset = cityObj.tzOffset !== undefined ? cityObj.tzOffset : null;

    const times = calculateExactSolarTimes(lat, lng, tzOffset, now);
    fajrMins = times.fajrMins;
    sunriseMins = times.sunriseMins;
    dhuhrMins = times.dhuhrMins;
    asrMins = times.asrMins;
    maghribMins = times.maghribMins;
    ishaMins = times.ishaMins;
  }

  // Format HH:MM AM/PM helper
  const formatMins = (totalMins) => {
    let m = ((totalMins % 1440) + 1440) % 1440;
    const hrs = Math.floor(m / 60);
    const mins = m % 60;
    const period = hrs >= 12 ? 'PM' : 'AM';
    const displayHrs = hrs % 12 === 0 ? 12 : hrs % 12;
    return `${String(displayHrs).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
  };

  // Determine current active solar window
  let activeSolarWindow = 'EVENING';
  let currentPhaseLabel = '🌙 Night & Isha Block';
  let nextCutoffLabel = '';
  let minsRemaining = 0;

  if (currentTimeMins >= fajrMins && currentTimeMins < dhuhrMins) {
    activeSolarWindow = 'MORNING';
    currentPhaseLabel = '🌅 Dawn & Fajr Block';
    if (currentTimeMins < sunriseMins) {
      minsRemaining = sunriseMins - currentTimeMins;
      nextCutoffLabel = `⚠️ ${minsRemaining}m left before Sunrise cutoff (${formatMins(sunriseMins)})`;
    } else {
      minsRemaining = dhuhrMins - currentTimeMins;
      nextCutoffLabel = `☀️ ${Math.floor(minsRemaining / 60)}h ${minsRemaining % 60}m until Dhuhr (${formatMins(dhuhrMins)})`;
    }
  } else if (currentTimeMins >= dhuhrMins && currentTimeMins < maghribMins) {
    activeSolarWindow = 'AFTERNOON';
    currentPhaseLabel = '☀️ Midday Dhuhr & Asr Block';
    if (currentTimeMins < asrMins) {
      minsRemaining = asrMins - currentTimeMins;
      nextCutoffLabel = `🕌 Asr in ${minsRemaining}m (${formatMins(asrMins)})`;
    } else {
      minsRemaining = maghribMins - currentTimeMins;
      nextCutoffLabel = `🌇 Maghrib / Sunset in ${minsRemaining}m (${formatMins(maghribMins)})`;
    }
  } else {
    activeSolarWindow = 'EVENING';
    currentPhaseLabel = '🌙 Maghrib, Isha & Night Block';
    if (currentTimeMins >= maghribMins && currentTimeMins < ishaMins) {
      minsRemaining = ishaMins - currentTimeMins;
      nextCutoffLabel = `🕌 Isha in ${minsRemaining}m (${formatMins(ishaMins)})`;
    } else {
      const minsUntilFajr = (1440 - currentTimeMins) + fajrMins;
      nextCutoffLabel = `🌅 Fajr tomorrow in ${Math.floor(minsUntilFajr / 60)}h ${minsUntilFajr % 60}m (${formatMins(fajrMins)})`;
    }
  }

  // Calculate sun position percentage along 24h arc (0% to 100%)
  const arcPercentage = Math.round((currentTimeMins / 1440) * 100);

  return {
    city: cityObj,
    fajrStr: formatMins(fajrMins),
    sunriseStr: formatMins(sunriseMins),
    dhuhrStr: formatMins(dhuhrMins),
    asrStr: formatMins(asrMins),
    maghribStr: formatMins(maghribMins),
    ishaStr: formatMins(ishaMins),
    activeSolarWindow,
    currentPhaseLabel,
    nextCutoffLabel,
    currentTimeMins,
    arcPercentage
  };
};
