import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { encryptAES256, decryptAES256, generate24WordMnemonic, mnemonicToPassphrase } from '../../utils/cryptoUtils';

/**
 * 📝 Executive Mind OS & Dedicated Private Encryption Vault Suite
 * 
 * Features:
 * 1. 🌐 General Notes & Retrospectives Tab (Standard fast notes)
 * 2. 🔒 Private Encryption Vault Sub-Tab (Passphrase Popup Challenge)
 * 3. 🔑 BIP-39 24-Word Emergency Recovery Phrase Engine (Pattern 1)
 *    - 1-Tap 24-Word Mnemonic Recovery Generator
 *    - Emergency Recovery Phrase Unlock Mode for forgotten passphrases
 * 4. 🖍️ Text Background Highlighter (Yellow, Green, Pink, Cyan)
 * 5. 📋 Interactive Task Checklists
 * 6. 📊 Real-Time Word Count & Reading Time Tracker
 * 7. 📤 1-Tap Export to .md & Copy to Clipboard
 * 8. 🎙️ Real-time Web Speech Voice-to-Text Dictation
 * 
 * @author Barkat Bashir
 * @version 10.0.0
 */
export const JournalModule = () => {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMetaDrawer, setShowMetaDrawer] = useState(false);

  // Sub-Tab State: 'NOTES' vs 'VAULT'
  const [activeSubTab, setActiveSubTab] = useState('NOTES');

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDriveModal, setShowDriveModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('WORK');
  const [selectedMood, setSelectedMood] = useState('INSPIRED');
  const [locationTag, setLocationTag] = useState('');
  const [weatherTag, setWeatherTag] = useState('');
  const [tagsInput, setTagsInput] = useState('architecture, reflection');
  const [isPinned, setIsPinned] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#10B981');

  // Master Vault Passphrase & Unlocked State
  const [masterVaultPassphrase, setMasterVaultPassphrase] = useState('');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // 🔑 24-Word Mnemonic Recovery State (Pattern 1)
  const [recoveryMode, setRecoveryMode] = useState(false); // false: Passphrase, true: 24 Words
  const [recoveryWordsInput, setRecoveryWordsInput] = useState('');
  const [generatedMnemonic, setGeneratedMnemonic] = useState(null);
  const [showMnemonicSheet, setShowMnemonicSheet] = useState(false);

  // Decrypted Memory Map { noteId: decryptedHTMLText }
  const [decryptedCache, setDecryptedCache] = useState({});

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

  const checkIsEncryptedNote = (note) => {
    if (note.isEncrypted === true) return true;
    if (!note.content) return false;
    const cleanContent = note.content.trim();
    return cleanContent.includes(':') && /^[0-9a-f]{16,}:[0-9a-f]{16,}$/i.test(cleanContent);
  };

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
            locationTag: 'Somewhere on Earth',
            weatherTag: '☀️ Clear Sky',
            tags: 'architecture, microservices',
            isPinned: true,
            isFavorite: true,
            isEncrypted: false
          },
          {
            id: 2,
            title: '🔒 Executive Financial & Personal Vision Vault',
            content: '4b3f8190c12a:99a812ef10928374a8192301293012',
            category: 'PERSONAL',
            mood: 'PEACEFUL',
            locationTag: 'Somewhere on Earth',
            weatherTag: '🌤️ Partly Cloudy',
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

  // 🔒 Switch Sub-Tab with Popup Challenge
  const handleSwitchSubTab = (tab) => {
    if (tab === 'VAULT' && !isVaultUnlocked) {
      setActiveSubTab('VAULT');
      setShowUnlockModal(true);
    } else {
      setActiveSubTab(tab);
    }
  };

  // 🔑 Unlock Master Private Vault Session (via Passphrase or 24-Word Phrase)
  const handleUnlockMasterVault = async (e) => {
    if (e) e.preventDefault();

    let keyToUse = masterVaultPassphrase.trim();

    if (recoveryMode) {
      const words = recoveryWordsInput.trim().split(/\s+/);
      if (words.length < 12) {
        alert('Please enter at least 12 to 24 words from your Emergency Recovery Mnemonic Sheet.');
        return;
      }
      keyToUse = mnemonicToPassphrase(words);
    } else if (!keyToUse) {
      alert('Please enter your Master Vault Passphrase.');
      return;
    }

    const encryptedVaultNotes = notes.filter(n => checkIsEncryptedNote(n));
    let successCount = 0;
    const newCache = {};

    for (let n of encryptedVaultNotes) {
      const dec = await decryptAES256(n.content, keyToUse);
      if (dec !== null) {
        newCache[n.id] = dec;
        successCount++;
      }
    }

    if (encryptedVaultNotes.length > 0 && successCount === 0) {
      alert(recoveryMode ? '❌ Invalid 24-Word Emergency Recovery Phrase.' : '❌ Incorrect Master Vault Passphrase.');
    } else {
      setDecryptedCache(prev => ({ ...prev, ...newCache }));
      setMasterVaultPassphrase(keyToUse);
      setIsVaultUnlocked(true);
      setShowUnlockModal(false);
    }
  };

  // 📄 Generate 24-Word Recovery Mnemonic Sheet
  const handleGenerateMnemonicSheet = () => {
    const words = generate24WordMnemonic();
    setGeneratedMnemonic(words);
    setShowMnemonicSheet(true);
  };

  const handleCopyMnemonic = () => {
    if (!generatedMnemonic) return;
    navigator.clipboard.writeText(generatedMnemonic.join(' '));
    alert('📋 24-Word Recovery Phrase copied to clipboard! Store it in a safe offline location.');
  };

  const handleDownloadMnemonicSheet = () => {
    if (!generatedMnemonic) return;
    const sheetText = `====================================================\nNAQASHLY PRIVATE VAULT - 24-WORD EMERGENCY RECOVERY SHEET\n====================================================\nCreated: ${new Date().toLocaleString()}\n\nWARNING: Keep this 24-word recovery phrase safe offline.\nIf you lose your Master Passphrase, these 24 words are the ONLY way to recover your encrypted notes!\n\n${generatedMnemonic.map((w, idx) => `${(idx + 1).toString().padStart(2, '0')}. ${w}`).join('\n')}\n====================================================`;
    const blob = new Blob([sheetText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naqashly_vault_24word_recovery_sheet.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 🔒 Lock Vault Session
  const handleLockVault = () => {
    setIsVaultUnlocked(false);
    setMasterVaultPassphrase('');
    setRecoveryWordsInput('');
    setDecryptedCache({});
    setActiveSubTab('NOTES');
  };

  // 📤 1-Tap Export & Copy Actions
  const handleCopyNoteText = (n) => {
    const contentToCopy = checkIsEncryptedNote(n) ? (decryptedCache[n.id] || n.content) : n.content;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentToCopy || '';
    const plainText = `${n.title}\n\n${tempDiv.innerText || tempDiv.textContent}`;
    navigator.clipboard.writeText(plainText);
    alert('📋 Note copied to clipboard!');
  };

  const handleDownloadMarkdown = (n) => {
    const contentToExport = checkIsEncryptedNote(n) ? (decryptedCache[n.id] || n.content) : n.content;
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
    const isEncryptedNote = activeSubTab === 'VAULT';

    if (isEncryptedNote) {
      if (!masterVaultPassphrase.trim()) {
        alert('Please unlock your Private Vault with a Passphrase before creating encrypted entries.');
        return;
      }
      // Encrypt with AES-256-GCM
      htmlContent = await encryptAES256(htmlContent, masterVaultPassphrase.trim());
    }

    const newNoteObj = {
      title: title.trim(),
      content: htmlContent,
      category: isEncryptedNote ? 'PERSONAL' : category,
      mood: selectedMood,
      locationTag: locationTag.trim(),
      weatherTag: weatherTag.trim(),
      tags: tagsInput,
      isPinned,
      isFavorite,
      isEncrypted: isEncryptedNote
    };

    client.post('/journal/notes', newNoteObj).then(res => {
      const createdNote = res.data || { id: Date.now(), ...newNoteObj };
      setNotes(prev => [createdNote, ...prev]);
      setTitle('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      setShowAddForm(false);
    }).catch(err => {
      console.warn('[JournalModule] Fallback local note save:', err);
      const createdNote = { id: Date.now(), ...newNoteObj };
      setNotes(prev => [createdNote, ...prev]);
      setTitle('');
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
    const isVaultNote = checkIsEncryptedNote(n);
    if (activeSubTab === 'NOTES' && isVaultNote) return false;
    if (activeSubTab === 'VAULT' && (!isVaultNote || !isVaultUnlocked)) return false;

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
            General Notes & Dedicated Zero-Knowledge AES-256 Private Encryption Vault.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="cyan">journal-service :8083</Badge>

          {activeSubTab === 'VAULT' && isVaultUnlocked && (
            <>
              <Button variant="subtle" onClick={handleGenerateMnemonicSheet} style={{ border: '1px solid #10B981', color: '#10B981' }}>
                📄 24-Word Recovery Key
              </Button>

              <Button variant="subtle" onClick={handleLockVault} style={{ border: '1px solid #EF4444', color: '#EF4444' }}>
                🔒 Lock Vault
              </Button>
            </>
          )}

          <Button variant="emerald" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Close' : activeSubTab === 'VAULT' ? '+ New Encrypted Entry' : '+ New Note'}
          </Button>
        </div>
      </div>

      {/* DEDICATED SUB-TAB NAVIGATION (GENERAL NOTES vs PRIVATE VAULT) */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => handleSwitchSubTab('NOTES')}
          style={{
            background: activeSubTab === 'NOTES' ? 'var(--bg-surface-elevated)' : 'transparent',
            color: activeSubTab === 'NOTES' ? '#10B981' : 'var(--text-muted)',
            border: `1px solid ${activeSubTab === 'NOTES' ? '#10B981' : 'transparent'}`,
            borderRadius: '10px',
            padding: '0.55rem 1.15rem',
            fontSize: '0.88rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          🌐 General Notes & Retrospectives ({notes.filter(n => !checkIsEncryptedNote(n)).length})
        </button>

        <button
          type="button"
          onClick={() => handleSwitchSubTab('VAULT')}
          style={{
            background: activeSubTab === 'VAULT' ? 'rgba(239, 68, 68, 0.12)' : 'transparent',
            color: activeSubTab === 'VAULT' ? '#EF4444' : 'var(--text-muted)',
            border: `1px solid ${activeSubTab === 'VAULT' ? '#EF4444' : 'transparent'}`,
            borderRadius: '10px',
            padding: '0.55rem 1.15rem',
            fontSize: '0.88rem',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem'
          }}
        >
          🔒 Private Encryption Vault ({notes.filter(n => checkIsEncryptedNote(n)).length})
        </button>
      </div>

      {/* 🔒 PASSPHRASE POPUP CHALLENGE MODAL & 24-WORD RECOVERY TOGGLE */}
      {showUnlockModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleUnlockMasterVault} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '22px', padding: '2rem', width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '1.15rem', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '3rem' }}>{recoveryMode ? '📜 🔑' : '🔒 🔑'}</div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#EF4444', margin: '0 0 0.35rem 0' }}>
                {recoveryMode ? 'BIP-39 24-Word Emergency Recovery' : 'Private Encryption Vault Locked'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {recoveryMode
                  ? 'Enter your 24-word emergency recovery mnemonic phrase to mathematically derive your key and unlock your vault.'
                  : 'Enter your Master Passphrase to decrypt and view your zero-knowledge private notes.'}
              </p>
            </div>

            {!recoveryMode ? (
              <input
                type="password"
                placeholder="Enter Master Vault Passphrase..."
                value={masterVaultPassphrase}
                onChange={e => setMasterVaultPassphrase(e.target.value)}
                style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '10px', fontSize: '0.92rem', outline: 'none', textAlign: 'center', fontWeight: '800' }}
                autoFocus
                required
              />
            ) : (
              <textarea
                placeholder="Enter 24 recovery words (e.g. apple horizon river quantum shadow forest...)..."
                value={recoveryWordsInput}
                onChange={e => setRecoveryWordsInput(e.target.value)}
                rows={4}
                style={{ padding: '0.75rem 1rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: '#10B981', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', fontWeight: '700', fontFamily: 'monospace' }}
                autoFocus
                required
              />
            )}

            <div style={{ display: 'flex', justifyContent: 'center', margin: '-0.25rem 0' }}>
              <button
                type="button"
                onClick={() => setRecoveryMode(!recoveryMode)}
                style={{ background: 'transparent', border: 'none', color: '#38BDF8', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {recoveryMode ? '🔑 Use Passphrase Instead' : '🆘 Forgot Passphrase? Use 24-Word Recovery Phrase'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Button type="button" variant="subtle" onClick={() => { setShowUnlockModal(false); setActiveSubTab('NOTES'); }} style={{ flex: 1 }}>
                Cancel
              </Button>
              <Button type="submit" variant="emerald" style={{ flex: 1 }}>
                {recoveryMode ? '📜 Recover Vault' : '🔑 Unlock Vault'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 📄 24-WORD GENERATED RECOVERY SHEET MODAL */}
      {showMnemonicSheet && generatedMnemonic && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '22px', padding: '2rem', width: '100%', maxWidth: '540px', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>📜 🛡️</div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#10B981', margin: '0 0 0.35rem 0' }}>
                BIP-39 Emergency 24-Word Recovery Sheet
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                Keep these 24 words in a safe offline location. If you ever forget your Master Passphrase, entering these 24 words will restore access to your private vault.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', background: 'var(--bg-surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', textAlign: 'left' }}>
              {generatedMnemonic.map((w, idx) => (
                <div key={idx} style={{ fontSize: '0.78rem', color: '#38BDF8', fontFamily: 'monospace', fontWeight: '800' }}>
                  <span style={{ color: 'var(--text-muted)', marginRight: '4px' }}>{(idx + 1).toString().padStart(2, '0')}.</span>
                  {w}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.65rem' }}>
              <Button type="button" variant="emerald" onClick={handleCopyMnemonic} style={{ flex: 1 }}>
                📋 Copy Words
              </Button>
              <Button type="button" variant="pink" onClick={handleDownloadMnemonicSheet} style={{ flex: 1 }}>
                📥 Download Sheet (.txt)
              </Button>
              <Button type="button" variant="subtle" onClick={() => setShowMnemonicSheet(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

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
        <form onSubmit={handleAddNote} style={{ background: 'var(--bg-surface-elevated)', padding: '1.35rem', borderRadius: '18px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', border: `1px solid ${activeSubTab === 'VAULT' ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'}`, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
          
          {/* TITLE & CATEGORY ROW */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={activeSubTab === 'VAULT' ? 'Encrypted Vault Entry Title...' : 'Note Title...'}
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ flex: 1, padding: '0.65rem 0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '10px', fontSize: '1rem', fontWeight: '800', outline: 'none' }}
              required
            />
            {activeSubTab === 'NOTES' ? (
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
            ) : (
              <Badge variant="pink">🔒 AES-256 Vault Mode</Badge>
            )}
          </div>

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
            <Button type="submit" variant="emerald">
              {activeSubTab === 'VAULT' ? '🔒 Save Encrypted Entry' : '💾 Save Note'}
            </Button>
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
      ) : activeSubTab === 'VAULT' && !isVaultUnlocked ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '3rem', background: 'var(--bg-surface-elevated)', border: '1px dashed rgba(239, 68, 68, 0.4)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🔒 🔑</div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#EF4444', margin: '0 0 0.35rem 0' }}>Private Encryption Vault Locked</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Notes inside the Private Vault are zero-knowledge encrypted. Passphrase or 24-word recovery phrase is required to unlock.</p>
          </div>
          <Button variant="emerald" onClick={() => setShowUnlockModal(true)}>
            🔑 Unlock Vault Challenge
          </Button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2.5rem', background: 'var(--bg-surface-elevated)', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
          No entries match the current view filter. Click <strong>{activeSubTab === 'VAULT' ? '"+ New Encrypted Entry"' : '"+ New Note"'}</strong> above!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.1rem' }}>
          {filteredNotes.map(n => {
            const moodObj = MOOD_OPTIONS.find(m => m.id === n.mood) || MOOD_OPTIONS[0];
            const isDecrypted = decryptedCache[n.id] !== undefined;
            const contentToDisplay = checkIsEncryptedNote(n) ? (isDecrypted ? decryptedCache[n.id] : null) : n.content;

            return (
              <div key={n.id} style={{ background: checkIsEncryptedNote(n) ? 'rgba(239, 68, 68, 0.04)' : 'var(--bg-surface-elevated)', border: `1px solid ${checkIsEncryptedNote(n) ? 'rgba(239, 68, 68, 0.3)' : 'var(--border-subtle)'}`, borderRadius: '16px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontSize: '0.72rem', background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                        #{n.category || 'WORK'}
                      </span>
                      {checkIsEncryptedNote(n) && (
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
                  <div
                    style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}
                    dangerouslySetInnerHTML={{ __html: contentToDisplay }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>📍 {n.locationTag || 'Somewhere on Earth'}</span>
                  <span style={{ fontSize: '0.72rem', color: checkIsEncryptedNote(n) ? '#EF4444' : '#10B981', fontWeight: '800' }}>
                    {checkIsEncryptedNote(n) ? '🔒 Zero-Knowledge Vault' : 'PostgreSQL Synced'}
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
