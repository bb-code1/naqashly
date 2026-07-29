import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { client } from '../../api/client';
import { encryptAES256, decryptAES256, generate24WordMnemonic, mnemonicToPassphrase } from '../../utils/cryptoUtils';
import { ENV } from '../../config/env';
import { NoteCard } from './components/NoteCard';
import { NoteEditorModal } from './components/NoteEditorModal';
import { VaultAccessModal } from './components/VaultAccessModal';
import { JournalInsightsDrawer } from './components/JournalInsightsDrawer';
import './JournalModule.css';
import { Button } from '../../components/ui/Button';

const MOOD_OPTIONS = [
  { id: 'INSPIRED', label: 'Inspired', emoji: '🌟' },
  { id: 'PEACEFUL', label: 'Peaceful', emoji: '😌' },
  { id: 'NEUTRAL', label: 'Neutral', emoji: '😐' },
  { id: 'EXHAUSTED', label: 'Exhausted', emoji: '😓' },
  { id: 'ENERGETIC', label: 'Energetic', emoji: '🔥' }
];

/**
 * 📝 Executive Mind OS - Decluttered Zen Workspace
 * Refactored & Modularized structure.
 * 
 * @author Barkat Bashir
 * @version 16.0.0
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
  const [mobileViewTab, setMobileViewTab] = useState('LIST'); // 'LIST' or 'EDITOR'
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

  // ✏️ Note Reader & Edit Modal State
  const [editingNote, setEditingNote] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('WORK');
  const [editMood, setEditMood] = useState('INSPIRED');
  const [editLocationTag, setEditLocationTag] = useState('');
  const [editTags, setEditTags] = useState('');
  
  const editorRef = useRef(null);
  const editEditorRef = useRef(null);
  const driveFileInputRef = useRef(null);
  const tokenClientRef = useRef(null);

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

  const [googleDriveEmail, setGoogleDriveEmail] = useState(() => localStorage.getItem('google_drive_connected_email') || null);
  const [pendingAttachments, setPendingAttachments] = useState([]);

  // Active Format State Tracking
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    insertUnorderedList: false,
    insertOrderedList: false
  });

  const getRenderableHtml = (rawHtml) => {
    if (!rawHtml) return '';
    return rawHtml.replace(/src="https:\/\/drive\.google\.com\/open\?id=[^"]+"/g, 'src=""');
  };

  const getCachedAsset = (driveId) => {
    return new Promise((resolve) => {
      const request = indexedDB.open('naqashly_cache_db', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('local_assets')) {
          db.createObjectStore('local_assets');
        }
      };
      request.onsuccess = (e) => {
        const db = e.target.result;
        try {
          const transaction = db.transaction('local_assets', 'readonly');
          const store = transaction.objectStore('local_assets');
          const getReq = store.get(driveId);
          getReq.onsuccess = () => resolve(getReq.result || null);
          getReq.onerror = () => resolve(null);
        } catch (err) {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  };

  const saveCachedAsset = (driveId, blob) => {
    return new Promise((resolve) => {
      const request = indexedDB.open('naqashly_cache_db', 1);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('local_assets')) {
          db.createObjectStore('local_assets');
        }
      };
      request.onsuccess = (e) => {
        const db = e.target.result;
        try {
          const transaction = db.transaction('local_assets', 'readwrite');
          const store = transaction.objectStore('local_assets');
          store.put(blob, driveId);
          transaction.oncomplete = () => resolve(true);
          transaction.onerror = () => resolve(false);
        } catch (err) {
          resolve(false);
        }
      };
      request.onerror = () => resolve(false);
    });
  };

  const clearCacheDB = () => {
    return new Promise((resolve) => {
      const request = indexedDB.open('naqashly_cache_db', 1);
      request.onsuccess = (e) => {
        const db = e.target.result;
        try {
          const transaction = db.transaction('local_assets', 'readwrite');
          const store = transaction.objectStore('local_assets');
          store.clear();
          transaction.oncomplete = () => resolve(true);
        } catch (err) {
          resolve(false);
        }
      };
      request.onerror = () => resolve(false);
    });
  };

  const compressImage = (file, maxWidth = 1600, quality = 0.8) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = (maxWidth / width) * height;
              width = maxWidth;
            } else {
              width = (maxWidth / height) * width;
              height = maxWidth;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }));
            } else {
              resolve(file);
            }
          }, 'image/jpeg', quality);
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  async function loadLazyMedia(container, silent = false) {
    const driveId = container.getAttribute('data-drive-id');
    const fileName = container.getAttribute('data-file-name') || 'File';
    const fileType = container.getAttribute('data-file-type') || '';
    if (!driveId) return;

    const btn = container.querySelector('.lazy-media-btn');
    if (btn) {
      btn.textContent = 'Loading...';
      btn.disabled = true;
    }

    try {
      const cachedBlob = await getCachedAsset(driveId);
      if (cachedBlob) {
        const localUrl = URL.createObjectURL(cachedBlob);
        if (fileType.startsWith('image/')) {
          container.outerHTML = `<div style="margin: 0.75rem 0;"><img src="${localUrl}" alt="${fileName}" style="max-width: 250px; max-height: 250px; border-radius: 8px; border: 1px solid var(--border-subtle); display: block;" /></div>`;
        } else {
          container.outerHTML = `<p style="margin: 0.5rem 0;"><a href="${localUrl}" target="_blank" download="${fileName}" style="color: #10B981; font-weight: 700; font-size: 0.8rem; text-decoration: underline;">📎 Download: ${fileName}</a></p>`;
        }
        return;
      }
    } catch (err) {
      console.warn('Cache lookup error:', err);
    }

    const accessToken = localStorage.getItem('google_drive_access_token');
    if (!accessToken) {
      if (!silent) alert('Please connect Google Drive to load this attachment.');
      if (btn) {
        btn.textContent = 'Failed';
        btn.disabled = false;
      }
      return;
    }

    const fetchWithAuth = async (token) => {
      return fetch(`https://www.googleapis.com/drive/v3/files/${driveId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    };

    try {
      let res = await fetchWithAuth(accessToken);
      if (res.status === 401) {
        try {
          const newToken = await silentRefreshGoogleToken();
          res = await fetchWithAuth(newToken);
        } catch (refreshErr) {
          console.warn('Silent token refresh failed:', refreshErr);
          localStorage.removeItem('google_drive_access_token');
          setGoogleDriveEmail(null);
          if (!silent) {
            alert('🔑 Your Google Drive session has expired. Please reconnect to load attachments.');
            setShowDriveModal(true);
          }
          if (btn) {
            btn.textContent = 'Retry';
            btn.disabled = false;
          }
          return;
        }
      }

      if (res.ok) {
        const blob = await res.blob();
        await saveCachedAsset(driveId, blob);
        const localUrl = URL.createObjectURL(blob);

        if (fileType.startsWith('image/')) {
          container.outerHTML = `<div style="margin: 0.75rem 0;"><img src="${localUrl}" alt="${fileName}" style="max-width: 250px; max-height: 250px; border-radius: 8px; border: 1px solid var(--border-subtle); display: block;" /></div>`;
        } else {
          container.outerHTML = `<p style="margin: 0.5rem 0;"><a href="${localUrl}" target="_blank" download="${fileName}" style="color: #10B981; font-weight: 700; font-size: 0.8rem; text-decoration: underline;">📎 Download: ${fileName}</a></p>`;
        }
      } else {
        if (!silent) alert('Failed to load attachment from Google Drive.');
        if (btn) {
          btn.textContent = 'Retry';
          btn.disabled = false;
        }
      }
    } catch (err) {
      console.error('Error fetching on-demand attachment:', err);
      if (!silent) alert('Connection error loading attachment.');
      if (btn) {
        btn.textContent = 'Retry';
        btn.disabled = false;
      }
    }
  }

  useEffect(() => {
    const handleLazyLoadClick = async (e) => {
      const container = e.target.closest('.lazy-media-container');
      if (!container) return;

      e.stopPropagation();
      e.preventDefault();
      await loadLazyMedia(container, false);
    };

    document.addEventListener('click', handleLazyLoadClick);
    return () => {
      document.removeEventListener('click', handleLazyLoadClick);
    };
  }, []);

  const initTokenClient = () => {
    if (window.google?.accounts?.oauth2) {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: ENV.GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file',
        callback: (tokenResponse) => {
          if (tokenResponse.access_token) {
            localStorage.setItem('google_drive_access_token', tokenResponse.access_token);
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
            })
            .then(res => res.json())
            .then(data => {
              if (data.email) {
                localStorage.setItem('google_drive_connected_email', data.email);
                setGoogleDriveEmail(data.email);
                alert(`Vault connected to Google Drive: ${data.email}`);
              } else {
                alert('Vault connected to Google Drive successfully!');
              }
              setShowDriveModal(false);
            })
            .catch(err => {
              console.error('Error fetching Google userinfo:', err);
              alert('Vault connected to Google Drive successfully!');
              setShowDriveModal(false);
            });
          }
        }
      });
      tokenClientRef.current = client;
    }
  };

  useEffect(() => {
    initTokenClient();
  }, []);

  const silentRefreshGoogleToken = () => {
    return new Promise((resolve, reject) => {
      if (!tokenClientRef.current) {
        initTokenClient();
      }
      if (!tokenClientRef.current) {
        reject(new Error('Google identity client not initialized'));
        return;
      }
      const originalCallback = tokenClientRef.current.callback;
      tokenClientRef.current.callback = (res) => {
        tokenClientRef.current.callback = originalCallback;
        if (res.access_token) {
          localStorage.setItem('google_drive_access_token', res.access_token);
          resolve(res.access_token);
        } else {
          reject(new Error('Silent token refresh failed'));
        }
      };
      tokenClientRef.current.requestAccessToken({ prompt: 'none' });
    });
  };

  const handleConnectGoogleDrive = () => {
    if (!tokenClientRef.current) {
      initTokenClient();
    }
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken();
    } else {
      alert('Google identity services script is still loading. Please try again in a moment.');
    }
  };

  const handleUploadBackupToGoogleDrive = async () => {
    const accessToken = localStorage.getItem('google_drive_access_token');
    if (!accessToken) {
      alert('Please connect your Google Drive vault first.');
      return;
    }

    const encryptedNotesList = notes.filter(n => checkIsEncryptedNote(n));
    const backupContent = JSON.stringify(encryptedNotesList, null, 2);

    const fileMetadata = {
      name: 'naqashly_private_diary_backup.json',
      parents: ['appDataFolder']
    };

    const fileContent = new Blob([backupContent], { type: 'application/json' });

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', fileContent);

    try {
      const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: form
      });
      if (res.ok) {
        alert('Encrypted backup successfully pushed to your hidden Google Drive appDataFolder!');
      } else {
        const errData = await res.json();
        console.error('Drive backup error:', errData);
        alert('Failed to upload backup to Google Drive. Try reconnecting your vault.');
      }
    } catch (err) {
      console.error('Backup exception:', err);
      alert('Failed to connect to Google Drive APIs.');
    }
  };

  const handleDriveFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    let finalFile = file;
    if (file.type.startsWith('image/')) {
      finalFile = await compressImage(file);
    }

    const newAttachment = {
      id: Date.now() + Math.random().toString(36).substr(2, 5),
      file: finalFile,
      name: finalFile.name,
      type: finalFile.type
    };

    setPendingAttachments(prev => [...prev, newAttachment]);
    e.target.value = null; // reset file input
  };

  const uploadPendingAttachmentsAndGetHtml = async () => {
    let accessToken = localStorage.getItem('google_drive_access_token');
    if (!accessToken && pendingAttachments.length > 0) {
      alert('Please connect Google Drive to upload your attachments.');
      throw new Error('Google Drive not connected');
    }

    const uploadWithAuth = async (token, form) => {
      return fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
    };

    let attachmentHtml = '';
    for (const att of pendingAttachments) {
      const fileMetadata = {
        name: att.name,
        parents: ['appDataFolder']
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', att.file);

      let res = await uploadWithAuth(accessToken, form);
      if (res.status === 401) {
        try {
          accessToken = await silentRefreshGoogleToken();
          res = await uploadWithAuth(accessToken, form);
        } catch (refreshErr) {
          console.warn('Silent token refresh failed:', refreshErr);
          localStorage.removeItem('google_drive_access_token');
          setGoogleDriveEmail(null);
          alert('🔑 Your Google Drive session has expired. Please reconnect to upload your attachments.');
          setShowDriveModal(true);
          throw new Error('Google Drive session expired');
        }
      }

      if (!res.ok) {
        throw new Error(`Failed to upload attachment ${att.name}`);
      }

      const fileData = await res.json();
      await saveCachedAsset(fileData.id, att.file);
      
      if (att.type.startsWith('image/')) {
        attachmentHtml += `<div class="lazy-media-container" data-drive-id="${fileData.id}" data-file-name="${att.name}" data-file-type="${att.type}" style="margin: 0.75rem 0; padding: 0.5rem 0.75rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; display: inline-flex; align-items: center; gap: 0.6rem; font-size: 0.76rem; color: var(--text-muted); cursor: pointer;"><span class="lazy-media-icon">🖼️</span><span class="lazy-media-name">${att.name}</span><button class="lazy-media-btn" type="button" style="background: var(--accent-indigo); border: none; color: #fff; border-radius: 4px; padding: 0.15rem 0.45rem; cursor: pointer; font-size: 0.68rem; font-weight: 800;">Load Image</button></div>`;
      } else {
        attachmentHtml += `<div class="lazy-media-container" data-drive-id="${fileData.id}" data-file-name="${att.name}" data-file-type="${att.type}" style="margin: 0.5rem 0; padding: 0.5rem 0.75rem; background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); border-radius: 8px; display: inline-flex; align-items: center; gap: 0.6rem; font-size: 0.76rem; color: var(--text-muted); cursor: pointer;"><span class="lazy-media-icon">📎</span><span class="lazy-media-name">${att.name}</span><button class="lazy-media-btn" type="button" style="background: var(--accent-indigo); border: none; color: #fff; border-radius: 4px; padding: 0.15rem 0.45rem; cursor: pointer; font-size: 0.68rem; font-weight: 800;">Load File</button></div>`;
      }
    }

    return attachmentHtml;
  };

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

    const currentRef = editingNote ? editEditorRef.current : editorRef.current;
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
    const currentRef = editingNote ? editEditorRef.current : editorRef.current;
    if (currentRef) currentRef.focus();
  };

  const handleColorChange = (colorHex) => {
    document.execCommand('foreColor', false, colorHex);
    setActiveTextColor(colorHex);
    updateActiveFormats();
    const currentRef = editingNote ? editEditorRef.current : editorRef.current;
    if (currentRef) currentRef.focus();
  };

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
    const currentRef = editingNote ? editEditorRef.current : editorRef.current;
    if (currentRef) currentRef.focus();
  };

  const handleClearHighlight = () => {
    document.execCommand('hiliteColor', false, 'transparent');
    document.execCommand('backColor', false, 'transparent');
    setActiveHighlightColor(null);
    updateActiveFormats();
    const currentRef = editingNote ? editEditorRef.current : editorRef.current;
    if (currentRef) currentRef.focus();
  };

  const handleInsertChecklist = () => {
    const checklistHtml = '<div><input type="checkbox" style="margin-right: 6px; cursor: pointer;" /> <span>New Task Item...</span></div>';
    document.execCommand('insertHTML', false, checklistHtml);
    updateActiveFormats();
  };

  const handleTogglePinNote = (note, e) => {
    if (e) e.stopPropagation();
    const updatedNote = { ...note, isPinned: !note.isPinned };
    client.put(`/journal/notes/${note.id}`, updatedNote)
      .then(() => setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n)))
      .catch(() => setNotes(prev => prev.map(n => n.id === note.id ? updatedNote : n)));
  };

  const handleSwitchSubTab = (tab) => {
    if (tab === 'VAULT' && !isVaultUnlocked) {
      setActiveSubTab('VAULT');
      setShowUnlockModal(true);
    } else {
      setActiveSubTab(tab);
    }
  };

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

  const handleLockVault = () => {
    setIsVaultUnlocked(false);
    setMasterVaultPassphrase('');
    setRecoveryWordsInput('');
    setDecryptedCache({});
    clearCacheDB();
    setActiveSubTab('NOTES');
  };

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
    setShowAddForm(false);
    setMobileViewTab('EDITOR');

    setTimeout(() => {
      if (editEditorRef.current) {
        editEditorRef.current.innerHTML = getRenderableHtml(decryptedText) || '';
        updateActiveFormats();
        
        const containers = editEditorRef.current.querySelectorAll('.lazy-media-container');
        for (const container of containers) {
          loadLazyMedia(container, true);
        }
      }
    }, 100);
  };

  const handleUpdateNote = async (e) => {
    e.preventDefault();
    if (!editingNote || !editTitle.trim()) return;

    let updatedHtml = editEditorRef.current ? editEditorRef.current.innerHTML : '';
    const isEncryptedNote = checkIsEncryptedNote(editingNote);

    if (pendingAttachments.length > 0) {
      try {
        const attachmentHtml = await uploadPendingAttachmentsAndGetHtml();
        updatedHtml += `<div class="note-attachments" style="margin-top: 1rem; border-top: 1px dashed var(--border-subtle); padding-top: 0.5rem;">${attachmentHtml}</div>`;
      } catch (err) {
        console.error(err);
        return;
      }
    }

    if (isEncryptedNote) {
      if (!masterVaultPassphrase.trim()) {
        alert('Please unlock your Private Vault with a Passphrase before saving encrypted changes.');
        return;
      }
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

    client.put(`/journal/notes/${editingNote.id}`)
      .then(res => {
        const savedNote = res.data || updatedNoteObj;
        setNotes(prev => prev.map(n => n.id === editingNote.id ? savedNote : n));
        setPendingAttachments([]);
        setEditingNote(null);
      })
      .catch(err => {
        console.warn('[JournalModule] Fallback local note update:', err);
        setNotes(prev => prev.map(n => n.id === editingNote.id ? updatedNoteObj : n));
        setPendingAttachments([]);
        setEditingNote(null);
      });
  };

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

    if (pendingAttachments.length > 0) {
      try {
        const attachmentHtml = await uploadPendingAttachmentsAndGetHtml();
        htmlContent += `<div class="note-attachments" style="margin-top: 1rem; border-top: 1px dashed var(--border-subtle); padding-top: 0.5rem;">${attachmentHtml}</div>`;
      } catch (err) {
        console.error(err);
        return;
      }
    }

    const plaintext = htmlContent;
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
      if (isEncryptedNote) {
        setDecryptedCache(prev => ({ ...prev, [createdNote.id]: plaintext }));
      }
      setNotes(prev => [createdNote, ...prev]);
      setTitle('');
      setPendingAttachments([]);
      if (editorRef.current) editorRef.current.innerHTML = '';
      setShowAddForm(false);
    }).catch(err => {
      console.warn('[JournalModule] Fallback local note save:', err);
      const createdNote = { id: Date.now(), ...newNoteObj };
      if (isEncryptedNote) {
        setDecryptedCache(prev => ({ ...prev, [createdNote.id]: plaintext }));
      }
      setNotes(prev => [createdNote, ...prev]);
      setTitle('');
      setPendingAttachments([]);
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

  return (
    <>
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
        .directory-list-container::-webkit-scrollbar {
          width: 6px;
        }
        .directory-list-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .directory-list-container::-webkit-scrollbar-thumb {
          background: var(--border-subtle);
          border-radius: 3px;
        }
        .directory-list-container::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }
      `}</style>

      {/* 🌟 DOUBLE-COLUMN ZEN WORKSPACE */}
      <div className="journal-container">
        
        {/* LEFT PANEL: NOTES DIRECTORY & CONTROLS */}
        <div className={`journal-sidebar ${mobileViewTab === 'LIST' ? 'show-mobile' : 'hide-mobile'}`}>
          
          {/* Header Actions */}
          <div className="journal-sidebar-header">
            <div>
              <h2 className="journal-sidebar-title">📝 Journal Directory</h2>
              <span className="journal-sidebar-notes-count">
                {notes.length} entries total {isVaultUnlocked && '• 🔓 Unlocked'}
              </span>
            </div>
            <div className="journal-sidebar-actions">
              {isVaultUnlocked && (
                <button
                  type="button"
                  onClick={handleLockVault}
                  className="journal-sidebar-action-lock"
                  title="Lock Private Vault"
                >
                  🔒 Lock
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowDriveModal(true)}
                className={`journal-sidebar-action-sync ${googleDriveEmail ? 'connected' : ''}`}
                title="Google Drive Sync status"
              >
                {googleDriveEmail ? '🟢 Connected' : '⚫ Sync'}
              </button>

              <button
                type="button"
                onClick={() => { setEditingNote(null); setShowAddForm(true); setMobileViewTab('EDITOR'); }}
                className="journal-sidebar-action-add"
                title="New Note"
              >
                ➕ Note
              </button>

              <button
                type="button"
                onClick={() => setShowInsightsDrawer(true)}
                className="journal-insights-trigger-btn"
                title="Settings & Insights"
              >
                ⚙️
              </button>
            </div>
          </div>

          {/* Sub-tab Switcher */}
          <div className="journal-subtab-bar">
            {[
              { key: 'NOTES', label: '🌐 Notes', color: '#10B981' },
              { key: 'VAULT', label: '🔒 Vault', color: '#EF4444' }
            ].map(tab => {
              const isActive = activeSubTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => handleSwitchSubTab(tab.key)}
                  className={`journal-subtab-btn ${isActive ? 'active' : ''}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <input
            type="text"
            placeholder="🔍 Search entries..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="journal-search-input"
          />

          {/* Category Filter Horizontal Scroll */}
          <div className="journal-tags-scroller">
            {['ALL', 'WORK', 'IDEAS', 'PERSONAL', 'ARCHITECTURE'].map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategoryFilter(cat)}
                className={`journal-tag-badge ${activeCategoryFilter === cat ? 'active' : ''}`}
              >
                {cat === 'ALL' ? '🌐 All' : `#${cat}`}
              </button>
            ))}
          </div>

          {/* Vault Status/Controls Inside Sidebar */}
          {activeSubTab === 'VAULT' && (
            <div className={`journal-vault-status-bar ${isVaultUnlocked ? 'unlocked' : 'locked'}`}>
              <span className={`journal-vault-status-label ${isVaultUnlocked ? 'unlocked' : 'locked'}`}>
                {isVaultUnlocked ? '🔓 Vault Active' : '🔒 Vault Locked'}
              </span>
              {isVaultUnlocked && (
                <button type="button" onClick={handleLockVault} className="journal-vault-lock-btn">
                  Lock Session
                </button>
              )}
            </div>
          )}

          {/* Scrollable Note List Directory */}
          <div className="journal-directory-list">
            {loading ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1.5rem' }}>Loading notes...</div>
            ) : activeSubTab === 'VAULT' && !isVaultUnlocked ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface)', borderRadius: '14px', border: '1px dashed var(--border-subtle)' }}>
                <span style={{ fontSize: '1.75rem' }}>🔒</span>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-heading)' }}>Vault Locked</span>
                <Button variant="emerald" onClick={() => setShowUnlockModal(true)} style={{ padding: '0.35rem 0.75rem', fontSize: '0.72rem' }}>
                  Unlock Vault
                </Button>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', textAlign: 'center', padding: '1.5rem', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border-subtle)' }}>
                No notes found.
              </div>
            ) : (
              filteredNotes.map(n => (
                <NoteCard
                  key={n.id}
                  note={n}
                  isSelected={editingNote?.id === n.id}
                  handleOpenEditModal={handleOpenEditModal}
                  checkIsEncryptedNote={checkIsEncryptedNote}
                  moodOptions={MOOD_OPTIONS}
                />
              ))
            )}
          </div>

        </div>

        {/* RIGHT PANEL: LIVE ZEN WORKSPACE CANVAS */}
        <div className={`journal-editor-container ${mobileViewTab === 'EDITOR' ? 'show-mobile' : 'hide-mobile'}`}>
          <NoteEditorModal
            mobileViewTab={mobileViewTab}
            setMobileViewTab={setMobileViewTab}
            editingNote={editingNote}
            setEditingNote={setEditingNote}
            editTitle={editTitle}
            setEditTitle={setEditTitle}
            editCategory={editCategory}
            setEditCategory={setEditCategory}
            editMood={editMood}
            setEditMood={setEditMood}
            editLocationTag={editLocationTag}
            setEditLocationTag={setEditLocationTag}
            editTags={editTags}
            setEditTags={setEditTags}
            editEditorRef={editEditorRef}
            showEditToolsDropdown={showEditToolsDropdown}
            setShowEditToolsDropdown={setShowEditToolsDropdown}

            showAddForm={showAddForm}
            setShowAddForm={setShowAddForm}
            handleAddNote={handleAddNote}
            title={title}
            setTitle={setTitle}
            category={category}
            setCategory={setCategory}
            editorRef={editorRef}
            showToolsDropdown={showToolsDropdown}
            setShowToolsDropdown={setShowToolsDropdown}
            selectedMood={selectedMood}
            setSelectedMood={setSelectedMood}
            locationTag={locationTag}
            setLocationTag={setLocationTag}
            tagsInput={tagsInput}
            setTagsInput={setTagsInput}

            activeSubTab={activeSubTab}
            pendingAttachments={pendingAttachments}
            setPendingAttachments={setPendingAttachments}
            googleDriveEmail={googleDriveEmail}
            setShowDriveModal={setShowDriveModal}

            wordCount={wordCount}
            charCount={charCount}
            readTime={readTime}
            moodOptions={MOOD_OPTIONS}

            checkIsEncryptedNote={checkIsEncryptedNote}
            handleTogglePinNote={handleTogglePinNote}
            handleCopyNoteText={handleCopyNoteText}
            handleDownloadMarkdown={handleDownloadMarkdown}

            handleFormat={handleFormat}
            handleInsertChecklist={handleInsertChecklist}
            handleColorChange={handleColorChange}
            handleHighlight={handleHighlight}
            handleClearHighlight={handleClearHighlight}
            activeTextColor={activeTextColor}
            activeHighlightColor={activeHighlightColor}
            activeFormats={activeFormats}
            driveFileInputRef={driveFileInputRef}
            handleUpdateNote={handleUpdateNote}
            isVaultUnlocked={isVaultUnlocked}
            setShowUnlockModal={setShowUnlockModal}
          />
        </div>
      </div>

      {/* GOOGLE DRIVE STORAGE MODAL */}
      {showDriveModal && (
        <div className="vault-modal-overlay">
          <div className="vault-modal-content success-border">
            <div style={{ fontSize: '2.5rem' }}>🔒 📁</div>
            <h3 className="vault-modal-title">Connect Google Drive Vault</h3>
            <p className="vault-modal-desc">Store photos & memos privately in your hidden Google Drive appDataFolder with 0 server costs.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem' }}>
              <Button variant="emerald" onClick={handleConnectGoogleDrive}>🔗 Connect Google Drive</Button>
              <Button variant="subtle" onClick={() => setShowDriveModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* PASSPHRASE & MNEMONIC SHEET MODALS */}
      <VaultAccessModal
        showUnlockModal={showUnlockModal}
        setShowUnlockModal={setShowUnlockModal}
        recoveryMode={recoveryMode}
        setRecoveryMode={setRecoveryMode}
        masterVaultPassphrase={masterVaultPassphrase}
        setMasterVaultPassphrase={setMasterVaultPassphrase}
        recoveryWordsInput={recoveryWordsInput}
        setRecoveryWordsInput={setRecoveryWordsInput}
        handleUnlockMasterVault={handleUnlockMasterVault}
        showMnemonicSheet={showMnemonicSheet}
        setShowMnemonicSheet={setShowMnemonicSheet}
        generatedMnemonic={generatedMnemonic}
        handleCopyMnemonic={handleCopyMnemonic}
        handleDownloadMnemonicSheet={handleDownloadMnemonicSheet}
        setActiveSubTab={setActiveSubTab}
      />

      {/* INSIGHTS DRAWER */}
      <JournalInsightsDrawer
        showInsightsDrawer={showInsightsDrawer}
        setShowInsightsDrawer={setShowInsightsDrawer}
        isVaultUnlocked={isVaultUnlocked}
        handleGenerateMnemonicSheet={handleGenerateMnemonicSheet}
        googleDriveEmail={googleDriveEmail}
        handleUploadBackupToGoogleDrive={handleUploadBackupToGoogleDrive}
        handleConnectGoogleDrive={handleConnectGoogleDrive}
        notes={notes}
        moodOptions={MOOD_OPTIONS}
        setGoogleDriveEmail={setGoogleDriveEmail}
      />

      <input 
        type="file" 
        ref={driveFileInputRef} 
        onChange={handleDriveFileChange} 
        style={{ display: 'none' }} 
      />
    </>
  );
};
