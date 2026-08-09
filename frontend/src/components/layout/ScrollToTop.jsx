import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 📜 Scroll Restoration Helper
 * 
 * Automatically resets page scroll location to (0,0) on every routing event.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
