import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ENV } from '../../config/env';
import { client } from '../../api/client';

/**
 * 6-Digit Telegram / WhatsApp Account Linking PIN Modal.
 */
export const ChatPairingModal = ({ isOpen, onClose }) => {
  const [pin, setPin] = useState('------');
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(ENV.PAIRING_CODE_TTL_SECONDS);

  useEffect(() => {
    if (!isOpen) return;

    const fetchLinkCode = async () => {
      try {
        const response = await client.post('/api/v1/auth/telegram/link-code');
        const rawCode = String(response.data.code);
        
        // Format raw "892415" code to user friendly "892 - 415"
        const formatted = rawCode.length === 6
          ? `${rawCode.substring(0, 3)} - ${rawCode.substring(3)}`
          : rawCode;
        
        setPin(formatted);
        setSecondsLeft(ENV.PAIRING_CODE_TTL_SECONDS);
        setError('');
      } catch (err) {
        console.error("Failed to generate link pin:", err);
        setError("Session expired or authentication failed. Please re-login.");
      }
    };

    fetchLinkCode();

    const timer = setInterval(() => {
      setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
  };

  const pinStyle = {
    fontFamily: 'var(--font-mono)',
    fontSize: '2.25rem',
    fontWeight: '800',
    letterSpacing: '0.25em',
    color: 'var(--accent-indigo)',
    background: 'rgba(99, 102, 241, 0.08)',
    border: '1px dashed var(--accent-indigo)',
    borderRadius: 'var(--radius-md)',
    padding: '1rem',
    margin: '1.5rem 0',
    textAlign: 'center'
  };

  const rawCode = pin.replace(/\s/g, '').replace(/-/g, '');
  const telegramUrl = `https://t.me/${ENV.TELEGRAM_BOT_USERNAME}?start=${rawCode}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📱 Link Telegram / WhatsApp">
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        Send this 6-digit PIN code to our Telegram (<b>@{ENV.TELEGRAM_BOT_USERNAME}</b>) or WhatsApp (<b>{ENV.WHATSAPP_BOT_NUMBER}</b>) bot to link your account!
      </p>

      {error ? (
        <div style={{ color: 'var(--accent-red)', margin: '1.5rem 0', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
          ⚠️ {error}
        </div>
      ) : (
        <div style={pinStyle}>{pin}</div>
      )}

      {pin !== '------' && !error && (
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              textDecoration: 'none',
              background: 'var(--accent-indigo)',
              color: 'white',
              fontWeight: 'bold',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)',
              transition: 'opacity 0.2s'
            }}
          >
            ✈️ Connect on Telegram
          </a>
        </div>
      )}

      <p style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', marginBottom: '1.5rem', textAlign: 'center' }}>
        ⏱️ Code expires in {formatTime(secondsLeft)}
      </p>

      <Button variant="secondary" onClick={onClose} style={{ width: '100%' }}>Close Window</Button>
    </Modal>
  );
};
