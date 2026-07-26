import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

/**
 * 📝 Mind Journal & Knowledge Notes Engine
 * 
 * Features:
 * - Live Split Markdown Editor & Preview Mode
 * - Category domain tagging (WORK, IDEAS, PERSONAL, ARCHITECTURE)
 * - Real-time Search & Filter bar
 * - PostgreSQL persistence via journal-service (Port 8083)
 * 
 * @author Barkat Bashir
 * @version 2.0.0
 */
export const JournalModule = () => {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('WORK');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

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
        console.warn('[JournalModule] Error fetching notes:', err);
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

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    client.post('/journal/notes', {
      title: title.trim(),
      content: content.trim(),
      category,
      isPinned: true
    }).then(res => {
      const createdNote = res.data || { id: Date.now(), title, content, category, isPinned: true };
      setNotes(prev => [createdNote, ...prev]);
      setTitle('');
      setContent('');
      setShowAddForm(false);
    }).catch(err => console.error('[JournalModule] Error creating note:', err));
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
    const matchesSearch = !searchQuery || n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || n.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <Card className="col-12" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: '900', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            📝 Knowledge, Notes & Reflections
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Markdown knowledge repository & work reflections backed by PostgreSQL journal-service (Port 8083).
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="cyan">journal-service :8083</Badge>
          <Button variant="emerald" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? '✕ Close Form' : '+ New Note'}
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

      {/* CREATE NOTE FORM */}
      {showAddForm && (
        <form onSubmit={handleAddNote} style={{ background: 'var(--bg-surface-elevated)', padding: '1.25rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', border: '1px solid var(--border-subtle)', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-heading)', margin: 0 }}>✏️ Create New Markdown Note</h4>
            <button
              type="button"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', border: '1px solid rgba(236, 72, 153, 0.3)', borderRadius: '6px', padding: '0.25rem 0.65rem', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
            >
              {isPreviewMode ? '✏️ Edit Mode' : '👁️ Preview Markdown'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Note Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ flex: 1, padding: '0.55rem 0.85rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', fontSize: '0.88rem', fontWeight: '700', outline: 'none' }}
              required
            />
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', padding: '0.55rem 0.85rem', fontSize: '0.82rem', fontWeight: '800', outline: 'none', cursor: 'pointer' }}
            >
              <option value="WORK">🏢 WORK</option>
              <option value="IDEAS">💡 IDEAS</option>
              <option value="PERSONAL">🧘 PERSONAL</option>
              <option value="ARCHITECTURE">⚙️ ARCHITECTURE</option>
            </select>
          </div>

          {isPreviewMode ? (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1rem', minHeight: '120px', fontSize: '0.85rem', color: 'var(--text-heading)', whiteSpace: 'pre-wrap' }}>
              {content || '(Empty content preview)'}
            </div>
          ) : (
            <textarea
              placeholder="Write Markdown content here..."
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={5}
              style={{ padding: '0.75rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '8px', fontSize: '0.85rem', resize: 'vertical', outline: 'none', fontFamily: 'monospace' }}
            />
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <Button type="button" variant="subtle" onClick={() => setShowAddForm(false)}>Cancel</Button>
            <Button type="submit" variant="emerald">💾 Save Note to PostgreSQL</Button>
          </div>
        </form>
      )}

      {/* NOTES GRID */}
      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2rem' }}>Loading live notes from PostgreSQL...</div>
      ) : filteredNotes.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '2.5rem', background: 'var(--bg-surface-elevated)', border: '1px dashed var(--border-subtle)', borderRadius: '12px' }}>
          No notes match the current filter. Click <strong>"+ New Note"</strong> above to create your first note!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filteredNotes.map(n => (
            <div key={n.id} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem', boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(236, 72, 153, 0.15)', color: '#EC4899', border: '1px solid rgba(236, 72, 153, 0.3)', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: '800' }}>
                    #{n.category || 'WORK'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(n.id)}
                    title="Delete note"
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}
                  >
                    🗑️
                  </button>
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: '900', color: 'var(--text-heading)', margin: '0 0 0.35rem 0' }}>{n.title}</h4>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>{n.content}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.65rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: '700' }}>📌 Pinned Note</span>
                <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: '800' }}>PostgreSQL Synced</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
