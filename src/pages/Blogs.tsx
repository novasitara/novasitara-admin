import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, attempt } from '../lib/api';
import { Button } from '../components/Button';
import { Plus, Pencil, Trash2, Newspaper } from 'lucide-react';

interface Post { id: string; slug: string; title_en: string; is_published: boolean; published_at: string | null; created_at: string; }

export const Blogs: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api<Post[]>('/admin/blogs')
      .then(setPosts)
      .catch(e => setError(`Could not load blog posts: ${e.message}`))
      .finally(() => setLoading(false));
  }, []);

  const remove = async (id: string) => {
    if (!confirm('Delete this blog post? This cannot be undone.')) return;
    setError('');
    const err = await attempt(() => api(`/admin/blogs/${id}`, { method: 'DELETE' }));
    if (err) { setError(`Could not delete: ${err}`); return; }
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <div className="eyebrow">Website</div>
          <h1 className="page-title">Blogs</h1>
        </div>
        <Link to="/blogs/new"><Button variant="primary" leftIcon={<Plus size={15} />}>New Post</Button></Link>
      </div>
      {error && <div className="error-alert" style={{ marginBottom: '1rem' }}>{error}</div>}
      <div className="card">
        {loading ? <div className="empty-state">Loading...</div> : posts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Newspaper size={24} /></div>
            <div className="empty-state-title">No blog posts yet</div>
            <div className="empty-state-text">Until you publish a post, the website shows its original articles.</div>
            <Link to="/blogs/new"><Button variant="primary" leftIcon={<Plus size={15} />}>New Post</Button></Link>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead><tr><th>Title</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id}>
                    <td><div className="table-title">{p.title_en}</div><div className="table-subtitle">/{p.slug}</div></td>
                    <td><span className={`badge ${p.is_published ? 'badge-active' : 'badge-inactive'}`}>{p.is_published ? 'Published' : 'Draft'}</span></td>
                    <td>{new Date(p.published_at ?? p.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className="action-row">
                        <Link to={`/blogs/${p.id}/edit`}><button className="action-btn-icon"><Pencil size={12} /> Edit</button></Link>
                        <button onClick={() => remove(p.id)} className="action-btn-icon action-btn-delete"><Trash2 size={12} /> Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
