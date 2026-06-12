'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  imageUrl: string | null;
  liveUrl: string | null;
  price: number | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioFormData {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  liveUrl: string;
  price: string;
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────
export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<PortfolioItem | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const [form, setForm] = useState<PortfolioFormData>({
    title: '',
    slug: '',
    description: '',
    imageUrl: '',
    liveUrl: '',
    price: '',
  });

  // ── Fetch items ──────────────────────────────────────────────────────────────
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/portfolio');
      if (res.ok) {
        setItems(await res.json());
      }
    } catch (err) {
      notify('Failed to load portfolio items', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // ── Notifications ────────────────────────────────────────────────────────────
  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Form handlers ────────────────────────────────────────────────────────────
  const resetForm = () => {
    setForm({ title: '', slug: '', description: '', imageUrl: '', liveUrl: '', price: '' });
    setEditing(null);
    setShowForm(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const startEdit = (item: PortfolioItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      slug: item.slug,
      description: item.description,
      imageUrl: item.imageUrl || '',
      liveUrl: item.liveUrl || '',
      price: item.price?.toString() || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description) {
      notify('Title and description are required', 'error');
      return;
    }

    const slug = form.slug || generateSlug(form.title);
    const method = editing ? 'PUT' : 'POST';
    const body = editing
      ? {
          ...form,
          slug,
          price: form.price ? parseFloat(form.price) : null,
          id: editing.id,
        }
      : {
          ...form,
          slug,
          price: form.price ? parseFloat(form.price) : null,
        };

    try {
      const res = await fetch('/api/admin/portfolio', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        notify(editing ? '✅ Item updated' : '✅ Item created');
        resetForm();
        fetchItems();
      } else {
        const error = await res.json();
        notify(error.error || 'Failed to save item', 'error');
      }
    } catch (err) {
      notify('Error saving item', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this portfolio item? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/portfolio?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify('🗑️ Item deleted');
        fetchItems();
      } else {
        notify('Failed to delete item', 'error');
      }
    } catch (err) {
      notify('Error deleting item', 'error');
    }
  };

  const handleTogglePublish = async (item: PortfolioItem) => {
    try {
      const res = await fetch('/api/admin/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          id: item.id,
          published: !item.published,
        }),
      });
      if (res.ok) {
        notify(item.published ? '🔒 Item unpublished' : '✅ Item published');
        fetchItems();
      }
    } catch (err) {
      notify('Error updating publish status', 'error');
    }
  };

  // ── Filtered items ───────────────────────────────────────────────────────────
  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'ALL' || (filterStatus === 'PUBLISHED' && item.published) || (filterStatus === 'DRAFT' && !item.published);
    return matchSearch && matchStatus;
  });

  const stats = [
    { label: 'Total Items', value: items.length, icon: '🎨', color: '#d4a853' },
    { label: 'Published', value: items.filter((i) => i.published).length, icon: '📤', color: '#25d366' },
    { label: 'Drafts', value: items.filter((i) => !i.published).length, icon: '✏️', color: '#f59e0b' },
    { label: 'With Pricing', value: items.filter((i) => i.price).length, icon: '💰', color: '#8b5cf6' },
  ];

  return (
    <div style={{ padding: '40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p className='section-label'>Content</p>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Portfolio</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '6px' }}>{items.length} items total • Manage your IT services & projects</p>
      </div>

      {/* Notification toast */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            padding: '14px 20px',
            borderRadius: 12,
            background: notification.type === 'success' ? '#0f5132' : '#5c1515',
            border: `1px solid ${notification.type === 'success' ? '#22c55e33' : '#ef444433'}`,
            color: notification.type === 'success' ? '#86efac' : '#fca5a5',
            fontWeight: 600,
            fontSize: '0.9rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          {notification.msg}
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {stats.map((stat) => (
          <div key={stat.label} className='card' style={{ padding: '20px 24px', borderLeft: `3px solid ${stat.color}` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1, color: stat.color }}>{stat.value}</p>
                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: '6px' }}>{stat.label}</p>
              </div>
              <span style={{ fontSize: '1.5rem', opacity: 0.6 }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='🔍 Search portfolio items…'
          style={{
            flex: 1,
            minWidth: 200,
            padding: '10px 16px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
          }}
        />

        <div style={{ display: 'flex', gap: 4 }}>
          {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '9px 14px',
                borderRadius: 8,
                border: `1px solid ${filterStatus === status ? '#d4a853' : 'var(--border-subtle)'}`,
                background: filterStatus === status ? '#d4a85320' : 'transparent',
                color: filterStatus === status ? '#d4a853' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {status === 'ALL' ? 'All' : status === 'PUBLISHED' ? '📤 Published' : '✏️ Drafts'}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          style={{
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #d4a853, #b8892a)',
            border: 'none',
            borderRadius: 8,
            color: '#0a0a0f',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          + New Item
        </button>
      </div>

      {/* Portfolio Form */}
      {showForm && (
        <div className='card' style={{ padding: 32, marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>{editing ? '✏️ Edit Item' : '➕ New Portfolio Item'}</h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.85rem' }}>Title *</label>
              <input
                value={form.title}
                onChange={(e) => {
                  setForm({ ...form, title: e.target.value });
                  if (!editing) setForm((f) => ({ ...f, slug: generateSlug(e.target.value) }));
                }}
                placeholder='e.g., E-Commerce Website'
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.85rem' }}>Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder='e-commerce-website'
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'monospace',
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.85rem' }}>Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder='Describe your project or service in detail…'
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: '12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.85rem' }}>Image URL</label>
              <input
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder='https://example.com/image.jpg'
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.85rem' }}>Live URL</label>
              <input
                value={form.liveUrl}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                placeholder='https://example.com'
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: 6, fontSize: '0.85rem' }}>Price (Optional)</label>
              <input
                type='number'
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder='0.00'
                step='0.01'
                min='0'
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
          </div>

          {form.imageUrl && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Preview</p>
              <div style={{ width: 200, height: 120, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <img src={form.imageUrl} alt='preview' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={handleSave}
              style={{
                padding: '10px 24px',
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                border: 'none',
                borderRadius: 8,
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {editing ? '💾 Update' : '✅ Create'}
            </button>
            <button
              onClick={resetForm}
              style={{
                padding: '10px 24px',
                background: 'transparent',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                color: 'var(--text-secondary)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Items Grid */}
      {loading ? (
        <div className='card' style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading portfolio items…
        </div>
      ) : items.length === 0 ? (
        <div className='card' style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎨</p>
          <p>No portfolio items yet. Create your first project showcase!</p>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            style={{
              marginTop: 16,
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #d4a853, #b8892a)',
              border: 'none',
              borderRadius: 8,
              color: '#0a0a0f',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            + Create Item
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {filtered.map((item) => (
            <div key={item.id} className='card' style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {item.imageUrl && (
                <div style={{ width: '100%', height: 180, overflow: 'hidden', borderBottom: '1px solid var(--border-subtle)' }}>
                  <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}

              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, marginBottom: 4 }}>{item.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>/{item.slug}</p>
                  </div>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: item.published ? 'rgba(37,211,102,0.1)' : 'rgba(245,158,11,0.1)',
                      color: item.published ? '#86efac' : '#fcd34d',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.published ? '📤 LIVE' : '✏️ DRAFT'}
                  </span>
                </div>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16, flex: 1 }}>
                  {item.description.substring(0, 80)}…
                </p>

                {item.price && <p style={{ fontWeight: 700, color: '#d4a853', marginBottom: 12 }}>💰 ${item.price.toFixed(2)}</p>}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => startEdit(item)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'transparent',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      color: 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    ✏️ Edit
                  </button>
                  {item.liveUrl && (
                    <a
                      href={item.liveUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 6,
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        textDecoration: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        display: 'block',
                        textAlign: 'center',
                      }}
                    >
                      🔗 View
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: 6,
                      color: '#fca5a5',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
