import React, { useState, useEffect, useRef } from 'react';
import { client } from '../../../api/client';
import './ChatWidget.css';

/**
 * 🤖 "Ask Naqash" Premium Glassmorphic Chat Widget Component
 * 
 * Features:
 * 1. Floating pulsing glow action trigger.
 * 2. Glassmorphic slide-out conversation overlay panel.
 * 3. Guided Conversational Flow state support (via stateless context).
 * 4. Rich render cards (Options Grid, Interactive Task Checklist, Transaction Receipts).
 * 
 * @author Barkat Bashir
 * @version 1.0.0
 */
export const ChatWidget = ({ userName = 'Executive' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [context, setContext] = useState('WELCOME');
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Set up initial greeting menu message
  const [messages, setMessages] = useState([]);

  const welcomeOptions = [
    { label: '💵 Log an Expense', value: 'LOG_EXPENSE' },
    { label: '📋 Manage Tasks', value: 'MANAGE_TASKS' },
    { label: '🧘 Log Completed Habit', value: 'LOG_HABIT' }
  ];

  const messagesEndRef = useRef(null);

  // Automatically scroll messages pane to bottom on additions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Send payload to backend bot API
  const handleSendMessage = async (textToSend, actionValue = null) => {
    const queryText = textToSend.trim();
    if (!queryText && !actionValue) return;

    // 1. Append user bubble locally
    const userMsgId = 'usr_' + Math.random().toString(36).substring(2, 9);
    const userMessage = {
      id: userMsgId,
      sender: 'user',
      type: 'text',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      // 2. Call Gateway routed Bot Chat API
      const apiPayload = {
        message: actionValue || queryText,
        context: context,
        meta: meta
      };

      const response = await client.post('/bot/chat', apiPayload);
      const resData = response.data;

      // 3. Update state machine variables from backend DTO
      setContext(resData.context || 'WELCOME');
      if (resData.data && resData.data.meta) {
        setMeta(resData.data.meta);
      } else {
        setMeta({});
      }

      // 4. Append bot reply bubble
      const botMsgId = 'bot_' + Math.random().toString(36).substring(2, 9);
      const botMessage = {
        id: botMsgId,
        sender: 'bot',
        type: resData.type || 'text',
        text: resData.text,
        data: resData.data,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Error communicating with Ask Naqash backend:', err);
      
      const errMsgId = 'err_' + Math.random().toString(36).substring(2, 9);
      setMessages((prev) => [
        ...prev,
        {
          id: errMsgId,
          sender: 'bot',
          type: 'text',
          text: '⚠️ I encountered an error connecting to my services. Let\'s restart! What can I help with?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setContext('WELCOME');
      setMeta({});
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Handles clicking option grid button chips
  const handleSelectOption = (optionLabel, optionValue) => {
    handleSendMessage(optionLabel, optionValue);
  };

  // Handles completing tasks dynamically inside chat bubble
  const handleToggleTaskComplete = async (taskId, msgId) => {
    try {
      // Direct REST PUT status change
      await client.put(`/productivity/tasks/${taskId}/status`, {
        status: 'COMPLETED'
      });

      // Visually strike out item inside specific messages state
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === msgId && msg.type === 'task_list') {
            const updatedTasks = msg.data.map((task) => {
              if (task.id === taskId) {
                return { ...task, status: 'COMPLETED' };
              }
              return task;
            });
            return { ...msg, data: updatedTasks };
          }
          return msg;
        })
      );
    } catch (err) {
      console.error(`Failed to mark task ${taskId} completed:`, err);
    }
  };

  const handleTelegramLinkClick = async () => {
    try {
      const response = await client.post('/auth/telegram/link-code');
      const code = response.data.code;
      
      const linkMsg = {
        id: 'tg_link_' + Date.now(),
        sender: 'bot',
        type: 'telegram_link',
        text: `✈️ <b>Connect Telegram Bot</b><br/><br/>Your activation code is: <b>${code}</b><br/><br/>Click the button below to link your account.`,
        data: {
          code: code,
          botUrl: `https://t.me/Naqashly_bot?start=${code}`
        },
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages((prev) => [...prev, linkMsg]);
    } catch (err) {
      console.error("Failed to generate Telegram link code:", err);
      
      const errMsg = {
        id: 'tg_err_' + Date.now(),
        sender: 'bot',
        type: 'text',
        text: `⚠️ Failed to generate a Telegram linking code. Please check your network connection and try again.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  // Render options grid chips
  const renderOptionsCard = (msg) => {
    if (!msg.data || !Array.isArray(msg.data.options)) return null;
    return (
      <div className="options-grid">
        {msg.data.options.map((opt, idx) => (
          <button
            key={`opt_${idx}`}
            className="option-chip"
            onClick={() => handleSelectOption(opt.label, opt.value)}
          >
            ✦ {opt.label}
          </button>
        ))}
      </div>
    );
  };

  // Render quick numeric amount selection chips
  const renderChipsRow = (msg) => {
    if (!msg.data || !Array.isArray(msg.data.chips)) return null;
    return (
      <div className="chips-row">
        {msg.data.chips.map((chip, idx) => (
          <button
            key={`chip_${idx}`}
            className="quick-chip"
            onClick={() => handleSendMessage(`$${chip}`, chip)}
          >
            ${chip}
          </button>
        ))}
      </div>
    );
  };

  // Render interactive task checklist
  const renderTaskListCard = (msg) => {
    if (!msg.data || !Array.isArray(msg.data)) return null;
    return (
      <div className="chat-card">
        {msg.data.map((task) => {
          const isCompleted = task.status === 'COMPLETED';
          return (
            <div
              key={task.id}
              className={`task-card-item ${isCompleted ? 'completed' : ''}`}
            >
              <div className="task-card-content">
                <input
                  type="checkbox"
                  className="task-card-checkbox"
                  checked={isCompleted}
                  disabled={isCompleted}
                  onChange={() => handleToggleTaskComplete(task.id, msg.id)}
                />
                <span className="task-card-title">{task.title}</span>
              </div>
              <span className={`task-card-badge ${task.priority ? task.priority.toLowerCase() : 'medium'}`}>
                {task.priority || 'MEDIUM'}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Render final logged transaction invoice receipt
  const renderReceiptCard = (msg) => {
    if (!msg.data || !msg.data.transaction) return null;
    const tx = msg.data.transaction;
    const amountVal = parseFloat(tx.amount || 0).toFixed(2);
    const balanceVal = parseFloat(msg.data.updatedWalletBalance || 0).toFixed(2);

    return (
      <div className="chat-card receipt-card">
        <div className="receipt-header">
          <span className="receipt-logo">🌿 NAQASHLY PAY</span>
          <span className="receipt-date">
            {new Date().toLocaleDateString([], { month: 'short', day: '2-digit' })}
          </span>
        </div>
        <div className="receipt-row">
          <span style={{ color: 'var(--chat-text-muted)' }}>Wallet ID</span>
          <span style={{ color: 'white', fontWeight: 600 }}>#{tx.walletId}</span>
        </div>
        <div className="receipt-row">
          <span style={{ color: 'var(--chat-text-muted)' }}>Category</span>
          <span style={{ color: 'white', fontWeight: 600 }}>{tx.category || 'General'}</span>
        </div>
        <div className="receipt-row">
          <span style={{ color: 'var(--chat-text-muted)' }}>Details</span>
          <span style={{ color: 'white', fontStyle: 'italic' }}>{tx.description || 'N/A'}</span>
        </div>
        <div className="receipt-row">
          <span style={{ color: 'var(--chat-text-muted)' }}>Wallet Balance</span>
          <span style={{ color: 'var(--chat-accent)', fontWeight: 600 }}>${balanceVal}</span>
        </div>
        <div className="receipt-row total">
          <span>Total Expense</span>
          <span>${amountVal}</span>
        </div>
      </div>
    );
  };

  // Render telegram link token activation card
  const renderTelegramLinkCard = (msg) => {
    if (!msg.data || !msg.data.code) return null;
    return (
      <div className="chat-card receipt-card" style={{ borderLeft: '3px solid #38BDF8', padding: '1rem' }}>
        <div style={{ color: 'var(--chat-text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
          Your Activation Link Code:
        </div>
        <div style={{ fontSize: '1.6rem', textAlign: 'center', fontWeight: 'bold', margin: '0.5rem 0', letterSpacing: '2px', color: '#38BDF8' }}>
          {msg.data.code}
        </div>
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <a
            href={msg.data.botUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="option-chip"
            style={{ display: 'inline-block', textDecoration: 'none', background: '#38BDF8', color: 'black', fontWeight: 'bold', padding: '6px 12px' }}
          >
            ✈️ Open Bot on Telegram
          </a>
        </div>
      </div>
    );
  };

  // Message dispatcher depending on bubble data type
  const renderMessageContent = (msg) => {
    return (
      <>
        <div 
          style={{ wordBreak: 'break-word' }} 
          dangerouslySetInnerHTML={{ __html: msg.text }} 
        />
        {msg.type === 'options' && renderOptionsCard(msg)}
        {msg.type === 'options' && renderChipsRow(msg)}
        {msg.type === 'task_list' && renderTaskListCard(msg)}
        {msg.type === 'receipt' && renderReceiptCard(msg)}
        {msg.type === 'telegram_link' && renderTelegramLinkCard(msg)}
      </>
    );
  };

  return (
    <>
      {/* 🔮 TRIGGER FLOATING GLOBE BUTTON */}
      {!isOpen && (
        <button className="chat-trigger" onClick={() => setIsOpen(true)}>
          <span className="chat-trigger-icon">🤖</span>
        </button>
      )}

      {/* 🖥️ COMPANION CHAT PANEL OVERLAY */}
      {isOpen && (
        <div className="chat-pane animate-slide-up">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-identity">
              <div className="chat-header-avatar">🧠</div>
              <div>
                <h3 className="chat-header-title">Ask Naqash</h3>
                <div className="chat-header-status">
                  <span className="status-dot" />
                  <span>Assistant Online</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button className="chat-header-tg-link" onClick={handleTelegramLinkClick} title="Link Telegram Bot">
                ✈️ Bot
              </button>
              <button className="chat-header-close" onClick={() => setIsOpen(false)}>
                ✕
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="chat-messages">
            {/* 🤖 DYNAMIC WELCOME MESSAGE */}
            <div className="chat-bubble-wrapper bot">
              <div className="chat-bubble">
                <div style={{ wordBreak: 'break-word' }}>
                  Hi {userName}! 🌿 I am your Naqashly Life OS companion. What would you like to track today?
                </div>
                <div className="options-grid">
                  {welcomeOptions.map((opt, idx) => (
                    <button
                      key={`welcome_opt_${idx}`}
                      className="option-chip"
                      onClick={() => handleSelectOption(opt.label, opt.value)}
                    >
                      ✦ {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <span className="chat-bubble-time">Online</span>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-wrapper ${msg.sender}`}>
                <div className="chat-bubble">{renderMessageContent(msg)}</div>
                <span className="chat-bubble-time">{msg.time}</span>
              </div>
            ))}

            {/* Pulsing Typing Indicator */}
            {loading && (
              <div className="chat-bubble-wrapper bot">
                <div className="chat-bubble">
                  <div className="typing-indicator">
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                    <span className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input Area */}
          <div className="chat-footer">
            <form onSubmit={handleFormSubmit} className="chat-form">
              <div className="chat-input-wrapper">
                <input
                  type="text"
                  className="chat-input"
                  placeholder={
                    context === 'WELCOME' 
                      ? 'Ask Naqash anything or select options...' 
                      : 'Type your response here...'
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              <button type="submit" className="chat-send-btn">
                ➔
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
