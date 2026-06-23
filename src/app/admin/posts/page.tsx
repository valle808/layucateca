'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';




// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────
interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  imageUrl: string | null;
  state: string;
  category: string;
  published: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  language: string;
  readTimeMinutes: number;
}

// ──────────────────────────────────────────────────────────────────────────────
// Main Component
// ──────────────────────────────────────────────────────────────────────────────
export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PUBLISHED' | 'DRAFT'>('ALL');
  const [filterLanguage, setFilterLanguage] = useState<'ALL' | 'es' | 'en' | 'yua'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'title'>('newest');
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // ── Fetch posts ──────────────────────────────────────────────────────────────
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/posts');
      if (res.ok) {
        const data = await res.json();
        // Sort by default
        const sorted = sortPosts(data, sortBy);
        setPosts(sorted);
      }
    } catch (err) {
      notify('Failed to load posts', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // ── Notifications ────────────────────────────────────────────────────────────
  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ── Sort posts ───────────────────────────────────────────────────────────────
  const sortPosts = (items: Post[], sortType: string): Post[] => {
    const sorted = [...items];
    switch (sortType) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'views':
        return sorted.sort((a, b) => b.views - a.views);
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  };

  // ── Delete post ──────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/posts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        notify('🗑️ Post deleted');
        fetchPosts();
      } else {
        notify('Failed to delete post', 'error');
      }
    } catch (err) {
      notify('Error deleting post', 'error');
    }
  };

  // ── Toggle publish ───────────────────────────────────────────────────────────
  const handleTogglePublish = async (post: Post) => {
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !post.published }),
      });
      if (res.ok) {
        notify(post.published ? '🔒 Post unpublished' : '✅ Post published');
        fetchPosts();
      }
    } catch (err) {
      notify('Error updating post', 'error');
    }
  };

  // ── Filtered and sorted posts ────────────────────────────────────────────────
  const filtered = posts
    .filter((post) => {
      const matchSearch = !search || post.title.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || (filterStatus === 'PUBLISHED' && post.published) || (filterStatus === 'DRAFT' && !post.published);
      const matchLanguage = filterLanguage === 'ALL' || post.language === filterLanguage;
      return matchSearch && matchStatus && matchLanguage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'views':
          return b.views - a.views;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const stats = [
    { label: 'Total Posts', value: posts.length, icon: '📰', color: '#3b82f6' },
    { label: 'Published', value: posts.filter((p) => p.published).length, icon: '📤', color: '#25d366' },
    { label: 'Drafts', value: posts.filter((p) => !p.published).length, icon: '✏️', color: '#f59e0b' },
    { label: 'Total Views', value: posts.reduce((sum, p) => sum + p.views, 0), icon: '👁️', color: '#8b5cf6' },
  ];

  const getLangBadge = (lang: string) => {
    const badges: Record<string, { text: string; bg: string; color: string }> = {
      es: { text: '🇲🇽 Spanish', bg: 'rgba(59,130,246,0.1)', color: '#60a5fa' },
      en: { text: '🇺🇸 English', bg: 'rgba(34,197,94,0.1)', color: '#86efac' },
      yua: { text: '🏛️ Mayan', bg: 'rgba(212,168,83,0.1)', color: '#fcd34d' },
    };
    return badges[lang] || { text: lang, bg: 'var(--bg-tertiary)', color: 'var(--text-secondary)' };
  };

  return (
    <div style={{ padding: '40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <p className='section-label'>Content</p>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Posts & Articles</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6 }}>{posts.length} article{posts.length !== 1 ? 's' : ''} total • Trilingual autonomous newsroom</p>
        </div>
        <Link href='/admin/posts/new' className='btn-primary' style={{ whiteSpace: 'nowrap' }}>
          + New Post
        </Link>
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
                <p style={{ fontWeight: 600, fontSize: '0.85rem', marginTop: 6 }}>{stat.label}</p>
              </div>
              <span style={{ fontSize: '1.5rem', opacity: 0.6 }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        {/* Search row */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='🔍 Search by title…'
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
        </div>

        {/* Filter row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Status filter */}
          <div style={{ display: 'flex', gap: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Status:
            </label>
            {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: `1px solid ${filterStatus === status ? '#3b82f6' : 'var(--border-subtle)'}`,
                  background: filterStatus === status ? '#3b82f620' : 'transparent',
                  color: filterStatus === status ? '#60a5fa' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {status === 'ALL' ? 'All' : status === 'PUBLISHED' ? '📤 Published' : '✏️ Draft'}
              </button>
            ))}
          </div>

          {/* Language filter */}
          <div style={{ display: 'flex', gap: 4 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Language:
            </label>
            {(['ALL', 'es', 'en', 'yua'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setFilterLanguage(lang as any)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: `1px solid ${filterLanguage === lang ? '#d4a853' : 'var(--border-subtle)'}`,
                  background: filterLanguage === lang ? '#d4a85320' : 'transparent',
                  color: filterLanguage === lang ? '#fcd34d' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {lang === 'ALL' ? 'All' : lang === 'es' ? '🇲🇽' : lang === 'en' ? '🇺🇸' : '🏛️'}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Sort:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '8px 12px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <option value='newest'>Newest First</option>
              <option value='oldest'>Oldest First</option>
              <option value='views'>Most Viewed</option>
              <option value='title'>Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className='card' style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading posts…</div>
        ) : posts.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: 12 }}>📰</p>
            <p>No posts yet. Create your first article!</p>
            <Link href='/admin/posts/new' className='btn-primary' style={{ marginTop: 16, display: 'inline-flex' }}>
              Create Post →
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Title', 'Status', 'Lang', 'Category', 'Views', 'Date', 'Actions'].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: '12px 20px',
                        textAlign: 'left',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((post) => {
                  const langBadge = getLangBadge(post.language);
                  return (
                    <tr
                      key={post.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '14px 20px', fontWeight: 600, maxWidth: 250 }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.title}</div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4, fontFamily: 'monospace' }}>/{post.slug}</p>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button
                          onClick={() => handleTogglePublish(post)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            border: 'none',
                            background: post.published ? 'rgba(37,211,102,0.1)' : 'rgba(245,158,11,0.1)',
                            color: post.published ? '#86efac' : '#fcd34d',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            const target = e.currentTarget as HTMLButtonElement;
                            target.style.opacity = '0.8';
                          }}
                          onMouseLeave={(e) => {
                            const target = e.currentTarget as HTMLButtonElement;
                            target.style.opacity = '1';
                          }}
                        >
                          {post.published ? '📤 Live' : '✏️ Draft'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: 6,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            background: langBadge.bg,
                            color: langBadge.color,
                          }}
                        >
                          {langBadge.text}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{post.category}</td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        👁️ {post.views}
                      </td>
                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            style={{
                              padding: '6px 12px',
                              background: 'transparent',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 6,
                              color: 'var(--text-secondary)',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              textDecoration: 'none',
                              display: 'inline-block',
                              transition: 'all 0.2s',
                            }}
                          >
                            Edit
                          </Link>
                          {post.published && (
                            <a
                              href={`/news/${post.slug}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              style={{
                                padding: '6px 12px',
                                background: 'transparent',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 6,
                                color: 'var(--text-secondary)',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                textDecoration: 'none',
                                display: 'inline-block',
                                transition: 'all 0.2s',
                              }}
                            >
                              View ↗
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(post.id)}
                            style={{
                              padding: '6px 12px',
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
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
                No posts match your filters.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 24, padding: '16px 20px', background: 'var(--bg-secondary)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        Showing {filtered.length} of {posts.length} posts • {filtered.reduce((sum, p) => sum + p.views, 0)} total views
      </div>
    </div>
  );
}
