import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LandingTelegramBot = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: '👋 Welcome to Naqashly Life OS!\nI am your Telegram assistant. You can log tasks, habits, expenses, or check your ledger directly from here. Try clicking one of the options below to see how I process your commands in real time!' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const chatAreaRef = useRef(null);

  const testChips = [
    { label: '💵 spent ₹120 food', text: 'spent ₹120 food' },
    { label: '🤝 Alex owes me ₹500', text: 'Alex owes me ₹500' },
    { label: '💰 who owes me money', text: 'who owes me money' },
    { label: '📋 what tasks are left today?', text: 'what tasks are left today?' },
    { label: '🧘 done habit meditation', text: 'done habit meditation' }
  ];

  const getSimulatedResponse = (input) => {
    const clean = input.toLowerCase().trim();
    if (clean.includes('spent') && clean.includes('food')) {
      return '⚡ **Transaction Logged!** Spent ₹120.00 on Food.\nCategory: Food\nWallet: Personal Cash (INR)';
    }
    if (clean.includes('alex owes me')) {
      return '⚡ **Debt Ledger Updated!**\nRecorded that **Alex** owes you **₹500.00**.';
    }
    if (clean.includes('who owes') || clean.includes('money') || clean.includes('debt')) {
      return '🤝 **Your Interpersonal Debt Summary:**\n\n• **Alex** owes you: **₹500.00**\n• **Sam** owes you: **₹100.00**\n• You owe **Imran**: **₹200.00**\n\n💰 **Totals:**\n• Total owed to you: **₹600.00**\n• Total you owe others: **₹200.00**';
    }
    if (clean.includes('task') || clean.includes('todo')) {
      return '📋 **Your TODO Tasks:**\n\n• **[ID: 104]** Deploy Backend Server (Priority: HIGH)\n• **[ID: 108]** Code review PRs (Priority: MEDIUM)';
    }
    if (clean.includes('habit') || clean.includes('meditation')) {
      return '⚡ **Habit Logged!** Completed habit **"Morning Meditation"** successfully.\n🔥 Streak count: **5 days**';
    }
    return '🔍 I couldn\'t quite understand or process that request. For more complex actions, please log on to the application dashboard! 🚀';
  };

  const handleSendMessage = (textToSend) => {
    if (!textToSend.trim() || isTyping) return;

    // Add user message
    const newMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      setIsTyping(false);
      const botReply = {
        id: Date.now() + 1,
        sender: 'bot',
        text: getSimulatedResponse(textToSend)
      };
      setMessages(prev => [...prev, botReply]);
    }, 1200);
  };

  // Scroll to bottom of chat area container internally when messages change, avoiding page jumping
  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({
        top: chatAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isTyping]);

  const formatText = (text) => {
    return text.split('\n').map((line, idx) => {
      let formatted = line;
      // Bold formatter
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Code snippet formatter
      formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
      return (
        <span key={idx} style={{ display: 'block', minHeight: line === '' ? '0.75rem' : 'auto' }} dangerouslySetInnerHTML={{ __html: formatted }} />
      );
    });
  };

  return (
    <section className="telegram-sim-section">
      <div className="telegram-sim-container">
        
        {/* TEXT / EXPLANATION SECTION */}
        <div className="sim-text-content">
          <div style={{ display: 'inline-block', padding: '0.35rem 0.85rem', background: 'rgba(34, 158, 217, 0.1)', border: '1px solid rgba(34, 158, 217, 0.3)', borderRadius: '20px', color: '#229ED9', fontSize: '0.82rem', fontWeight: '800', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            📲 Ask Naqash Assistant
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-heading)', lineHeight: '1.2', letterSpacing: '-0.02em', margin: '0 0 1rem 0' }}>
            Control Your Whole Life OS Directly from Telegram
          </h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', lineHeight: '1.6', margin: '0 0 2rem 0' }}>
            No app downloads or dashboards required. Send a simple message to log expenses, check debtor lists, complete habits, or get your daily schedules. Powered by Google Gemini and optimized fallbacks.
          </p>

          {/* QUICK INTERACTIVE CHIPS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Tap a chip to try:
            </span>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {testChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.text)}
                  disabled={isTyping}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '30px',
                    padding: '0.5rem 1rem',
                    color: 'var(--text-heading)',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    cursor: isTyping ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                  className="sim-chip-btn"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* PHONE MOCKUP / TELEGRAM INTERACTIVE SIMULATOR */}
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <div className="phone-frame">
            
            {/* PHONE TOP NOTCH/BAR */}
            <div style={{ height: '24px', background: '#17212b', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <div style={{ width: '60px', height: '4px', background: '#2b3b4d', borderRadius: '2px' }} />
            </div>

            {/* TELEGRAM APP HEADER */}
            <div style={{ padding: '0.75rem 1rem', background: '#17212b', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid #101921' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#229ED9', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: '800', color: '#fff', fontSize: '1.1rem' }}>
                🤖
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '800', color: '#fff', fontSize: '0.92rem' }}>Naqashly Bot</div>
                <div style={{ fontSize: '0.75rem', color: isTyping ? '#229ED9' : '#808f9d', fontWeight: '600' }}>
                  {isTyping ? 'typing...' : 'bot'}
                </div>
              </div>
            </div>

            {/* CHAT BUBBLES CONTAINER */}
            <div 
              ref={chatAreaRef}
              style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', background: '#0e1621' }} 
              className="sim-chat-area"
            >
              {messages.map(m => (
                <div
                  key={m.id}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: m.sender === 'user' ? '#2b5278' : '#182533',
                    border: '1px solid',
                    borderColor: m.sender === 'user' ? '#2f5b84' : '#202f3d',
                    borderRadius: m.sender === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    padding: '0.65rem 0.85rem',
                    color: '#fff',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                  }}
                >
                  {formatText(m.text)}
                </div>
              ))}

              {/* TYPING BUBBLE */}
              {isTyping && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    background: '#182533',
                    borderRadius: '12px 12px 12px 0',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <span className="typing-dot" style={{ width: '6px', height: '6px', background: '#229ED9', borderRadius: '50%', display: 'inline-block' }} />
                  <span className="typing-dot" style={{ width: '6px', height: '6px', background: '#229ED9', borderRadius: '50%', display: 'inline-block', animationDelay: '0.2s' }} />
                  <span className="typing-dot" style={{ width: '6px', height: '6px', background: '#229ED9', borderRadius: '50%', display: 'inline-block', animationDelay: '0.4s' }} />
                </div>
              )}
            </div>

            {/* MESSAGE INPUT BOX BAR */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputText);
              }}
              style={{ padding: '0.75rem', background: '#17212b', display: 'flex', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid #101921' }}
            >
              <input
                type="text"
                placeholder={isTyping ? 'Please wait...' : 'Type a command...'}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
                style={{
                  flex: 1,
                  background: '#24303f',
                  border: '1px solid #2f3e50',
                  borderRadius: '20px',
                  padding: '0.45rem 1rem',
                  color: '#fff',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={isTyping || !inputText.trim()}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#229ED9',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: isTyping || !inputText.trim() ? 'not-allowed' : 'pointer',
                  opacity: isTyping || !inputText.trim() ? 0.6 : 1
                }}
              >
                ➔
              </button>
            </form>
          </div>
        </div>

      </div>
    </section>
  );
};
