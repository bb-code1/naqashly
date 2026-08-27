import { ENV } from './env';

/**
 * Auto-Subdomain Host Resolver.
 * Inspects window.location.hostname to resolve standalone app modes.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const getActiveSubdomainApp = () => {
  if (typeof window === 'undefined') return ENV.APP_MODE;
  
  const hostname = window.location.hostname;

  if (hostname.startsWith('finance.')) return 'FINANCE';
  if (hostname.startsWith('routine.')) return 'ROUTINE';
  if (hostname.startsWith('journal.')) return 'JOURNAL';
  if (hostname.startsWith('goals.'))   return 'PRODUCTIVITY';

  return ENV.APP_MODE; // Fallback to ALL
};
