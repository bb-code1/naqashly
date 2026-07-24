import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { client } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const JournalModule = () => {
  const { isAuthenticated } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('WORK');

  const fetchNotes = () => {
    if (!isAuthenticated) {
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    client.get('/journal/notes')
      .then(res => {
        setNotes(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('[JournalModule] Error fetching live notes:', err);
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
    if (!title) return;

    client.post('/journal/notes', {
      title,
      content,
      category,
      isPinned: true
    }).then(() => {
      setTitle('');
      setContent('');
      setShowAddForm(false);
      fetchNotes();
    }).catch(err => console.error('[JournalModule] Error creating note:', err));
  };

  return (
    <Card className="col-12" style={{ marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          📝 Knowledge, Notes & Reflections
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="cyan">journal-service :8086</Badge>
          <Button variant="secondary" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Close' : '+ New Note'}
          </Button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddNote} style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.55rem', border: '1px solid var(--border-subtle)' }}>
          <input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px' }}
            required
          />
          <textarea
            placeholder="Note Content (Markdown supported)..."
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={3}
            style={{ padding: '0.5rem', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-heading)', borderRadius: '6px', resize: 'vertical' }}
          />
          <Button type="submit" style={{ alignSelf: 'flex-start' }}>Save Note to PostgreSQL</Button>
        </form>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading live notes from PostgreSQL...</div>
      ) : notes.length === 0 ? (
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No notes found in database. Click "+ New Note" above to save your first note!</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {notes.map(n => (
            <div key={n.id} style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-heading)' }}>{n.title}</h4>
                {n.isPinned && <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>📌 Pinned</span>}
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{n.content}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
