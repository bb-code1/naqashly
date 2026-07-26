import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { encryptAES256, decryptAES256 } from '../../utils/cryptoUtils';

/**
 * 📝 Executive Mind OS & Hybrid Private AES-256 Encryption Vault
 * 
 * Features:
 * 1. 🔒 1-Tap Private Vault Toggle (AES-256-GCM Zero-Knowledge Encryption)
 * 2. 🔑 Unlocks in-memory with Vault Passphrase
 * 3. 🖍️ Text Background Highlighter (Yellow, Green, Pink, Cyan)
 * 4. 📋 Interactive Task Checklists
 * 5. 📊 Real-Time Word Count & Reading Time Tracker
 * 6. 📤 1-Tap Export to .md & Copy to Clipboard
 * 7. 🎙️ Real-time Web Speech Voice-to-Text Dictation
 * 
 * @author Barkat Bashir
 * @version 7.0.0
 */
export const JournalModule = () => {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMetaDrawer, setShowMetaDrawer] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDriveModal, setShowDriveModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('WORK');
  const [selectedMood, setSelectedMood] = useState('INSPIRED');
  const [locationTag, setLocationTag] = useState('London, UK');
  const [weatherTag, setWeatherTag] = useState('☀️ 24°C Clear');
  const [tagsInput, setTagsInput] = useState('architecture, reflection');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPrivateVault, setIsPrivateVault] = useState(false);
  const [vaultPassphrase, setVaultPassphrase] = useState('');
  const [selectedColor, setSelectedColor] = useState('#10B981');

  // Decrypted Memory Map { noteId: decryptedHTMLText }
  const [decryptedCache, setDecryptedCache] = useState({});
  const [cardPassphraseInputs, setCardPassphraseInputs] = useState({});

  // Stats State
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readTime, setReadTime] = useState(1);

  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  const editorRef = useRef(null);

  const MOOD_OPTIONS = [
    { id: 'INSPIRED', label: 'Inspired', emoji: '🌟' },
    { id: 'PEACEFUL', label: 'Peaceful', emoji: '😌' },
    { id: 'NEUTRAL', label: 'Neutral', emoji: '😐' },
    { id: 'EXHAUSTED', label: 'Exhausted', emoji: '😓' },
    { id: 'ENERGETIC', label: 'Energetic', emoji: '🔥' }
  ];

  const fetchNotes = () => {
    if (!isAuthenticated) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    client.get('/journal/notes')
      .then(res => {
        if (res.data && Array.isArray(res.data)) {
          setNotes(res.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.warn('[JournalModule] Backend unavailable (503/Offline), loading fallback notes:', err);
        setNotes([
          {
            id: 1,
            title: '⚡ System Architecture Sprint Retrospective',
            content: '<b>Design decoupled REST API layer</b> & PostgreSQL schemas for Naqashly Life OS.<br/><mark style="background-color: #FEF08A; color: #000;">Key Takeaway: S3/R2 presigned URLs eliminate Gateway memory overhead!</mark>',
            category: 'ARCHITECTURE',
            mood: 'INSPIRED',
            locationTag: 'London, UK',
            weatherTag: '☀️ 24°C Clear',
            tags: 'architecture, microservices',
            isPinned: true,
            isFavorite: true,
            isEncrypted: false
          },
          {
            id: 2,
            title: '🔒 Executive Financial & Vision Vault',
            content: '4b3f8190c12a:99a812ef10928374a8192301293012',
            category: 'PERSONAL',
            mood: 'PEACEFUL',
            locationTag: 'London, UK',
            weatherTag: '🌤️ 22°C Partly Cloudy',
            tags: 'encrypted, private-vault',
            isPinned: true,
            isFavorite: true,
            isEncrypted: true
          }
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotes();
    } else {
      setNotes([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Active Format State Tracking
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertUnorderedList: false,
    insertOrderedList: false
  });

  const updateActiveFormats = () => {
    try {
      setActiveFormats({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        strikeThrough: document.queryCommandState('strikeThrough'),
        insertUnorderedList: document.queryCommandState('insertUnorderedList'),
        insertOrderedList: document.queryCommandState('insertOrderedList')
      });
    } catch (e) {}

    // Calculate word & char stats
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const chars = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      const mins = Math.max(1, Math.ceil(words / 200));
      setCharCount(chars);
      setWordCount(words);
      setReadTime(mins);
    }
  };

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    updateActiveFormats();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleHighlight = (colorHex) => {
    document.execCommand('hiliteColor', false, colorHex);
    updateActiveFormats();
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  const handleInsertChecklist = () => {
    const checklistHtml = '<div><input type="checkbox" style="margin-right: 6px; cursor: pointer;" /> <span>New Task Item...</span></div>';
    document.execCommand('insertHTML', false, checklistHtml);
    updateActiveFormats();
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    document.execCommand('foreColor', false, color);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  };

  // 🎙️ Web Speech API Real-Time Voice-to-Text Dictation
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (editorRef.current && transcript.trim()) {
        document.execCommand('insertText', false, ' ' + transcript.trim());
        updateActiveFormats();
      }
    };

    recognition.onerror = (err) => {
      console.warn('[SpeechRecognition] Error:', err);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  // 🔑 Unlock Encrypted Note Card
  const handleUnlockNote = async (id, encryptedContent) => {
    const pass = cardPassphraseInputs[id];
    if (!pass) {
      alert('Please enter your Vault Passphrase to decrypt.');
      return;
    }

    const decryptedText = await decryptAES256(encryptedContent, pass);
    if (decryptedText === null) {
      alert('❌ Incorrect Vault Passphrase or corrupted ciphertext.');
    } else {
      setDecryptedCache(prev => ({ ...prev, [id]: decryptedText }));
    }
  };

  // 📤 1-Tap Export & Copy Actions
  const handleCopyNoteText = (n) => {
    const contentToCopy = n.isEncrypted ? (decryptedCache[n.id] || n.content) : n.content;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentToCopy || '';
    const plainText = `${n.title}\n\n${tempDiv.innerText || tempDiv.textContent}`;
    navigator.clipboard.writeText(plainText);
    alert('📋 Note copied to clipboard!');
  };

  const handleDownloadMarkdown = (n) => {
    const contentToExport = n.isEncrypted ? (decryptedCache[n.id] || n.content) : n.content;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentToExport || '';
    const mdContent = `# ${n.title}\n\nCategory: #${n.category || 'WORK'}\nDate: ${new Date().toLocaleDateString()}\n\n${tempDiv.innerText || tempDiv.textContent}`;
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${n.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let htmlContent = editorRef.current ? editorRef.current.innerHTML : '';

    if (isPrivateVault) {
      if (!vaultPassphrase.trim()) {
        alert('Please specify a Vault Passphrase to encrypt your Private Entry.');
        return;
      }
      // Encrypt with AES-256-GCM
      htmlContent = await encryptAES256(htmlContent, vaultPassphrase.trim());
    }

    const newNoteObj = {
      title: title.trim(),
      content: htmlContent,
      category,
      mood: selectedMood,
      locationTag,
      weatherTag,
      tags: tagsInput,
      isPinned,
      isFavorite,
      isEncrypted: isPrivateVault
    };

    client.post('/journal/notes', newNoteObj).then(res => {
      const createdNote = res.data || { id: Date.now(), ...newNoteObj };
      setNotes(prev => [createdNote, ...prev]);
      setTitle('');
      setVaultPassphrase('');
      setIsPrivateVault(false);
      if (editorRef.current) editorRef.current.innerHTML = '';
      setShowAddForm(false);
    }).catch(err => {
      console.warn('[JournalModule] Fallback local note save:', err);
      const createdNote = { id: Date.now(), ...newNoteObj };
      setNotes(prev => [createdNote, ...prev]);
      setTitle('');
      setVaultPassphrase('');
      setIsPrivateVault(false);
      if (editorRef.current) editorRef.current.innerHTML = '';
      setShowAddForm(false);
    });
  };

  const handleDeleteNote = (id) => {
    client.delete(`/journal/notes/${id}`)
      .then(() => {
        setNotes(prev => prev.filter(n => n.id !== id));
      })
      .catch(err => {
        console.warn('[JournalModule] Fallback local delete:', err);
        setNotes(prev => prev.filter(n => n.id !== id));
      });
  };

  const filteredNotes = notes.filter(n => {
    const matchesCategory = activeCategoryFilter === 'ALL' || n.category === activeCategoryFilter;
    const matchesSearch = !searchQuery || n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || n.content?.toLowerCase().includes(searchQuery.toLowerCase()) || n.tags?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Card className="col-12" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
      <style>{`
        .journal-editor-canvas ul, .journal-editor-canvas ol {
          padding-left: 1.75rem !important;
          margin: 0.5rem 0 !important;
        }
        .journal-editor-canvas li {
          margin-bottom: 0.25rem !important;
        }
        .journal-editor-canvas h2 {
          font-size: 1.25rem;
          font-weight: 800;
          margin: 0.5rem 0;
        }
        .journal-editor-canvas pre {
          background: rgba(0,0,0,0.2);
          padding: 0.5rem;
          border-radius: 6px;
          font-family: monospace;
        }
      `}</style>

      {/* STREAMLINED HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            📝 Knowledge & Executive Mind OS
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Zen WYSIWYG editor with AES-256 Private Vault Encryption & Voice Dictation.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="cyan">journal-service :8083</Badge>
          <Button variant="emerald" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Close' : '+ New Note'}
          </Button>
        </div>
      </div>

      {/* SEARCH & CATEGORY FILTER CHIPS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.65rem 1rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['ALL', 'WORK', 'IDEAS', 'PERSONAL', 'ARCHITECTURE'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategoryFilter(cat)}
              style={{
                background: activeCategoryFilter === cat ? '#EC4899' : 'var(--bg-surface)',
                color: activeCategoryFilter === cat ? '#fff' : 'var(--text-heading)',
                border: `1px solid ${activeCategoryFilter === cat ? '#EC4899' : 'var(--border-subtle)'}`,
                borderRadius: '8px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {cat === 'ALL' ? '🌐 All Notes' : `#${cat}`}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="🔍 Search notes..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: '700', outline: 'none', minWidth: '200px' }}
        />
      </div>

      {/* ZEN EXECUTIVE EDITOR FORM */}
      {showAddForm && (
        <form onSubmit={handleAddNote} style={{ background: 'var(--bg-surface-elevated)', padding: '1.35rem', borderRadius: '18px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', border: '1px solid var(--border-subtle)', boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
          
          {/* TITLE & PRIVATE VAULT TOGGLE ROW */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Note Title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ flex: 1, padding: '0.65rem 0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '10px', fontSize: '1rem', fontWeight: '800', outline: 'none' }}
              required
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '10px', padding: '0.65rem 0.85rem', fontSize: '0.82rem', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
            >
              <option value="WORK">🏢 WORK</option>
              <option value="IDEAS">💡 IDEAS</option>
              <option value="PERSONAL">🧘 PERSONAL</option>
              <option value="ARCHITECTURE">⚙️ ARCHITECTURE</option>
            </select>

            {/* 🔒 PRIVATE AES-256 VAULT TOGGLE */}
            <button
              type="button"
              onClick={() => setIsPrivateVault(!isPrivateVault)}
              style={{
                background: isPrivateVault ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-surface)',
                color: isPrivateVault ? '#EF4444' : 'var(--text-muted)',
                border: `1px solid ${isPrivateVault ? '#EF4444' : 'var(--border-subtle)'}`,
                borderRadius: '10px',
                padding: '0.6rem 0.85rem',
                fontSize: '0.8rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {isPrivateVault ? '🔒 Private AES-256 Vault ON' : '🔓 Public Note'}
            </button>
          </div>

          {/* VAULT PASSPHRASE INPUT IF VAULT IS ON */}
          {isPrivateVault && (
            <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: '800', color: '#EF4444' }}>🔑 Encryption Passphrase:</span>
              <input
                type="password"
                placeholder="Enter passphrase to encrypt note content (AES-256-GCM)..."
                value={vaultPassphrase}
                onChange={e => setVaultPassphrase(e.target.value)}
                style={{ flex: 1, padding: '0.4rem 0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', fontSize: '0.82rem', outline: 'none' }}
                required
              />
            </div>
          )}

          {/* RICH TOOLBAR WITH HIGHLIGHTER, CHECKLIST & VOICE DICTATION */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderBottom: 'none', padding: '0.45rem 0.75rem', borderRadius: '10px 10px 0 0', flexWrap: 'wrap', gap: '0.5rem' }}>
            
            {/* FORMATTING & HIGHLIGHTER CONTROLS */}
            <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleFormat('bold')}
                style={{
                  background: activeFormats.bold ? '#10B981' : 'var(--bg-surface-elevated)',
                  color: activeFormats.bold ? '#fff' : 'var(--text-heading)',
                  border: `1px solid ${activeFormats.bold ? '#10B981' : 'var(--border-subtle)'}`,
                  borderRadius: '6px',
                  padding: '0.25rem 0.55rem',
                  fontWeight: '900',
                  cursor: 'pointer'
                }}
                title="Bold (Ctrl+B)"
              >
                <b>B</b>
              </button>

              <button
                type="button"
                onClick={() => handleFormat('italic')}
                style={{
                  background: activeFormats.italic ? '#10B981' : 'var(--bg-surface-elevated)',
                  color: activeFormats.italic ? '#fff' : 'var(--text-heading)',
                  border: `1px solid ${activeFormats.italic ? '#10B981' : 'var(--border-subtle)'}`,
                  borderRadius: '6px',
                  padding: '0.25rem 0.55rem',
                  fontStyle: 'italic',
                  cursor: 'pointer'
                }}
                title="Italic (Ctrl+I)"
              >
                <i>I</i>
              </button>

              <button
                type="button"
                onClick={() => handleFormat('underline')}
                style={{
                  background: activeFormats.underline ? '#10B981' : 'var(--bg-surface-elevated)',
                  color: activeFormats.underline ? '#fff' : 'var(--text-heading)',
                  border: `1px solid ${activeFormats.underline ? '#10B981' : 'var(--border-subtle)'}`,
                  borderRadius: '6px',
                  padding: '0.25rem 0.55rem',
                  textDecoration: 'underline',
                  cursor: 'pointer'
                }}
                title="Underline (Ctrl+U)"
              >
                <u>U</u>
              </button>

              <span style={{ height: '16px', borderRight: '1px solid var(--border-subtle)', margin: '0 0.2rem' }} />

              {/* FONT SIZE SELECTOR */}
              <select
                onChange={(e) => handleFormat('fontSize', e.target.value)}
                defaultValue="3"
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-heading)',
                  borderRadius: '6px',
                  padding: '0.2rem 0.45rem',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  outline: 'none',
                  cursor: 'pointer'
                }}
                title="Font Size"
              >
                <option value="1">Aa Small (12px)</option>
                <option value="3">Aa Normal (15px)</option>
                <option value="4">Aa Large (18px)</option>
                <option value="6">Aa Huge (24px)</option>
              </select>

              {/* 🖍️ TEXT HIGHLIGHTER PILLS */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.2rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>🖍️</span>
                {['#FEF08A', '#BBF7D0', '#FBCFE8', '#BAE6FD'].map(hColor => (
                  <button
                    key={hColor}
                    type="button"
                    onClick={() => handleHighlight(hColor)}
                    style={{ width: '16px', height: '16px', borderRadius: '4px', background: hColor, border: '1px solid rgba(0,0,0,0.2)', cursor: 'pointer' }}
                    title="Highlight Text"
                  />
                ))}
              </div>

              <span style={{ height: '16px', borderRight: '1px solid var(--border-subtle)', margin: '0 0.2rem' }} />

              {/* 📋 CHECKLIST BUTTON */}
              <button
                type="button"
                onClick={handleInsertChecklist}
                style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', padding: '0.25rem 0.55rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
                title="Insert Checklist Item"
              >
                ☑️ Checklist
              </button>

              <button
                type="button"
                onClick={() => handleFormat('insertUnorderedList')}
                style={{
                  background: activeFormats.insertUnorderedList ? '#10B981' : 'var(--bg-surface-elevated)',
                  color: activeFormats.insertUnorderedList ? '#fff' : 'var(--text-heading)',
                  border: `1px solid ${activeFormats.insertUnorderedList ? '#10B981' : 'var(--border-subtle)'}`,
                  borderRadius: '6px',
                  padding: '0.25rem 0.55rem',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
                title="Bullet List"
              >
                • List
              </button>

              <button type="button" onClick={() => handleFormat('formatBlock', 'PRE')} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#10B981', borderRadius: '6px', padding: '0.25rem 0.55rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }} title="Code Block">&lt;/&gt;</button>
            </div>

            {/* 🎙️ REAL-TIME VOICE-TO-TEXT DICTATION & MEDIA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                style={{
                  background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                  color: isListening ? '#EF4444' : '#10B981',
                  border: `1px solid ${isListening ? '#EF4444' : '#10B981'}`,
                  borderRadius: '6px',
                  padding: '0.2rem 0.55rem',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
                title="Dictate Note via Speech-to-Text"
              >
                {isListening ? '🔴 Dictating...' : '🎙️ Dictate'}
              </button>

              <button
                type="button"
                onClick={() => setShowMetaDrawer(!showMetaDrawer)}
                style={{ background: showMetaDrawer ? 'rgba(236, 72, 153, 0.15)' : 'transparent', color: showMetaDrawer ? '#EC4899' : 'var(--text-muted)', border: `1px solid ${showMetaDrawer ? '#EC4899' : 'var(--border-subtle)'}`, borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
              >
                ⚙️ Metadata {showMetaDrawer ? '▲' : '▾'}
              </button>

              <button
                type="button"
                onClick={() => setShowDriveModal(true)}
                style={{ background: 'rgba(99, 102, 241, 0.12)', color: '#6366F1', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
              >
                🔒 Media
              </button>
            </div>
          </div>

          {/* EDITABLE CANVAS */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onKeyUp={updateActiveFormats}
            onMouseUp={updateActiveFormats}
            onClick={updateActiveFormats}
            className="journal-editor-canvas"
            placeholder="Type your note content here..."
            style={{
              minHeight: '160px',
              padding: '1rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0 0 10px 10px',
              color: 'var(--text-heading)',
              fontSize: '0.92rem',
              outline: 'none',
              overflowY: 'auto',
              lineHeight: 1.5
            }}
          />

          {/* 📊 REAL-TIME WORD & CHARACTER COUNT STATS BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', padding: '0 0.2rem' }}>
            <div>
              <span>📊 {wordCount} words</span> • <span>{charCount} characters</span> • <span>⏱️ {readTime} min read</span>
            </div>
            {isListening && <span style={{ color: '#EF4444', fontWeight: '800' }}>🎙️ Listening... Speak naturally</span>}
          </div>

          {/* COLLAPSIBLE METADATA DRAWER */}
          {showMetaDrawer && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>Mood:</span>
                {MOOD_OPTIONS.map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMood(m.id)}
                    style={{ background: selectedMood === m.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent', border: `1px solid ${selectedMood === m.id ? '#10B981' : 'transparent'}`, borderRadius: '6px', padding: '0.15rem 0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Location Tag"
                  value={locationTag}
                  onChange={e => setLocationTag(e.target.value)}
                  style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: '700', flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Weather Tag"
                  value={weatherTag}
                  onChange={e => setWeatherTag(e.target.value)}
                  style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: '700', flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={tagsInput}
                  onChange={e => setTagsInput(e.target.value)}
                  style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: '700', flex: 2 }}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
            <Button type="button" variant="subtle" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button type="submit" variant="emerald">💾 Save Note</Button>
          </div>
        </form>
      )}

      {/* GOOGLE DRIVE GATED STORAGE MODAL */}
      {showDriveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '1.75rem', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>🔒 📁</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
              Connect Google Drive Vault
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
              Photo attachments and voice memos require connecting your Google Drive account.
              Files are stored <strong>100% privately in your hidden Google Drive appDataFolder</strong> with zero server storage costs!
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.5rem' }}>
              <Button variant="emerald" onClick={() => alert('Redirecting to Google OAuth2 consent for drive.appdata scope...')}>
                🔗 Connect Google Drive Now
              </Button>
              <Button variant="subtle" onClick={() => setShowDriveModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAN NOTES GRID WITH AES-256 VAULT UNLOCK & EXPORT */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>Loading notes...</div>
      ) : filteredNotes.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2.5rem', background: 'var(--bg-surface-elevated)', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
          No notes match the current filter. Click <strong>"+ New Note"</strong> above to write your first note!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.1rem' }}>
          {filteredNotes.map(n => {
            const moodObj = MOOD_OPTIONS.find(m => m.id === n.mood) || MOOD_OPTIONS[0];
            const isDecrypted = decryptedCache[n.id] !== undefined;
            const contentToDisplay = n.isEncrypted ? (isDecrypted ? decryptedCache[n.id] : null) : n.content;

            return (
              <div key={n.id} style={{ background: n.isEncrypted ? 'rgba(239, 68, 68, 0.04)' : 'var(--bg-surface-elevated)', border: `1px solid ${n.isEncrypted ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`, borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                        #{n.category || 'WORK'}
                      </span>
                      {n.isEncrypted && (
                        <span style={{ fontSize: '0.72rem', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '900' }}>
                          🔒 AES-256 Vault
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem' }}>{moodObj.emoji}</span>
                      
                      <button
                        type="button"
                        onClick={() => handleCopyNoteText(n)}
                        title="Copy Text to Clipboard"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        📋
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadMarkdown(n)}
                        title="Export as .md Markdown File"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        📥
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteNote(n.id)}
                        title="Delete entry"
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-heading)', margin: '0 0 0.35rem 0' }}>{n.title}</h4>
                  
                  {/* ENCRYPTED vs DECRYPTED CONTENT RENDERING */}
                  {n.isEncrypted && !isDecrypted ? (
                    <div style={{ background: 'var(--bg-surface)', border: '1px dashed rgba(239, 68, 68, 0.3)', borderRadius: '10px', padding: '1rem', textAlign: 'center', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <div style={{ fontSize: '0.78rem', color: '#EF4444', fontWeight: '800' }}>🔒 Content Encrypted (Zero-Knowledge AES-256)</div>
                      <input
                        type="password"
                        placeholder="Enter Vault Passphrase..."
                        value={cardPassphraseInputs[n.id] || ''}
                        onChange={e => setCardPassphraseInputs({ ...cardPassphraseInputs, [n.id]: e.target.value })}
                        style={{ padding: '0.35rem 0.65rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', fontSize: '0.78rem', outline: 'none' }}
                      />
                      <Button variant="emerald" onClick={() => handleUnlockNote(n.id, n.content)}>
                        🔑 Decrypt Note
                      </Button>
                    </div>
                  ) : (
                    <div
                      style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}
                      dangerouslySetInnerHTML={{ __html: contentToDisplay }}
                    />
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>📍 {n.locationTag || 'London, UK'}</span>
                  <span style={{ fontSize: '0.72rem', color: n.isEncrypted ? '#EF4444' : '#10B981', fontWeight: '800' }}>
                    {n.isEncrypted ? '🔒 Zero-Knowledge Vault' : 'PostgreSQL Synced'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
};
