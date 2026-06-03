import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminService } from '../services/adminService';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL;

// Bundle/game covers come back as relative paths from the API; absolutise them.
const resolveAsset = (path) => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

/* ------------------------------------------------------------------ */
/* Login gate                                                          */
/* ------------------------------------------------------------------ */
function AdminLogin({ onAuthenticated }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) {
      setError('Please paste an admin JWT.');
      return;
    }
    setLoading(true);
    setError('');
    adminService.setToken(trimmed);
    try {
      await adminService.verify();
      onAuthenticated();
    } catch (err) {
      adminService.clearToken();
      setError(
        err.status === 401 || err.status === 403
          ? 'That token is not a valid admin token.'
          : err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1 className="admin-login-title">Bundle Forge Admin</h1>
        <p className="admin-login-subtitle">
          Paste a valid admin JWT to access the dashboard.
        </p>
        <textarea
          className="admin-input admin-token-input"
          placeholder="eyJhbGciOiJIUzI1NiJ9…"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
          autoFocus
        />
        {error && <div className="admin-alert admin-alert-error">{error}</div>}
        <button type="submit" className="admin-btn admin-btn-primary" disabled={loading}>
          {loading ? 'Verifying…' : 'Authenticate'}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Accounts                                                            */
/* ------------------------------------------------------------------ */
// Mirrors Provider.Status's transition rules on the backend. The update DTO
// only accepts ACCEPTED/REJECTED/BANNED, and each current status allows only a
// subset of targets — so we only ever offer valid moves.
const STATUS_TRANSITIONS = {
  PENDING: ['ACCEPTED', 'REJECTED'],
  ACCEPTED: ['BANNED'],
  BANNED: ['ACCEPTED'],
  REJECTED: [],
};

function AccountsSection({ onError }) {
  const [category, setCategory] = useState('customer');
  const [customers, setCustomers] = useState([]);
  const [developers, setDevelopers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (category === 'customer') {
        setCustomers(await adminService.listCustomers());
      } else {
        setDevelopers(await adminService.listDevelopers());
      }
    } catch (err) {
      onError(err);
    } finally {
      setLoading(false);
    }
  }, [category, onError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (dev, status) => {
    setBusyId(dev.id);
    try {
      const updated = await adminService.changeDeveloperStatus(dev.id, status);
      setDevelopers((prev) => prev.map((d) => (d.id === dev.id ? { ...d, ...updated } : d)));
    } catch (err) {
      onError(err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2 className="admin-section-title">Accounts</h2>
          <p className="admin-section-desc">View and manage every account on the platform.</p>
        </div>
        <button className="admin-btn admin-btn-ghost" onClick={load} disabled={loading}>
          ↻ Refresh
        </button>
      </div>

      <div className="admin-segmented">
        <button
          className={category === 'customer' ? 'active' : ''}
          onClick={() => setCategory('customer')}
        >
          Customers
        </button>
        <button
          className={category === 'developer' ? 'active' : ''}
          onClick={() => setCategory('developer')}
        >
          Developers
        </button>
      </div>

      {loading ? (
        <div className="admin-empty">Loading…</div>
      ) : category === 'customer' ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{[c.firstName, c.lastName].filter(Boolean).join(' ') || '—'}</td>
                  <td>{c.email}</td>
                  <td>{c.phoneNumber || '—'}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={4} className="admin-empty">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Display name</th>
                <th>Email</th>
                <th>Website</th>
                <th>Status</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {developers.map((d) => (
                <tr key={d.id}>
                  <td>{d.id}</td>
                  <td>{d.displayName || '—'}</td>
                  <td>{d.email}</td>
                  <td>
                    {d.website ? (
                      <a href={d.website} target="_blank" rel="noreferrer" className="admin-link">
                        {d.website}
                      </a>
                    ) : '—'}
                  </td>
                  <td>
                    <span className={`admin-badge admin-badge-${(d.status || '').toLowerCase()}`}>
                      {d.status || 'UNKNOWN'}
                    </span>
                  </td>
                  <td>
                    {(STATUS_TRANSITIONS[d.status] || []).length === 0 ? (
                      <span className="admin-muted-text">—</span>
                    ) : (
                      <select
                        className="admin-input admin-select-sm"
                        value=""
                        disabled={busyId === d.id}
                        onChange={(e) => e.target.value && handleStatusChange(d, e.target.value)}
                      >
                        <option value="">Change to…</option>
                        {STATUS_TRANSITIONS[d.status].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {developers.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-empty">No developers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Charity founders                                                    */
/* ------------------------------------------------------------------ */
const EMPTY_CHARITY = { name: '', website: '', shortDescription: '', longDescription: '' };

function CharitySection({ onError }) {
  const [charities, setCharities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {id,...} = edit
  const [form, setForm] = useState(EMPTY_CHARITY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setCharities(await adminService.listCharities());
    } catch (err) {
      onError(err);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setForm(EMPTY_CHARITY);
    setEditing({});
  };

  const openEdit = (charity) => {
    setForm({
      name: charity.name || '',
      website: charity.website || '',
      shortDescription: charity.shortDescription || '',
      longDescription: charity.longDescription || '',
    });
    setEditing(charity);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing.id) {
        await adminService.updateCharity(editing.id, form);
      } else {
        await adminService.createCharity(form);
      }
      setEditing(null);
      await load();
    } catch (err) {
      onError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (charity) => {
    if (!window.confirm(`Delete charity "${charity.name}"?`)) return;
    try {
      await adminService.deleteCharity(charity.id);
      setCharities((prev) => prev.filter((c) => c.id !== charity.id));
    } catch (err) {
      onError(err);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2 className="admin-section-title">Charity Founders</h2>
          <p className="admin-section-desc">Create and edit the charities that bundles can support.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>+ New charity</button>
      </div>

      {loading ? (
        <div className="admin-empty">Loading…</div>
      ) : (
        <div className="admin-cards">
          {charities.map((c) => (
            <div key={c.id} className="admin-card">
              <div className="admin-card-body">
                <h3 className="admin-card-title">{c.name}</h3>
                {c.website && (
                  <a href={c.website} target="_blank" rel="noreferrer" className="admin-link admin-card-url">
                    {c.website}
                  </a>
                )}
                <p className="admin-card-desc">{c.shortDescription}</p>
              </div>
              <div className="admin-card-actions">
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(c)}>Edit</button>
                <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(c)}>Delete</button>
              </div>
            </div>
          ))}
          {charities.length === 0 && <div className="admin-empty">No charity founders yet.</div>}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? 'Edit charity founder' : 'New charity founder'} onClose={() => setEditing(null)}>
          <form onSubmit={handleSave} className="admin-form">
            <label className="admin-field">
              <span>Name *</span>
              <input className="admin-input" value={form.name} onChange={set('name')} required />
            </label>
            <label className="admin-field">
              <span>Website</span>
              <input className="admin-input" value={form.website} onChange={set('website')} placeholder="https://…" />
            </label>
            <label className="admin-field">
              <span>Short description * <small>(max 250)</small></span>
              <textarea className="admin-input" value={form.shortDescription} onChange={set('shortDescription')} maxLength={250} rows={2} required />
            </label>
            <label className="admin-field">
              <span>Long description *</span>
              <textarea className="admin-input" value={form.longDescription} onChange={set('longDescription')} rows={5} required />
            </label>
            <div className="admin-form-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editing.id ? 'Save changes' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Bundles                                                             */
/* ------------------------------------------------------------------ */
const EMPTY_BUNDLE = {
  title: '',
  shortDescription: '',
  longDescription: '',
  platformMinPct: 30,
  devMinPct: 70,
  daysLeft: 14,
  charityFounderId: '',
  gameIds: [],
  tiers: [{ numRequiredGames: 1, pricePerGame: 1.0 }],
};

function BundleSection({ onError }) {
  const [bundles, setBundles] = useState([]);
  const [charities, setCharities] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_BUNDLE);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [gameSort, setGameSort] = useState('selected');
  const [saving, setSaving] = useState(false);

  // Show a live preview: a freshly picked file (via object URL, revoked on
  // change) when present, otherwise the bundle's existing cover when editing.
  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile);
      setCoverPreview(url);
      return () => URL.revokeObjectURL(url);
    }
    setCoverPreview(editing?.id ? resolveAsset(editing.cover) : null);
  }, [coverFile, editing]);

  // Ordered view of the games for the picker.
  const sortedGames = useMemo(() => {
    const list = [...games];
    if (gameSort === 'az') {
      list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    } else if (gameSort === 'za') {
      list.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
    } else {
      // selected first, then alphabetical
      list.sort((a, b) => {
        const sa = form.gameIds.includes(a.id);
        const sb = form.gameIds.includes(b.id);
        if (sa !== sb) return sa ? -1 : 1;
        return (a.title || '').localeCompare(b.title || '');
      });
    }
    return list;
  }, [games, gameSort, form.gameIds]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [b, c, g] = await Promise.all([
        adminService.listBundles(),
        adminService.listCharities(),
        adminService.listGames(),
      ]);
      setBundles(b);
      setCharities(c);
      setGames(g);
    } catch (err) {
      onError(err);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setForm(EMPTY_BUNDLE);
    setCoverFile(null);
    setEditing({});
  };

  const openEdit = async (bundle) => {
    try {
      const full = await adminService.getBundle(bundle.id);
      setForm({
        title: full.title || '',
        shortDescription: full.shortDescription || '',
        longDescription: full.longDescription || '',
        platformMinPct: full.platformMinPct ?? 30,
        devMinPct: full.devMinPct ?? 70,
        daysLeft: full.daysLeft ?? 14,
        charityFounderId: full.charity?.id ?? '',
        gameIds: (full.games || []).map((gm) => gm.id),
        tiers: (full.tiers || []).length
          ? full.tiers.map((t) => ({ numRequiredGames: t.numRequiredGames, pricePerGame: t.pricePerGame }))
          : [{ numRequiredGames: 1, pricePerGame: 1.0 }],
      });
      setCoverFile(null);
      setEditing(full);
    } catch (err) {
      onError(err);
    }
  };

  const handleDelete = async (bundle) => {
    if (!window.confirm(`Delete bundle "${bundle.title}"?`)) return;
    try {
      await adminService.deleteBundle(bundle.id);
      setBundles((prev) => prev.filter((b) => b.id !== bundle.id));
    } catch (err) {
      onError(err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing.id && !coverFile) {
      onError(new Error('A cover image is required when creating a bundle.'));
      return;
    }
    if (form.gameIds.length === 0) {
      onError(new Error('Select at least one game for the bundle.'));
      return;
    }
    setSaving(true);
    try {
      const dto = {
        title: form.title,
        shortDescription: form.shortDescription,
        longDescription: form.longDescription,
        platformMinPct: Number(form.platformMinPct),
        devMinPct: Number(form.devMinPct),
        daysLeft: Number(form.daysLeft),
        charityFounderId: form.charityFounderId ? Number(form.charityFounderId) : null,
        gameIds: form.gameIds,
        tiers: form.tiers.map((t) => ({
          numRequiredGames: Number(t.numRequiredGames),
          pricePerGame: Number(t.pricePerGame),
        })),
      };
      if (editing.id) {
        await adminService.updateBundle(editing.id, dto, coverFile);
      } else {
        await adminService.createBundle(dto, coverFile);
      }
      setEditing(null);
      await load();
    } catch (err) {
      onError(err);
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleGame = (id) =>
    setForm((f) => ({
      ...f,
      gameIds: f.gameIds.includes(id) ? f.gameIds.filter((g) => g !== id) : [...f.gameIds, id],
    }));

  const updateTier = (idx, key, value) =>
    setForm((f) => ({
      ...f,
      tiers: f.tiers.map((t, i) => (i === idx ? { ...t, [key]: value } : t)),
    }));

  const addTier = () =>
    setForm((f) => ({ ...f, tiers: [...f.tiers, { numRequiredGames: 1, pricePerGame: 1.0 }] }));

  const removeTier = (idx) =>
    setForm((f) => ({ ...f, tiers: f.tiers.filter((_, i) => i !== idx) }));

  return (
    <section>
      <div className="admin-section-head">
        <div>
          <h2 className="admin-section-title">Bundles</h2>
          <p className="admin-section-desc">Assemble bundles from existing games, set tiers and charity splits.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openNew}>+ New bundle</button>
      </div>

      {loading ? (
        <div className="admin-empty">Loading…</div>
      ) : (
        <div className="admin-cards">
          {bundles.map((b) => (
            <div key={b.id} className="admin-card">
              {resolveAsset(b.cover) && (
                <img className="admin-card-cover" src={resolveAsset(b.cover)} alt={b.title} />
              )}
              <div className="admin-card-body">
                <h3 className="admin-card-title">{b.title}</h3>
                <p className="admin-card-desc">{b.shortDescription}</p>
                <div className="admin-card-meta">
                  <span>{(b.games || []).length} games</span>
                  <span>{(b.tiers || []).length} tiers</span>
                  {b.daysLeft != null && <span>{b.daysLeft}d left</span>}
                </div>
              </div>
              <div className="admin-card-actions">
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEdit(b)}>Edit</button>
                <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(b)}>Delete</button>
              </div>
            </div>
          ))}
          {bundles.length === 0 && <div className="admin-empty">No bundles yet.</div>}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? 'Edit bundle' : 'New bundle'} onClose={() => setEditing(null)} wide>
          <form onSubmit={handleSave} className="admin-form">
            <label className="admin-field">
              <span>Title *</span>
              <input className="admin-input" value={form.title} onChange={set('title')} required />
            </label>
            <label className="admin-field">
              <span>Short description *</span>
              <textarea className="admin-input" value={form.shortDescription} onChange={set('shortDescription')} maxLength={1000} rows={2} required />
            </label>
            <label className="admin-field">
              <span>Long description *</span>
              <textarea className="admin-input" value={form.longDescription} onChange={set('longDescription')} rows={4} required />
            </label>

            <div className="admin-grid-3">
              <label className="admin-field">
                <span>Platform min %</span>
                <input type="number" min={0} max={100} className="admin-input" value={form.platformMinPct} onChange={set('platformMinPct')} />
              </label>
              <label className="admin-field">
                <span>Dev min %</span>
                <input type="number" min={0} max={100} className="admin-input" value={form.devMinPct} onChange={set('devMinPct')} />
              </label>
              <label className="admin-field">
                <span>Days left</span>
                <input type="number" min={1} className="admin-input" value={form.daysLeft} onChange={set('daysLeft')} />
              </label>
            </div>

            <label className="admin-field">
              <span>Charity founder <small>(optional)</small></span>
              <select className="admin-input" value={form.charityFounderId} onChange={set('charityFounderId')}>
                <option value="">— No charity —</option>
                {charities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>

            <div className="admin-field">
              <span>Cover image {editing.id ? '(leave empty to keep current)' : '*'}</span>
              <div className="admin-cover-stage">
                {coverPreview ? (
                  <img className="admin-cover-preview" src={coverPreview} alt="Cover preview" />
                ) : (
                  <div className="admin-cover-preview admin-cover-empty">No cover selected</div>
                )}
                <label className="admin-btn admin-btn-ghost admin-btn-sm admin-cover-browse">
                  Browse…
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  />
                </label>
                {coverFile && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-ghost admin-btn-sm admin-cover-clear"
                    onClick={() => setCoverFile(null)}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="admin-field">
              <div className="admin-tier-head">
                <span>Games * <small>({form.gameIds.length} selected)</small></span>
                <select className="admin-input admin-select-sm" value={gameSort} onChange={(e) => setGameSort(e.target.value)}>
                  <option value="selected">Selected first</option>
                  <option value="az">Title A–Z</option>
                  <option value="za">Title Z–A</option>
                </select>
              </div>
              <div className="admin-picker">
                {sortedGames.map((g) => (
                  <label key={g.id} className={`admin-picker-item ${form.gameIds.includes(g.id) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      checked={form.gameIds.includes(g.id)}
                      onChange={() => toggleGame(g.id)}
                    />
                    {resolveAsset(g.cover) && <img src={resolveAsset(g.cover)} alt="" />}
                    <span>{g.title}</span>
                  </label>
                ))}
                {games.length === 0 && <div className="admin-empty">No games available.</div>}
              </div>
            </div>

            <div className="admin-field">
              <div className="admin-tier-head">
                <span>Tiers *</span>
                <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={addTier}>+ Add tier</button>
              </div>
              {form.tiers.map((t, i) => (
                <div key={i} className="admin-tier-row">
                  <label>
                    <small>Required games</small>
                    <input type="number" min={1} className="admin-input" value={t.numRequiredGames}
                      onChange={(e) => updateTier(i, 'numRequiredGames', e.target.value)} />
                  </label>
                  <label>
                    <small>Price / game</small>
                    <input type="number" min={0} step="0.01" className="admin-input" value={t.pricePerGame}
                      onChange={(e) => updateTier(i, 'pricePerGame', e.target.value)} />
                  </label>
                  {form.tiers.length > 1 && (
                    <button type="button" className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => removeTier(i)}>✕</button>
                  )}
                </div>
              ))}
            </div>

            <div className="admin-form-actions">
              <button type="button" className="admin-btn admin-btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
              <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editing.id ? 'Save changes' : 'Create bundle'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Shared modal                                                        */
/* ------------------------------------------------------------------ */
function Modal({ title, children, onClose, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="admin-modal-overlay" onMouseDown={onClose}>
      <div className={`admin-modal ${wide ? 'admin-modal-wide' : ''}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="admin-modal-head">
          <h3>{title}</h3>
          <button className="admin-modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard shell                                                     */
/* ------------------------------------------------------------------ */
// `slug` is the URL segment under /admin; `id` keys the rendered section.
const TABS = [
  { id: 'accounts', slug: 'accounts', label: 'Accounts' },
  { id: 'charities', slug: 'charity', label: 'Charity Founders' },
  { id: 'bundles', slug: 'bundles', label: 'Bundles' },
];

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState(null);

  // Any 401/403 from the API means the admin token went stale → kick to login.
  const handleError = useCallback((err) => {
    if (err.status === 401 || err.status === 403) {
      onLogout();
      return;
    }
    setToast(err.message);
    setTimeout(() => setToast(null), 5000);
  }, [onLogout]);

  const segment = location.pathname.replace(/^\/admin\/?/, '').split('/')[0];
  const active = TABS.find((t) => t.slug === segment);

  // Bare /admin (or an unknown sub-path) lands on the Accounts tab.
  useEffect(() => {
    if (!active) navigate('/admin/accounts', { replace: true });
  }, [active, navigate]);

  if (!active) return null;

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">Bundle Forge<span>Admin</span></div>
        <nav className="admin-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`admin-nav-item ${active.id === t.id ? 'active' : ''}`}
              onClick={() => navigate(`/admin/${t.slug}`)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <button className="admin-btn admin-btn-ghost admin-logout" onClick={onLogout}>Sign out</button>
      </aside>

      <main className="admin-main">
        {active.id === 'accounts' && <AccountsSection onError={handleError} />}
        {active.id === 'charities' && <CharitySection onError={handleError} />}
        {active.id === 'bundles' && <BundleSection onError={handleError} />}
      </main>

      {toast && <div className="admin-toast">{toast}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */
export function Admin() {
  const [authed, setAuthed] = useState(adminService.isAuthenticated());

  const handleLogout = () => {
    adminService.clearToken();
    setAuthed(false);
  };

  return authed
    ? <AdminDashboard onLogout={handleLogout} />
    : <AdminLogin onAuthenticated={() => setAuthed(true)} />;
}
