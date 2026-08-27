/**
 * Centralized Typed Environment Configuration Consumer.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const ENV = {
  API_GATEWAY_URL: import.meta.env.VITE_API_GATEWAY_URL || '/api/v1',
  GATEWAY_HEALTH_URL: import.meta.env.VITE_GATEWAY_HEALTH_URL || '/actuator/health',


  APP_NAME: import.meta.env.VITE_APP_NAME || 'Naqashly Life OS',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  DEFAULT_ROUTINE_PROFILE: import.meta.env.VITE_DEFAULT_ROUTINE_PROFILE || 'SECULAR',
  APP_MODE: import.meta.env.VITE_APP_MODE || 'ALL',

  TELEGRAM_BOT_USERNAME: import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'Naqashly_bot',
  WHATSAPP_BOT_NUMBER: import.meta.env.VITE_WHATSAPP_BOT_NUMBER || '+14155238886',

  API_TIMEOUT_MS: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 10000,
  PAIRING_CODE_TTL_SECONDS: Number(import.meta.env.VITE_PAIRING_CODE_TTL_SECONDS) || 300,
  DEBOUNCE_SLIDER_MS: Number(import.meta.env.VITE_DEBOUNCE_SLIDER_MS) || 300,

  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '50753218757-d3h0bm0bp49am63jgdkkk89im835rjgg.apps.googleusercontent.com'

};
