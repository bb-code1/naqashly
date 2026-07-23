import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ENV } from '../../config/env';

/**
 * 6-Digit Telegram / WhatsApp Account Linking PIN Modal.
 */
export const ChatPairingModal = ({ isOpen, onClose }) => {
  const [pin, setPin] = useState('892-415');
  const [secondsLeft, setSecondsLeft] = useState(ENV.PAIRING_CODE_TTL_SECONDS);

  useEffect(() => {
    if (!isOpen) return;
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
    margin: '1.5rem 0'
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📱 Link Telegram / WhatsApp">
      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
        Send this 6-digit PIN code to our Telegram (<b>@{ENV.TELEGRAM_BOT_USERNAME}</b>) or WhatsApp (<b>{ENV.WHATSAPP_BOT_NUMBER}</b>) bot to link your account!
      </p>

      <div style={pinStyle}>{pin}</div>

      <p style={{ fontSize: '0.78rem', color: 'var(--accent-amber)', marginBottom: '1.5rem' }}>
        ⏱️ Code expires in {formatTime(secondsLeft)}
      </p>

      <Button variant="secondary" onClick={onClose}>Close Window</Button>
    </Modal>
  );
};
