import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass } from 'lucide-react';

/**
 * 🎨 Premium 404 Not Found Page
 * 
 * Includes high-fidelity dark glassmorphic styling, neon glows, and micro-animations.
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #1e1b4b 0%, #09090b 100%)',
      padding: '24px',
      color: '#f4f4f5',
      fontFamily: 'Inter, sans-serif'
    }}>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          background: 'rgba(24, 24, 27, 0.65)',
          backdropFilter: 'blur(16px)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '48px 32px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            marginBottom: '24px',
            boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Compass size={40} color="#ffffff" />
        </motion.div>

        <h1 style={{
          fontSize: '96px',
          fontWeight: 900,
          margin: 0,
          background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1'
        }}>
          404
        </h1>

        <h2 style={{ fontSize: '20px', fontWeight: 600, marginTop: '16px', marginBottom: '8px' }}>
          Path Uncharted
        </h2>
        
        <p style={{ color: '#a1a1aa', fontSize: '14px', lineHeight: '1.6', marginBottom: '32px' }}>
          The section of the database you are seeking does not exist or has been relocated in the digital ether.
        </p>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            padding: '14px 20px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
            transition: 'box-shadow 0.2s'
          }}
        >
          <Home size={18} />
          Return to Dashboard
        </motion.button>
      </motion.div>
    </div>
  );
}
