import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { encryptAES256, decryptAES256, generate24WordMnemonic, mnemonicToPassphrase } from '../../utils/cryptoUtils';
import { JournalHeader } from './components/JournalHeader';

/**
 * 📝 Executive Mind OS - Decluttered Zen Workspace with 📌 1-Tap Note Pinning & Sorting
 * 
 * Features:
 * 1. 📌 1-Tap Note Pinning & Auto-Top Priority Grid Sorting
 * 2. 🖍️ Interactive Highlighter Selection Indicator & 1-Tap ✕ Clear Highlight
 * 3. 🎨 Grouped & Decluttered Executive Toolbar (Text Color Palette, Headings, Lists, Checklists)
 * 4. 📱 iOS-Style Floating Segmented Sub-Tab Switcher
 * 5. ✏️ Interactive Full-Screen Note Reader & Editor Modal on Card Click
 * 6. 🔒 Zero-Knowledge AES-256-GCM Private Vault Re-Encryption Engine
 * 7. 📜 BIP-39 24-Word Emergency Recovery Phrase Engine
 * 8. 🎙️ Web Speech Real-Time Voice-to-Text Dictation
 * 
 * @author Barkat Bashir
 * @version 15.0.0
 */
export const JournalModule = () => {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [showEditToolsDropdown, setShowEditToolsDropdown] = useState(false);

  // Sub-Tab State: 'NOTES' vs 'VAULT'
  const [activeSubTab, setActiveSubTab] = useState('NOTES');
  const [showInsightsDrawer, setShowInsightsDrawer] = useState(false);

  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDriveModal, setShowDriveModal] = useState(false);

  // Add Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('WORK');
  const [selectedMood, setSelectedMood] = useState('INSPIRED');
  const [locationTag, setLocationTag] = useState('');
  const [weatherTag, setWeatherTag] = useState('');
  const [tagsInput, setTagsInput] = useState('architecture, reflection');
  const [isPinned, setIsPinned] = useState(false);

  // ✏️ Interactive Note Reader & Edit Modal State
  const [editingNote, setEditingNote] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('WORK');
  const [editMood, setEditMood] = useState('INSPIRED');
  const [editLocationTag, setEditLocationTag] = useState('');
  const [editTags, setEditTags] = useState('');
  const editEditorRef = useRef(null);

  // Master Vault Passphrase & Unlocked State
  const [masterVaultPassphrase, setMasterVaultPassphrase] = useState('');
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);

  // 🔑 24-Word Mnemonic Recovery State
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryWordsInput, setRecoveryWordsInput] = useState('');
  const [generatedMnemonic, setGeneratedMnemonic] = useState(null);
  const [showMnemonicSheet, setShowMnemonicSheet] = useState(false);

  // Decrypted Memory Map { noteId: decryptedHTMLText }
  const [decryptedCache, setDecryptedCache] = useState({});

  // Stats State
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [readTime, setReadTime] = useState(1);

  // Active Highlight State
  const [activeHighlightColor, setActiveHighlightColor] = useState(null);
  const [activeTextColor, setActiveTextColor] = useState(null);

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
        console.warn('[JournalModule] Backend unavailable, loading fallback notes:', err);
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
    const currentRef = showEditModal ? editEditorRef.current : editorRef.current;
    if (currentRef) {
      const text = currentRef.innerText || '';
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
    const currentRef = showEditModal ? editEditorRef.current : editorRef.current;
    if (currentRef) currentRef.focus();
  };

  const handleColorChange = (colorHex) => {
    document.execCommand('foreColor', false, colorHex);
    setActiveTextColor(colorHex);
    updateActiveFormats();
    const currentRef = showEditModal ? editEditorRef.current : editorRef.current;
    if (currentRef) currentRef.focus();
  };

  // 🖍️ Interactive Highlighter with Selection Toggle & Clear Support
  const handleHighlight = (colorHex) => {
    if (activeHighlightColor === colorHex) {
      document.execCommand('hiliteColor', false, 'transparent');
      document.execCommand('backColor', false, 'transparent');
      setActiveHighlightColor(null);
    } else {
      document.execCommand('hiliteColor', false, colorHex);
      document.execCommand('backColor', false, colorHex);
      setActiveHighlightColor(colorHex);
    }
    updateActiveFormats();
    const currentRef = showEditModal ? editEditorRef.current : editorRef.current;
    if (currentRef) currentRef.focus();
  };

  const handleClearHighlight = () => {
    document.execCommand('hiliteColor', false, 'transparent');
    document.execCommand('backColor', false, 'transparent');
    setActiveHighlightColor(null);
    updateActiveFormats();
    const currentRef = showEditModal ? editEditorRef.current : editorRef.current;
    if (currentRef) currentRef.focus();
  };

  const handleInsertChecklist = () => {
    const checklistHtml = '<div><input type="checkbox" style="margin-right: 6px; cursor: pointer;" /> <span>New Task Item...</span></div>';
    document.execCommand('insertHTML', false, checklistHtml);
    updateActiveFormats();
  };

  // 📌 Toggle Pin Note Handler
  const handleTogglePinNote = (note, e) => {
    if (e) e.stopPropagation();
    const updatedNote = { ...note, isPinned: !note.isPinned };
    client.put(`/journal/notes/${note.id}`, updatedNote)
      .then(() => setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n)))
      .catch(() => setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n)));
  };

  // 🎙️ Speech Recognition Dictation
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser.');
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
      const currentRef = showEditModal ? editEditorRef.current : editorRef.current;
      if (currentRef && transcript.trim()) {
        document.execCommand('insertText', false, ' ' + transcript.trim());
        updateActiveFormats();
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

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

  // 🔑 Unlock Master Private Vault Session
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
      alert(recoveryMode ? '❌ Invalid 24-Word Recovery Phrase.' : '❌ Incorrect Passphrase.');
    } else {
      setDecryptedCache(prev => ({ ...prev, ...newCache }));
      setMasterVaultPassphrase(keyToUse);
      setIsVaultUnlocked(true);
      setShowUnlockModal(false);
    }
  };

  // 📄 Generate Mnemonic Sheet
  const handleGenerateMnemonicSheet = () => {
    const words = generate24WordMnemonic();
    setGeneratedMnemonic(words);
    setShowMnemonicSheet(true);
  };

  const handleCopyMnemonic = () => {
    if (!generatedMnemonic) return;
    navigator.clipboard.writeText(generatedMnemonic.join(' '));
    alert('📋 24-Word Recovery Phrase copied to clipboard!');
  };

  const handleDownloadMnemonicSheet = () => {
    if (!generatedMnemonic) return;
    const sheetText = `NAQASHLY PRIVATE VAULT - 24-WORD RECOVERY SHEET\nCreated: ${new Date().toLocaleString()}\n\n${generatedMnemonic.map((w, idx) => `${idx + 1}. ${w}`).join('\n')}`;
    const blob = new Blob([sheetText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `naqashly_vault_24word_recovery_sheet.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 🔒 Lock Vault
  const handleLockVault = () => {
    setIsVaultUnlocked(false);
    setMasterVaultPassphrase('');
    setRecoveryWordsInput('');
    setDecryptedCache({});
    setActiveSubTab('NOTES');
  };

  // ✏️ Open Interactive Note Editor Modal
  const handleOpenEditModal = (note) => {
    if (checkIsEncryptedNote(note) && !isVaultUnlocked) {
      setShowUnlockModal(true);
      return;
    }
    const decryptedText = checkIsEncryptedNote(note) ? (decryptedCache[note.id] || note.content) : note.content;
    setEditingNote(note);
    setEditTitle(note.title || '');
    setEditCategory(note.category || 'WORK');
    setEditMood(note.mood || 'INSPIRED');
    setEditLocationTag(note.locationTag || '');
    setEditTags(note.tags || '');
    setShowEditModal(true);

    setTimeout(() => {
      if (editEditorRef.current) {
        editEditorRef.current.innerHTML = decryptedText || '';
        updateActiveFormats();
      }
    }, 100);
  };

  // 💾 Save / Update Edited Note
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!editingNote || !editTitle.trim()) return;

    let updatedHtml = editEditorRef.current ? editEditorRef.current.innerHTML : '';
    const isEncryptedNote = checkIsEncryptedNote(editingNote);

    if (isEncryptedNote) {
      if (!masterVaultPassphrase.trim()) {
        alert('Please unlock your Private Vault with a Passphrase before saving encrypted changes.');
        return;
      }
      // Re-encrypt updated HTML
      const newCipher = await encryptAES256(updatedHtml, masterVaultPassphrase.trim());
      setDecryptedCache(prev => ({ ...prev, [editingNote.id]: updatedHtml }));
      updatedHtml = newCipher;
    }

    const updatedNoteObj = {
      ...editingNote,
      title: editTitle.trim(),
      content: updatedHtml,
      category: editCategory,
      mood: editMood,
      locationTag: editLocationTag.trim(),
      tags: editTags
    };

    client.put(`/journal/notes/${editingNote.id}`, updatedNoteObj)
      .then(res => {
        const savedNote = res.data || updatedNoteObj;
        setNotes(prev => prev.map(n => n.id === editingNote.id ? savedNote : n));
        setShowEditModal(false);
        setEditingNote(null);
      })
      .catch(err => {
        console.warn('[JournalModule] Fallback local note update:', err);
        setNotes(prev => prev.map(n => n.id === editingNote.id ? updatedNoteObj : n));
        setShowEditModal(false);
        setEditingNote(null);
      });
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
      .then(() => setNotes(prev => prev.filter(n => n.id !== id)))
      .catch(() => setNotes(prev => prev.filter(n => n.id !== id)));
  };

  const filteredNotes = notes.filter(n => {
    const isVaultNote = checkIsEncryptedNote(n);
    if (activeSubTab === 'NOTES' && isVaultNote) return false;
    if (activeSubTab === 'VAULT' && (!isVaultNote || !isVaultUnlocked)) return false;

    const matchesCategory = activeCategoryFilter === 'ALL' || n.category === activeCategoryFilter;
    const matchesSearch = !searchQuery || n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || n.content?.toLowerCase().includes(searchQuery.toLowerCase()) || n.tags?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  // 🎨 Decluttered & Grouped Executive Rich Toolbar Component
  const renderRichToolbar = (toggleToolsAction, showToolsState) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderBottom: 'none', padding: '0.45rem 0.75rem', borderRadius: '10px 10px 0 0', flexWrap: 'wrap', gap: '0.5rem' }}>
      
      {/* GROUPED FORMATTING CLUSTERS */}
      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* CLUSTER A: BASIC FORMATTING (B, I, U, S) */}
        <div style={{ display: 'flex', gap: '0.15rem', background: 'var(--bg-surface-elevated)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <button type="button" onClick={() => handleFormat('bold')} style={{ background: activeFormats.bold ? '#10B981' : 'transparent', color: activeFormats.bold ? '#fff' : 'var(--text-heading)', border: 'none', borderRadius: '4px', padding: '0.15rem 0.45rem', fontWeight: '900', cursor: 'pointer' }} title="Bold">B</button>
          <button type="button" onClick={() => handleFormat('italic')} style={{ background: activeFormats.italic ? '#10B981' : 'transparent', color: activeFormats.italic ? '#fff' : 'var(--text-heading)', border: 'none', borderRadius: '4px', padding: '0.15rem 0.45rem', fontStyle: 'italic', cursor: 'pointer' }} title="Italic">I</button>
          <button type="button" onClick={() => handleFormat('underline')} style={{ background: activeFormats.underline ? '#10B981' : 'transparent', color: activeFormats.underline ? '#fff' : 'var(--text-heading)', border: 'none', borderRadius: '4px', padding: '0.15rem 0.45rem', textDecoration: 'underline', cursor: 'pointer' }} title="Underline">U</button>
          <button type="button" onClick={() => handleFormat('strikeThrough')} style={{ background: activeFormats.strikeThrough ? '#10B981' : 'transparent', color: activeFormats.strikeThrough ? '#fff' : 'var(--text-heading)', border: 'none', borderRadius: '4px', padding: '0.15rem 0.45rem', textDecoration: 'line-through', cursor: 'pointer' }} title="Strikethrough">S</button>
        </div>

        {/* CLUSTER B: HEADINGS (H1, H2) */}
        <div style={{ display: 'flex', gap: '0.15rem', background: 'var(--bg-surface-elevated)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <button type="button" onClick={() => handleFormat('formatBlock', 'H1')} style={{ background: 'transparent', border: 'none', color: '#38BDF8', borderRadius: '4px', padding: '0.15rem 0.4rem', fontWeight: '900', fontSize: '0.75rem', cursor: 'pointer' }} title="Heading 1">H1</button>
          <button type="button" onClick={() => handleFormat('formatBlock', 'H2')} style={{ background: 'transparent', border: 'none', color: '#38BDF8', borderRadius: '4px', padding: '0.15rem 0.4rem', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }} title="Heading 2">H2</button>
        </div>

        {/* CLUSTER C: LISTS & CHECKLIST */}
        <div style={{ display: 'flex', gap: '0.15rem', background: 'var(--bg-surface-elevated)', padding: '2px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <button type="button" onClick={() => handleFormat('insertUnorderedList')} style={{ background: activeFormats.insertUnorderedList ? '#10B981' : 'transparent', color: activeFormats.insertUnorderedList ? '#fff' : 'var(--text-heading)', border: 'none', borderRadius: '4px', padding: '0.15rem 0.45rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }} title="Bullet List">• List</button>
          <button type="button" onClick={() => handleFormat('insertOrderedList')} style={{ background: activeFormats.insertOrderedList ? '#10B981' : 'transparent', color: activeFormats.insertOrderedList ? '#fff' : 'var(--text-heading)', border: 'none', borderRadius: '4px', padding: '0.15rem 0.45rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }} title="Numbered List">1. List</button>
          <button type="button" onClick={handleInsertChecklist} style={{ background: 'transparent', border: 'none', color: 'var(--text-heading)', fontSize: '0.72rem', fontWeight: '800', padding: '0.15rem 0.45rem', cursor: 'pointer' }} title="Task Checklist">☑️ Checklist</button>
        </div>

        {/* CLUSTER D: TEXT COLOR PALETTE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'var(--bg-surface-elevated)', padding: '3px 6px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }} title="Text Color Palette">
          <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)' }}>🎨</span>
          {['#10B981', '#EC4899', '#38BDF8', '#F59E0B', '#EF4444', '#FFFFFF'].map(c => (
            <button
              key={c}
              type="button"
              onClick={() => handleColorChange(c)}
              style={{
                width: '13px',
                height: '13px',
                borderRadius: '50%',
                background: c,
                border: activeTextColor === c ? '2px solid #10B981' : '1px solid rgba(0,0,0,0.3)',
                transform: activeTextColor === c ? 'scale(1.2)' : 'scale(1)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            />
          ))}
        </div>

        {/* CLUSTER E: HIGHLIGHTER PILLS WITH ACTIVE SELECTION & CLEAR BUTTON */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', background: 'var(--bg-surface-elevated)', padding: '3px 6px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }} title="Highlight Text (Click active highlight to remove)">
          <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)' }}>🖍️</span>
          {['#FEF08A', '#BBF7D0', '#FBCFE8', '#BAE6FD'].map(hColor => (
            <button
              key={hColor}
              type="button"
              onClick={() => handleHighlight(hColor)}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '3px',
                background: hColor,
                border: activeHighlightColor === hColor ? '2px solid #10B981' : '1px solid rgba(0,0,0,0.2)',
                boxShadow: activeHighlightColor === hColor ? '0 0 6px rgba(16,185,129,0.8)' : 'none',
                transform: activeHighlightColor === hColor ? 'scale(1.2)' : 'scale(1)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={activeHighlightColor === hColor ? "Active Highlight (Click to Remove)" : "Highlight Text"}
            />
          ))}
          {activeHighlightColor && (
            <button
              type="button"
              onClick={handleClearHighlight}
              style={{
                background: 'rgba(239, 68, 68, 0.18)',
                color: '#EF4444',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '4px',
                padding: '0.05rem 0.35rem',
                fontSize: '0.68rem',
                fontWeight: '900',
                cursor: 'pointer',
                marginLeft: '0.15rem'
              }}
              title="Clear Highlight / Background Color"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: DICTATE & PROGRESSIVE TOOLS DROPDOWN */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button
          type="button"
          onClick={toggleSpeechRecognition}
          style={{ background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)', color: isListening ? '#EF4444' : '#10B981', border: `1px solid ${isListening ? '#EF4444' : '#10B981'}`, borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
        >
          {isListening ? '🔴 Dictating...' : '🎙️ Dictate'}
        </button>

        <button
          type="button"
          onClick={toggleToolsAction}
          style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.2rem 0.45rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}
        >
          ⚙️ Tools {showToolsState ? '▲' : '▾'}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <Card className="col-12" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
      <style>{`
        .journal-editor-canvas ul, .journal-editor-canvas ol {
          padding-left: 1.75rem !important;
          margin: 0.5rem 0 !important;
        }
        .journal-editor-canvas li {
          margin-bottom: 0.25rem !important;
        }
        .journal-editor-canvas h1 {
          font-size: 1.5rem;
          font-weight: 900;
          color: #38BDF8;
          margin: 0.5rem 0;
        }
        .journal-editor-canvas h2 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #38BDF8;
          margin: 0.5rem 0;
        }
        .zen-card {
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .zen-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.22);
        }
        .zen-card-actions {
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        .zen-card:hover .zen-card-actions {
          opacity: 1;
        }
      `}</style>

      {/* 🌟 EXECUTIVE JOURNAL HEADER */}
      <JournalHeader
        notesCount={notes.filter(n => !checkIsEncryptedNote(n)).length}
        vaultCount={notes.filter(n => checkIsEncryptedNote(n)).length}
        pinnedCount={notes.filter(n => n.isPinned).length}
        isVaultUnlocked={isVaultUnlocked}
        onOpenNewEntry={() => setShowAddForm(!showAddForm)}
        onOpenInsights={() => setShowInsightsDrawer(true)}
        onLockVault={handleLockVault}
      />

      {/* 🌟 EXECUTIVE METRICS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <motion.div
          whileHover={{ y: -4 }}
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.25s ease'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#10B981' }} />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
              Zen Notes
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
              {notes.filter(n => !checkIsEncryptedNote(n)).length}
            </div>
          </div>
          <div style={{ fontSize: '1.5rem' }}>🌐</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.25s ease'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#EF4444' }} />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
              Locked Vault
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
              {notes.filter(n => checkIsEncryptedNote(n)).length}
            </div>
          </div>
          <div style={{ fontSize: '1.5rem' }}>🔒</div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          style={{
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.25s ease'
          }}
        >
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: '#38BDF8' }} />
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.3rem' }}>
              Pinned Entries
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-heading)', fontFamily: 'var(--font-mono)' }}>
              {notes.filter(n => n.isPinned).length}
            </div>
          </div>
          <div style={{ fontSize: '1.5rem' }}>📌</div>
        </motion.div>
      </div>

      {/* 🌟 ANMATED SUB-TAB BAR SWITCHER */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-surface-elevated)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '16px',
        padding: '0.3rem',
        gap: '0.45rem',
        width: 'fit-content',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        marginBottom: '1rem',
        boxSizing: 'border-box'
      }}>
        {[
          { key: 'NOTES', label: '🌐 Zen Notes', color: '#10B981' },
          { key: 'VAULT', label: '🔒 Private Vault', color: '#EF4444' }
        ].map(tab => {
          const isActive = activeSubTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleSwitchSubTab(tab.key)}
              style={{
                padding: '0.55rem 1.15rem',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: '800',
                cursor: 'pointer',
                background: isActive ? 'var(--bg-surface)' : 'transparent',
                border: '1px solid transparent',
                color: isActive ? tab.color : 'var(--text-muted)',
                boxShadow: isActive ? '0 4px 10px rgba(0, 0, 0, 0.15)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* ✏️ INTERACTIVE EXECUTIVE NOTE READER & EDITOR MODAL */}
      {showEditModal && editingNote && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <form onSubmit={handleUpdateNote} style={{ background: 'var(--bg-surface-elevated)', border: `1px solid ${checkIsEncryptedNote(editingNote) ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'}`, borderRadius: '22px', padding: '1.75rem', width: '100%', maxWidth: '780px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 25px 60px rgba(0,0,0,0.5)', overflowY: 'auto' }}>
            
            {/* MODAL HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '900', color: 'var(--text-heading)' }}>
                  ✏️ Edit Note
                </span>
                {editingNote.isPinned && (
                  <Badge variant="cyan">📌 Pinned</Badge>
                )}
                {checkIsEncryptedNote(editingNote) && (
                  <Badge variant="pink">🔒 AES-256 Vault Note</Badge>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button type="button" onClick={(e) => handleTogglePinNote(editingNote, e)} style={{ background: editingNote.isPinned ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-surface)', border: `1px solid ${editingNote.isPinned ? '#38BDF8' : 'var(--border-subtle)'}`, color: editingNote.isPinned ? '#38BDF8' : 'var(--text-heading)', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                  {editingNote.isPinned ? '📌 Pinned' : '📌 Pin Note'}
                </button>
                <button type="button" onClick={() => handleCopyNoteText(editingNote)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                  📋 Copy
                </button>
                <button type="button" onClick={() => handleDownloadMarkdown(editingNote)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                  📥 Export .md
                </button>
                <button type="button" onClick={() => { handleDeleteNote(editingNote.id); setShowEditModal(false); }} style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#EF4444', borderRadius: '6px', padding: '0.25rem 0.6rem', fontSize: '0.78rem', fontWeight: '800', cursor: 'pointer' }}>
                  🗑️ Delete
                </button>
                <button type="button" onClick={() => setShowEditModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}>
                  ✕
                </button>
              </div>
            </div>

            {/* TITLE & CATEGORY ROW */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Note Title..."
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                style={{ flex: 1, padding: '0.65rem 0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '10px', fontSize: '1.05rem', fontWeight: '800', outline: 'none' }}
                required
              />

              <select
                value={editCategory}
                onChange={e => setEditCategory(e.target.value)}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '10px', padding: '0.65rem 0.85rem', fontSize: '0.82rem', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
              >
                <option value="WORK">🏢 WORK</option>
                <option value="IDEAS">💡 IDEAS</option>
                <option value="PERSONAL">🧘 PERSONAL</option>
                <option value="ARCHITECTURE">⚙️ ARCHITECTURE</option>
              </select>
            </div>

            {/* COMPLETE RICH FORMATTING TOOLBAR */}
            {renderRichToolbar(() => setShowEditToolsDropdown(!showEditToolsDropdown), showEditToolsDropdown)}

            {/* EDITABLE CANVAS */}
            <div
              ref={editEditorRef}
              contentEditable
              suppressContentEditableWarning
              onKeyUp={updateActiveFormats}
              onMouseUp={updateActiveFormats}
              onClick={updateActiveFormats}
              className="journal-editor-canvas"
              style={{
                minHeight: '220px',
                padding: '1rem',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '0 0 10px 10px',
                color: 'var(--text-heading)',
                fontSize: '0.94rem',
                outline: 'none',
                overflowY: 'auto',
                lineHeight: 1.5
              }}
            />

            {/* COLLAPSIBLE EDIT TOOLS & MOOD PANEL */}
            {showEditToolsDropdown && (
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>Mood:</span>
                  {MOOD_OPTIONS.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setEditMood(m.id)}
                      style={{ background: editMood === m.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent', border: `1px solid ${editMood === m.id ? '#10B981' : 'transparent'}`, borderRadius: '6px', padding: '0.15rem 0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <select onChange={(e) => handleFormat('fontSize', e.target.value)} defaultValue="3" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', padding: '0.2rem 0.45rem', fontSize: '0.72rem', fontWeight: '800', outline: 'none', cursor: 'pointer' }}>
                    <option value="1">Aa Small (12px)</option>
                    <option value="3">Aa Normal (15px)</option>
                    <option value="4">Aa Large (18px)</option>
                    <option value="6">Aa Huge (24px)</option>
                  </select>
                  <button type="button" onClick={() => handleFormat('formatBlock', 'PRE')} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#10B981', borderRadius: '6px', padding: '0.2rem 0.45rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}>&lt;/&gt; Code Block</button>
                  <Button type="button" variant="subtle" onClick={() => setShowDriveModal(true)} style={{ fontSize: '0.72rem' }}>🔒 Attach Media</Button>
                </div>
              </div>
            )}

            {/* METADATA ROW & ACTION BUTTONS */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
                <input type="text" placeholder="Location Tag" value={editLocationTag} onChange={e => setEditLocationTag(e.target.value)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', padding: '0.4rem 0.6rem', fontSize: '0.78rem', flex: 1 }} />
                <input type="text" placeholder="Tags (comma separated)" value={editTags} onChange={e => setEditTags(e.target.value)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', padding: '0.4rem 0.6rem', fontSize: '0.78rem', flex: 2 }} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button type="button" variant="subtle" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit" variant="emerald">
                  {checkIsEncryptedNote(editingNote) ? '🔒 Re-Encrypt & Save' : '💾 Update Note'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 🔒 PASSPHRASE POPUP CHALLENGE MODAL */}
      {showUnlockModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <form onSubmit={handleUnlockMasterVault} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '22px', padding: '2rem', width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '1.15rem', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <div style={{ fontSize: '3rem' }}>{recoveryMode ? '📜 🔑' : '🔒 🔑'}</div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#EF4444', margin: '0 0 0.35rem 0' }}>
                {recoveryMode ? 'BIP-39 24-Word Recovery' : 'Private Vault Locked'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                {recoveryMode
                  ? 'Enter your 24-word emergency recovery phrase to derive your key and unlock your vault.'
                  : 'Enter your Master Passphrase to unlock your zero-knowledge private entries.'}
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

      {/* 📄 24-WORD RECOVERY SHEET MODAL */}
      {showMnemonicSheet && generatedMnemonic && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: '22px', padding: '2rem', width: '100%', maxWidth: '540px', display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>📜 🛡️</div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '900', color: '#10B981', margin: '0 0 0.35rem 0' }}>
                BIP-39 24-Word Emergency Recovery Sheet
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
                Keep these 24 words in a safe offline location. Entering these 24 words will restore access to your private vault anytime.
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

      {/* SEARCH & CATEGORY FILTER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '0.55rem 0.85rem', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {['ALL', 'WORK', 'IDEAS', 'PERSONAL', 'ARCHITECTURE'].map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategoryFilter(cat)}
              style={{
                background: activeCategoryFilter === cat ? '#EC4899' : 'transparent',
                color: activeCategoryFilter === cat ? '#fff' : 'var(--text-muted)',
                border: `1px solid ${activeCategoryFilter === cat ? '#EC4899' : 'transparent'}`,
                borderRadius: '8px',
                padding: '0.25rem 0.6rem',
                fontSize: '0.75rem',
                fontWeight: '800',
                cursor: 'pointer'
              }}
            >
              {cat === 'ALL' ? '🌐 All' : `#${cat}`}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="🔍 Search..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', padding: '0.3rem 0.65rem', fontSize: '0.78rem', fontWeight: '700', outline: 'none', minWidth: '180px' }}
        />
      </div>

      {/* ZEN EXECUTIVE EDITOR FORM */}
      {showAddForm && (
        <form onSubmit={handleAddNote} style={{ background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: '18px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', border: `1px solid ${activeSubTab === 'VAULT' ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-subtle)'}`, boxShadow: '0 10px 30px rgba(0,0,0,0.25)' }}>
          
          {/* TITLE & CATEGORY ROW */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={activeSubTab === 'VAULT' ? 'Encrypted Entry Title...' : 'Note Title...'}
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ flex: 1, padding: '0.6rem 0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '10px', fontSize: '0.98rem', fontWeight: '800', outline: 'none' }}
              required
            />
            {activeSubTab === 'NOTES' ? (
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '10px', padding: '0.6rem 0.75rem', fontSize: '0.8rem', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
              >
                <option value="WORK">🏢 WORK</option>
                <option value="IDEAS">💡 IDEAS</option>
                <option value="PERSONAL">🧘 PERSONAL</option>
                <option value="ARCHITECTURE">⚙️ ARCHITECTURE</option>
              </select>
            ) : (
              <Badge variant="pink">🔒 AES-256 Vault</Badge>
            )}
          </div>

          {/* COMPLETE RICH FORMATTING TOOLBAR */}
          {renderRichToolbar(() => setShowToolsDropdown(!showToolsDropdown), showToolsDropdown)}

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
              minHeight: '150px',
              padding: '0.85rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '0 0 10px 10px',
              color: 'var(--text-heading)',
              fontSize: '0.9rem',
              outline: 'none',
              overflowY: 'auto',
              lineHeight: 1.5
            }}
          />

          {/* COLLAPSIBLE TOOLS & METADATA PANEL */}
          {showToolsDropdown && (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
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

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input type="text" placeholder="Location" value={locationTag} onChange={e => setLocationTag(e.target.value)} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', padding: '0.3rem 0.5rem', fontSize: '0.75rem', flex: 1 }} />
                <input type="text" placeholder="Tags" value={tagsInput} onChange={e => setTagsInput(e.target.value)} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', padding: '0.3rem 0.5rem', fontSize: '0.75rem', flex: 2 }} />
                <Button type="button" variant="subtle" onClick={() => setShowDriveModal(true)} style={{ fontSize: '0.72rem' }}>🔒 Attach Media</Button>
              </div>
            </div>
          )}

          {/* STATS BAR & ACTION BUTTONS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.2rem' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>
              <span>📊 {wordCount} words</span> • <span>{charCount} chars</span> • <span>⏱️ {readTime} min</span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <Button type="button" variant="subtle" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button type="submit" variant="emerald">
                {activeSubTab === 'VAULT' ? '🔒 Save Encrypted Entry' : '💾 Save Note'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {/* GOOGLE DRIVE STORAGE MODAL */}
      {showDriveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '18px', padding: '1.75rem', width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem' }}>🔒 📁</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>Connect Google Drive Vault</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Store photos & memos privately in your hidden Google Drive appDataFolder with 0 server costs.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem' }}>
              <Button variant="emerald" onClick={() => alert('Connecting Google Drive OAuth2...')}>🔗 Connect Google Drive</Button>
              <Button variant="subtle" onClick={() => setShowDriveModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 CLEAN ZEN NOTES GRID WITH 📌 PINNED TOP PRIORITY SORTING */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>Loading notes...</div>
      ) : activeSubTab === 'VAULT' && !isVaultUnlocked ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '3rem', background: 'var(--bg-surface-elevated)', border: '1px dashed rgba(239, 68, 68, 0.4)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div style={{ fontSize: '2.5rem' }}>🔒 🔑</div>
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#EF4444', margin: '0 0 0.35rem 0' }}>Private Vault Locked</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Passphrase or 24-word recovery phrase required to view encrypted entries.</p>
          </div>
          <Button variant="emerald" onClick={() => setShowUnlockModal(true)}>
            🔑 Unlock Vault Challenge
          </Button>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2.5rem', background: 'var(--bg-surface-elevated)', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
          No entries match current filter. Click <strong>{activeSubTab === 'VAULT' ? '"+ New Encrypted Entry"' : '"+ New Note"'}</strong> above!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.1rem' }}>
          {filteredNotes.map(n => {
            const moodObj = MOOD_OPTIONS.find(m => m.id === n.mood) || MOOD_OPTIONS[0];
            const isDecrypted = decryptedCache[n.id] !== undefined;
            const contentToDisplay = checkIsEncryptedNote(n) ? (isDecrypted ? decryptedCache[n.id] : null) : n.content;

            return (
              <div
                key={n.id}
                className="zen-card"
                onClick={() => handleOpenEditModal(n)}
                style={{ background: n.isPinned ? 'rgba(56, 189, 248, 0.04)' : (checkIsEncryptedNote(n) ? 'rgba(239, 68, 68, 0.03)' : 'var(--bg-surface-elevated)'), border: `1px solid ${n.isPinned ? '#38BDF8' : (checkIsEncryptedNote(n) ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-subtle)')}`, borderRadius: '16px', padding: '1.15rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.75rem' }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ fontSize: '0.7rem', background: 'rgba(236, 72, 153, 0.12)', color: '#EC4899', padding: '0.12rem 0.45rem', borderRadius: '5px', fontWeight: '800' }}>
                        #{n.category || 'WORK'}
                      </span>
                      {n.isPinned && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38BDF8', padding: '0.12rem 0.45rem', borderRadius: '5px', fontWeight: '900' }}>
                          📌 Pinned
                        </span>
                      )}
                      {checkIsEncryptedNote(n) && (
                        <span style={{ fontSize: '0.7rem', background: 'rgba(239, 68, 68, 0.12)', color: '#EF4444', padding: '0.12rem 0.45rem', borderRadius: '5px', fontWeight: '900' }}>
                          🔒 AES-256
                        </span>
                      )}
                    </div>

                    {/* ✨ HOVER-REVEALED ACTION BAR */}
                    <div className="zen-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }} onClick={e => e.stopPropagation()}>
                      <span style={{ fontSize: '0.75rem' }}>{moodObj.emoji}</span>
                      <button type="button" onClick={(e) => handleTogglePinNote(n, e)} title={n.isPinned ? "Unpin Note" : "Pin Note"} style={{ background: 'transparent', border: 'none', color: n.isPinned ? '#38BDF8' : 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>📌</button>
                      <button type="button" onClick={() => handleOpenEditModal(n)} title="Edit Note" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer' }}>✏️</button>
                      <button type="button" onClick={() => handleCopyNoteText(n)} title="Copy Text" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer' }}>📋</button>
                      <button type="button" onClick={() => handleDownloadMarkdown(n)} title="Export Markdown" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.78rem', cursor: 'pointer' }}>📥</button>
                      <button type="button" onClick={() => handleDeleteNote(n.id)} title="Delete" style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>🗑️</button>
                    </div>
                  </div>

                  <h4 style={{ fontSize: '1rem', fontWeight: '900', color: 'var(--text-heading)', margin: '0 0 0.3rem 0' }}>{n.title}</h4>
                  
                  <div
                    style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45, maxHeight: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    dangerouslySetInnerHTML={{ __html: contentToDisplay }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.55rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700' }}>📍 {n.locationTag || 'Somewhere on Earth'}</span>
                  <span style={{ fontSize: '0.7rem', color: checkIsEncryptedNote(n) ? '#EF4444' : '#10B981', fontWeight: '800' }}>
                    {checkIsEncryptedNote(n) ? '🔒 Zero-Knowledge' : 'PostgreSQL Synced'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>

      {/* SLIDING RIGHT-SIDE VAULT TOOLS & INSIGHTS DRAWER & OVERLAY */}
      <AnimatePresence>
        {showInsightsDrawer && (
          <>
            {/* Blur Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInsightsDrawer(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(4px)',
                zIndex: 9998
              }}
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '100%',
                maxWidth: '520px',
                height: '100vh',
                background: 'rgba(15, 15, 20, 0.95)',
                backdropFilter: 'blur(24px)',
                borderLeft: '1px solid var(--border-subtle)',
                boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.6)',
                zIndex: 9999,
                padding: '1.5rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                boxSizing: 'border-box'
              }}
            >
              {/* Drawer Header Controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-heading)', margin: 0 }}>
                    🔑 Vault Tools & Telemetry
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                    Zero-Knowledge backup and encryption utilities.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowInsightsDrawer(false)}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-heading)',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Drawer Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* 1. Mnemonic Recovery Management */}
                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '1.25rem', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    📜 Emergency Recovery Phrase
                  </h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    Generate or restore a BIP-39 mnemonic recovery key. Store this safely to recover your encrypted entries if you forget your passphrase.
                  </p>
                  
                  {isVaultUnlocked ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                      <Button variant="emerald" onClick={handleGenerateMnemonicSheet} style={{ fontSize: '0.8rem' }}>
                        📄 Generate 24-Word Mnemonic
                      </Button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: 'var(--accent-danger)', fontWeight: '700', textAlign: 'center', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px' }}>
                      🔒 Unlock private vault to manage emergency recovery phrase keys.
                    </div>
                  )}
                </div>

                {/* 2. Decrypted Status & Mood Statistics */}
                <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', padding: '1.25rem', borderRadius: '14px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-heading)', margin: '0 0 1rem 0' }}>
                    📊 Mood Distribution
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {MOOD_OPTIONS.map(mood => {
                      const count = notes.filter(n => n.mood === mood.id).length;
                      const pct = notes.length > 0 ? (count / notes.length) * 100 : 0;
                      return (
                        <div key={mood.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: '700' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{mood.emoji} {mood.label}</span>
                            <span style={{ color: 'var(--text-heading)' }}>{count} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--bg-surface)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${pct}%`, height: '100%', background: '#EC4899' }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
