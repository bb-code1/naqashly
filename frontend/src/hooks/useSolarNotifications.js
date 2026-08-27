import { useEffect, useRef } from 'react';
import { calculateExactSolarTimes } from '../utils/solarCalculator';
import { triggerSolarCutoffNotification } from '../utils/notificationEngine';

/**
 * 🌅 Smart Solar Cutoff Notification Hook
 * 
 * Monitors current time against astronomical solar boundaries every 30 seconds.
 * Triggers native browser notifications and ambient audio chimes 10 minutes before window cutoffs.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const useSolarNotifications = ({
  selectedCity,
  notificationsEnabled = false,
  audioEnabled = true
}) => {
  const notifiedEventsRef = useRef(new Set());

  useEffect(() => {
    if (!notificationsEnabled || !selectedCity) return;

    const checkSolarCutoffs = () => {
      try {
        const solarData = calculateExactSolarTimes(new Date(), selectedCity.lat, selectedCity.lng);
        if (!solarData || !solarData.boundaries) return;

        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();

        // Check solar boundaries
        Object.entries(solarData.boundaries).forEach(([boundaryKey, b]) => {
          if (!b || !b.cutoffTime) return;

          const [cHours, cMins] = b.cutoffTime.split(':').map(Number);
          const cutoffTotalMins = cHours * 60 + cMins;

          const diffMins = cutoffTotalMins - currentMins;

          // Deduplication key per event + date
          const todayStr = now.toISOString().split('T')[0];
          const dedupeKey = `${todayStr}-${boundaryKey}-10m`;

          // If within 1 to 10 minutes before cutoff and not yet notified today
          if (diffMins > 0 && diffMins <= 10 && !notifiedEventsRef.current.has(dedupeKey)) {
            notifiedEventsRef.current.add(dedupeKey);
            triggerSolarCutoffNotification(b.label || boundaryKey, diffMins, audioEnabled);
          }
        });
      } catch (err) {
        console.warn('[useSolarNotifications] Error checking solar cutoffs:', err);
      }
    };

    // Initial check
    checkSolarCutoffs();

    // Check every 30 seconds
    const interval = setInterval(checkSolarCutoffs, 30000);
    return () => clearInterval(interval);
  }, [selectedCity, notificationsEnabled, audioEnabled]);
};
