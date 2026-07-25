/**
 * 🔔 Web Notifications & Web Audio API Chime Engine
 * 
 * Manages native browser Notification API permissions, notification dispatching,
 * and pure Web Audio API ambient chime synthesis (432Hz sine bell).
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */

// Global AudioContext singleton instance
let audioCtx = null;

/**
 * 🔊 Synthesize a peaceful 432Hz twin-sine bell chime using Web Audio API
 */
export const playAmbientChime = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    // Primary 432Hz fundamental sine wave
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(432, now); // Harmonic A432Hz bell

    // Harmonically tuned overtone (648Hz - Perfect 5th)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(648, now);

    // Smooth envelope exponential decay (soft attack -> peaceful decay)
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

    gain2.gain.setValueAtTime(0.001, now);
    gain2.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);

    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.5);
    osc2.stop(now + 2.0);
  } catch (err) {
    console.warn('[NotificationEngine] Audio chime play warning:', err);
  }
};

/**
 * 🔔 Request native browser notification permission
 */
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    alert('Browser notifications are not supported in this browser.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  const permission = await Notification.requestPermission();
  return permission;
};

/**
 * 📢 Dispatch a native browser Web Notification
 */
export const sendWebNotification = (title, options = {}) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [200, 100, 200],
      ...options
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    return notification;
  } catch (err) {
    console.warn('[NotificationEngine] Failed to dispatch web notification:', err);
    return null;
  }
};

/**
 * 🌅 Trigger Solar Cutoff Warning (Web Notification + Optional Audio Chime)
 */
export const triggerSolarCutoffNotification = (eventName, minsLeft, audioEnabled = true) => {
  const title = `🌅 ${eventName} Cutoff Warning!`;
  const body = `Only ${minsLeft} minutes remaining before ${eventName} window closes. Complete your habits now!`;

  sendWebNotification(title, { body, tag: `solar-cutoff-${eventName}` });

  if (audioEnabled) {
    playAmbientChime();
  }
};
