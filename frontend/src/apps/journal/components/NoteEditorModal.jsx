import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

export const NoteEditorModal = ({
  mobileViewTab,
  setMobileViewTab,
  editingNote,
  setEditingNote,
  editTitle,
  setEditTitle,
  editCategory,
  setEditCategory,
  editMood,
  setEditMood,
  editLocationTag,
  setEditLocationTag,
  editTags,
  setEditTags,
  editEditorRef,
  showEditToolsDropdown,
  setShowEditToolsDropdown,

  showAddForm,
  setShowAddForm,
  handleAddNote,
  title,
  setTitle,
  category,
  setCategory,
  editorRef,
  showToolsDropdown,
  setShowToolsDropdown,
  selectedMood,
  setSelectedMood,
  locationTag,
  setLocationTag,
  tagsInput,
  setTagsInput,

  activeSubTab,
  pendingAttachments,
  setPendingAttachments,
  googleDriveEmail,
  setShowDriveModal,

  wordCount,
  charCount,
  readTime,
  moodOptions,

  checkIsEncryptedNote,
  handleTogglePinNote,
  handleCopyNoteText,
  handleDownloadMarkdown,

  handleFormat,
  handleInsertChecklist,
  handleColorChange,
  handleHighlight,
  handleClearHighlight,
  activeTextColor,
  activeHighlightColor,
  activeFormats,
  driveFileInputRef,
  handleUpdateNote,
  isVaultUnlocked,
  setShowUnlockModal
}) => {

  const [showActionMenu, setShowActionMenu] = useState(false);

  const renderRichToolbar = (toggleToolsAction, showToolsState) => (
    <div className="journal-editor-toolbar">
      
      {/* GROUPED FORMATTING CLUSTERS */}
      <div className="journal-editor-toolbar-items">
        
        {/* CLUSTER A: BASIC FORMATTING */}
        <div className="journal-editor-toolbar-group">
          <button type="button" onClick={() => handleFormat('bold')} className={`journal-editor-toolbar-btn ${activeFormats.bold ? 'active' : ''}`} style={{ fontWeight: '900' }} title="Bold">B</button>
          <button type="button" onClick={() => handleFormat('italic')} className={`journal-editor-toolbar-btn ${activeFormats.italic ? 'active' : ''}`} style={{ fontStyle: 'italic' }} title="Italic">I</button>
          <button type="button" onClick={() => handleFormat('underline')} className={`journal-editor-toolbar-btn ${activeFormats.underline ? 'active' : ''}`} style={{ textDecoration: 'underline' }} title="Underline">U</button>
          <button type="button" onClick={() => handleFormat('strikeThrough')} className={`journal-editor-toolbar-btn ${activeFormats.strikeThrough ? 'active' : ''}`} style={{ textDecoration: 'line-through' }} title="Strikethrough">S</button>
        </div>

        {/* CLUSTER B: HEADINGS */}
        <div className="journal-editor-toolbar-group">
          <button type="button" onClick={() => handleFormat('formatBlock', 'H1')} className="journal-editor-toolbar-btn" style={{ color: '#38BDF8', fontWeight: '900' }} title="Heading 1">H1</button>
          <button type="button" onClick={() => handleFormat('formatBlock', 'H2')} className="journal-editor-toolbar-btn" style={{ color: '#38BDF8', fontWeight: '800' }} title="Heading 2">H2</button>
        </div>

        {/* CLUSTER C: LISTS & CHECKLIST */}
        <div className="journal-editor-toolbar-group">
          <button type="button" onClick={() => handleFormat('insertUnorderedList')} className={`journal-editor-toolbar-btn ${activeFormats.insertUnorderedList ? 'active' : ''}`} title="Bullet List">• List</button>
          <button type="button" onClick={() => handleFormat('insertOrderedList')} className={`journal-editor-toolbar-btn ${activeFormats.insertOrderedList ? 'active' : ''}`} title="Numbered List">1. List</button>
          <button type="button" onClick={handleInsertChecklist} className="journal-editor-toolbar-btn" title="Task Checklist">☑️ Checklist</button>
        </div>

        {/* CLUSTER D: TEXT COLOR PALETTE */}
        <div className="journal-editor-color-picker" title="Text Color Palette">
          <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)' }}>🎨</span>
          {['#10B981', '#EC4899', '#38BDF8', '#F59E0B', '#EF4444', '#FFFFFF'].map(c => (
            <button
              key={c}
              type="button"
              onClick={() => handleColorChange(c)}
              className="journal-color-dot"
              style={{
                background: c,
                border: activeTextColor === c ? '2px solid #10B981' : '1px solid rgba(0,0,0,0.3)',
                transform: activeTextColor === c ? 'scale(1.2)' : 'scale(1)',
              }}
            />
          ))}
        </div>

        {/* CLUSTER E: HIGHLIGHTER PILLS */}
        <div className="journal-editor-color-picker" title="Highlight Text">
          <span style={{ fontSize: '0.68rem', fontWeight: '800', color: 'var(--text-muted)' }}>🖍️</span>
          {['#FEF08A', '#BBF7D0', '#FBCFE8', '#BAE6FD'].map(hColor => (
            <button
              key={hColor}
              type="button"
              onClick={() => handleHighlight(hColor)}
              className="journal-highlight-dot"
              style={{
                background: hColor,
                border: activeHighlightColor === hColor ? '2px solid #10B981' : '1px solid rgba(0,0,0,0.2)',
                boxShadow: activeHighlightColor === hColor ? '0 0 6px rgba(16,185,129,0.8)' : 'none',
                transform: activeHighlightColor === hColor ? 'scale(1.2)' : 'scale(1)',
              }}
              title={activeHighlightColor === hColor ? "Active Highlight (Click to Remove)" : "Highlight Text"}
            />
          ))}
          {activeHighlightColor && (
            <button
              type="button"
              onClick={handleClearHighlight}
              className="journal-clear-highlight-btn"
              title="Clear Highlight"
            >
              ✕ Clear
            </button>
          )}
        </div>
      </div>
      
      {/* RIGHT SIDE: TOOLS DROPDOWN */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
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

  if (editingNote) {
    return (
      <form onSubmit={handleUpdateNote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', flex: 1 }}>
        <div className="journal-editor-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setMobileViewTab('LIST')}
              className="journal-mobile-back-btn"
            >
              ⬅ Directory
            </button>
            <Badge variant={checkIsEncryptedNote(editingNote) ? "pink" : "cyan"} style={{ flexShrink: 0 }}>
              {checkIsEncryptedNote(editingNote) ? '🔒 Encrypted' : '📝 Note'}
            </Badge>
            {editingNote.isPinned && <Badge variant="indigo" style={{ flexShrink: 0 }}>📌 Pinned</Badge>}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setShowActionMenu(!showActionMenu)}
              className="journal-editor-header-action-btn"
              title="Actions"
            >
              ⋮
            </button>
            {showActionMenu && (
              <div className="journal-editor-action-menu">
                <button
                  type="button"
                  onClick={(e) => { handleTogglePinNote(editingNote, e); setShowActionMenu(false); }}
                  className="journal-editor-action-menu-item"
                >
                  {editingNote.isPinned ? '📌 Unpin Note' : '📌 Pin Note'}
                </button>
                <button
                  type="button"
                  onClick={() => { handleCopyNoteText(editingNote); setShowActionMenu(false); }}
                  className="journal-editor-action-menu-item"
                >
                  📋 Copy Content
                </button>
                <button
                  type="button"
                  onClick={() => { handleDownloadMarkdown(editingNote); setShowActionMenu(false); }}
                  className="journal-editor-action-menu-item"
                >
                  📥 Export Markdown
                </button>
                <button
                  type="button"
                  onClick={() => { setEditingNote(null); setShowActionMenu(false); }}
                  className="journal-editor-action-menu-item delete"
                >
                  ✕ Close Editor
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title & Category Row */}
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

        {/* Toolbar */}
        {renderRichToolbar(() => setShowEditToolsDropdown(!showEditToolsDropdown), showEditToolsDropdown)}

        {/* Canvas */}
        <div
          ref={editEditorRef}
          contentEditable
          suppressContentEditableWarning
          className="journal-editor-canvas"
          style={{
            flex: 1,
            minHeight: '260px',
            padding: '1.25rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            color: 'var(--text-heading)',
            fontSize: '0.94rem',
            outline: 'none',
            overflowY: 'auto',
            lineHeight: 1.6
          }}
        />

        {/* Attachments */}
        {pendingAttachments.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            {pendingAttachments.map(att => (
              <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: 'var(--text-heading)' }}>
                <span>📎 {att.name.length > 25 ? att.name.substring(0, 22) + '...' : att.name}</span>
                <button type="button" onClick={() => setPendingAttachments(prev => prev.filter(x => x.id !== att.id))} style={{ background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem' }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Collapsible Tool Panel */}
        {showEditToolsDropdown && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>Mood:</span>
              {moodOptions.map(m => (
                <button key={m.id} type="button" onClick={() => setEditMood(m.id)} style={{ background: editMood === m.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent', border: `1px solid ${editMood === m.id ? '#10B981' : 'transparent'}`, borderRadius: '6px', padding: '0.15rem 0.4rem', fontSize: '0.8rem', cursor: 'pointer' }}>{m.emoji}</button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select onChange={(e) => handleFormat('fontSize', e.target.value)} defaultValue="3" style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', padding: '0.2rem 0.45rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}>
                <option value="1">Aa Small (12px)</option>
                <option value="3">Aa Normal (15px)</option>
                <option value="4">Aa Large (18px)</option>
                <option value="6">Aa Huge (24px)</option>
              </select>
              <button type="button" onClick={() => handleFormat('formatBlock', 'PRE')} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: '#10B981', borderRadius: '6px', padding: '0.2rem 0.45rem', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer' }}>&lt;/&gt; Code Block</button>
              <Button type="button" variant="subtle" onClick={() => googleDriveEmail ? driveFileInputRef.current?.click() : setShowDriveModal(true)} style={{ fontSize: '0.72rem' }}>
                {googleDriveEmail ? '📎 Attach Media' : '🔒 Attach Media'}
              </Button>
            </div>
          </div>
        )}

        {/* Footer details & Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '240px' }}>
            <input type="text" placeholder="Location Tag" value={editLocationTag} onChange={e => setEditLocationTag(e.target.value)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', padding: '0.4rem 0.6rem', fontSize: '0.78rem', flex: 1 }} />
            <input type="text" placeholder="Tags (comma separated)" value={editTags} onChange={e => setEditTags(e.target.value)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', padding: '0.4rem 0.6rem', fontSize: '0.78rem', flex: 2 }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="submit" variant="emerald">
              {checkIsEncryptedNote(editingNote) ? '🔒 Re-Encrypt & Save' : '💾 Update Note'}
            </Button>
          </div>
        </div>
      </form>
    );
  }

  if (showAddForm) {
    return (
      <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%', flex: 1 }}>
        <div className="journal-editor-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setMobileViewTab('LIST')}
              className="journal-mobile-back-btn"
            >
              ⬅ Directory
            </button>
            <Badge variant={activeSubTab === 'VAULT' ? "pink" : "cyan"} style={{ flexShrink: 0 }}>
              {activeSubTab === 'VAULT' ? '🔒 Encrypted' : '📝 Note'}
            </Badge>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(false)}
            className="journal-editor-header-action-btn close"
            title="Close Editor"
          >
            ✕
          </button>
        </div>

        {/* Title & Category Row */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder={activeSubTab === 'VAULT' ? 'Encrypted Entry Title...' : 'Note Title...'}
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ flex: 1, padding: '0.65rem 0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '10px', fontSize: '1.05rem', fontWeight: '800', outline: 'none' }}
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
            <Badge variant="pink">🔒 AES-256 Vault</Badge>
          )}
        </div>

        {/* Toolbar */}
        {renderRichToolbar(() => setShowToolsDropdown(!showToolsDropdown), showToolsDropdown)}

        {/* Canvas */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="journal-editor-canvas"
          placeholder="Type your note content here..."
          style={{
            flex: 1,
            minHeight: '260px',
            padding: '1.25rem',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            color: 'var(--text-heading)',
            fontSize: '0.94rem',
            outline: 'none',
            overflowY: 'auto',
            lineHeight: 1.6
          }}
        />

        {/* Attachments */}
        {pendingAttachments.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            {pendingAttachments.map(att => (
              <div key={att.id} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '0.2rem 0.5rem', fontSize: '0.72rem', color: 'var(--text-heading)' }}>
                <span>📎 {att.name}</span>
                <button type="button" onClick={() => setPendingAttachments(prev => prev.filter(x => x.id !== att.id))} style={{ background: 'transparent', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer', fontWeight: '800', fontSize: '0.75rem' }}>✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Tools Panel */}
        {showToolsDropdown && (
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)' }}>Mood:</span>
              {moodOptions.map(m => (
                <button key={m.id} type="button" onClick={() => setSelectedMood(m.id)} style={{ background: selectedMood === m.id ? 'rgba(16, 185, 129, 0.15)' : 'transparent', border: `1px solid ${selectedMood === m.id ? '#10B981' : 'transparent'}`, borderRadius: '6px', padding: '0.15rem 0.45rem', fontSize: '0.8rem', cursor: 'pointer' }}>{m.emoji}</button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input type="text" placeholder="Location" value={locationTag} onChange={e => setLocationTag(e.target.value)} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', padding: '0.3rem 0.5rem', fontSize: '0.75rem', flex: 1 }} />
              <input type="text" placeholder="Tags" value={tagsInput} onChange={e => setTagsInput(e.target.value)} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', padding: '0.3rem 0.5rem', fontSize: '0.75rem', flex: 2 }} />
              <Button type="button" variant="subtle" onClick={() => googleDriveEmail ? driveFileInputRef.current?.click() : setShowDriveModal(true)} style={{ fontSize: '0.72rem' }}>
                {googleDriveEmail ? '📎 Attach Media' : '🔒 Attach Media'}
              </Button>
            </div>
          </div>
        )}

        {/* Footer details & Save */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
            <span>📊 {wordCount} words</span> • <span>{charCount} chars</span> • <span>⏱️ {readTime} min read</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button type="submit" variant="emerald">
              {activeSubTab === 'VAULT' ? '🔒 Save Encrypted Entry' : '💾 Save Note'}
            </Button>
          </div>
        </div>
      </form>
    );
  }

  // Default empty canvas preview
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', position: 'relative' }}>
      <button
        type="button"
        onClick={() => setMobileViewTab('LIST')}
        className="journal-mobile-back-btn"
        style={{ position: 'absolute', top: '1rem', left: '1rem' }}
      >
        ⬅ Directory
      </button>
      <div style={{ fontSize: '4.5rem', opacity: 0.15, transform: 'rotate(-10deg)', transition: 'transform 0.3s ease' }}>📝</div>
      <div>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '900', color: 'var(--text-heading)', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Zen Journal Canvas</h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: 0, maxWidth: '340px', lineHeight: 1.5 }}>
          Select an entry from the directory sidebar, or create a fresh note to clear your mind and log your reflections.
        </p>
      </div>
      <div style={{ display: 'flex', gap: '0.65rem', marginTop: '0.5rem' }}>
        <Button variant="emerald" onClick={() => { setEditingNote(null); setShowAddForm(true); }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '900' }}>
          ➕ Write New Entry
        </Button>
        {activeSubTab === 'VAULT' && !isVaultUnlocked && (
          <Button variant="subtle" onClick={() => setShowUnlockModal(true)}>
            🔑 Unlock Vault
          </Button>
        )}
      </div>
    </div>
  );
};
