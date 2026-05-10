import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SteamIcon from '../assets/icons/steam.svg?react';
import WindowsIcon from '../assets/icons/windows.svg?react';
import AppleIcon from '../assets/icons/apple.svg?react';
import LinuxIcon from '../assets/icons/linux.svg?react';
import './SearchPage.css';

const API_URL = import.meta.env.VITE_API_URL;

/* ── Icons ── */
const SlidersIcon = () => (
  <svg viewBox="0 0 512 512" fill="currentColor" width="14" height="14">
    <path d="M0 416c0 17.7 14.3 32 32 32l54.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 448c17.7 0 32-14.3 32-32s-14.3-32-32-32l-246.7 0c-12.3-28.3-40.5-48-73.3-48s-61 19.7-73.3 48L32 384c-17.7 0-32 14.3-32 32zm128 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zM320 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0zm32-80c-32.8 0-61 19.7-73.3 48L32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l246.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48l54.7 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-54.7 0c-12.3-28.3-40.5-48-73.3-48zM192 128a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm73.3-64C253 35.7 224.8 16 192 16s-61 19.7-73.3 48L32 64C14.3 64 0 78.3 0 96s14.3 32 32 32l86.7 0c12.3 28.3 40.5 48 73.3 48s61-19.7 73.3-48L480 128c17.7 0 32-14.3 32-32s-14.3-32-32-32L265.3 64z"/>
  </svg>
);
const GripIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" width="14" height="14">
    <path d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48zm32-192l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM448 328c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40l48 0c22.1 0 40-17.9 40-40l0-48z"/>
  </svg>
);
const SortIcon = () => (
  <svg viewBox="0 0 576 512" fill="currentColor" width="14" height="14">
    <path d="M151.6 469.6C145.5 476.2 137 480 128 480s-17.5-3.8-23.6-10.4l-88-96c-11.9-13-11.1-33.3 2-45.2s33.3-11.1 45.2 2L96 365.7 96 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 301.7 32.4-35.4c11.9-13 32.2-13.9 45.2-2s13.9 32.2 2 45.2l-88 96zM320 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-32 0zm0-128c-17.7 0-32-14.3-32-32s14.3-32 32-32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0zm0-128c-17.7 0-32-14.3-32-32s14.3-32 32-32l160 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-160 0zm0-128c-17.7 0-32-14.3-32-32s14.3-32 32-32l224 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L320 96z"/>
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" width="10" height="10">
    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/>
  </svg>
);
const MinusIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" width="10" height="10">
    <path d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"/>
  </svg>
);
const ChevronLeftIcon = () => (
  <svg viewBox="0 0 320 512" fill="currentColor" width="10" height="10">
    <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/>
  </svg>
);
const ChevronRightIcon = () => (
  <svg viewBox="0 0 320 512" fill="currentColor" width="10" height="10">
    <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/>
  </svg>
);

const LABEL_CONFIG = {
  recommended: { cls: 'sp-label--recommended', text: 'Recommended for you' },
  launched:    { cls: 'sp-label--launched',     text: 'Just Launched' },
  earlyaccess: { cls: 'sp-label--earlyaccess',  text: 'Available May 26' },
  library:     { cls: 'sp-label--library',      text: '📖 In Library' },
};

/* ── Collapsible filter section ── */
const FilterSection = ({ section, openSections, toggle, activeFilters, onToggleFilter }) => {
  const isOpen = openSections.has(section.id);
  const [search, setSearch] = useState('');
  const items = section.searchable
    ? section.items.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : section.items;

  return (
    <div className="sp-filter-section">
      <button className="sp-filter-section-header" onClick={() => toggle(section.id)}>
        <span className="sp-filter-section-title">{section.label}</span>
        <span className="sp-filter-section-icon">{isOpen ? <MinusIcon /> : <PlusIcon />}</span>
      </button>

      {isOpen && (
        <div className="sp-filter-section-body">
          {section.searchable && (
            <input
              className="sp-filter-search"
              placeholder={`Search ${section.label}`}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          )}
          <ul className="sp-filter-list">
            {items.map(item => {
              const key = `${section.id}:${item.label}`;
              const checked = activeFilters.has(key);
              return (
                <li key={item.label} className="sp-filter-item">
                  <label className="sp-filter-label">
                    <input
                      type="checkbox"
                      className="sp-filter-checkbox"
                      checked={checked}
                      onChange={() => onToggleFilter(key)}
                    />
                    <span className="sp-filter-checkbox-custom" />
                    <span className="sp-filter-label-text">{item.label}</span>
                    {item.count && <span className="sp-filter-count">{item.count}</span>}
                  </label>
                </li>
              );
            })}
          </ul>
          {section.items.length > 8 && (
            <button className="sp-filter-show-more">Show More</button>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Product card ── */
const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const isBundle = product.type === 'BUNDLE';
  const discountedPrice = product.price != null && product.discountPercentage > 0
    ? product.price * (1 - product.discountPercentage / 100)
    : null;

  return (
    <div className="sp-card" onClick={() => navigate(isBundle ? `/bundle/${product.id}` : `/game/${product.id}`)}>
      <div className="sp-card-img-wrap">
        <img src={`${API_URL}${product.cover}`} alt={product.title} className="sp-card-img" loading="lazy" />
      </div>
      <div className="sp-card-bar">
        <div className="sp-card-name">{product.title}</div>
        <div className="sp-card-bottom">
          <div className="sp-card-drm-label">
            <SteamIcon className="sp-card-os-icon" />
            <span>{isBundle ? 'BUNDLE' : 'STEAM'}</span>
            {!isBundle && (() => {
              const ps = (product.platforms || []).map(p => p.toLowerCase());
              return <>
                {ps.some(p => p === 'windows' || p === 'win') && <WindowsIcon className="sp-card-os-icon" />}
                {ps.some(p => p === 'linux') && <LinuxIcon className="sp-card-os-icon" />}
                {ps.some(p => p === 'macos' || p === 'mac' || p === 'osx') && <AppleIcon className="sp-card-os-icon" />}
              </>;
            })()}
          </div>
          <div className="sp-card-right">
            {!isBundle && product.discountPercentage > 0 && (
              <span className="sp-card-discount">-{product.discountPercentage}%</span>
            )}
            {isBundle ? null : product.price != null ? (
              <div className="sp-card-prices">
                {discountedPrice != null && (
                  <span className="sp-card-was">RON {product.price.toFixed(2)}</span>
                )}
                <span className="sp-card-now">
                  RON {(discountedPrice ?? product.price).toFixed(2)}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main SearchPage ── */
export const SearchPage = () => {
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [openSections, setOpenSections] = useState(new Set(['price']));
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [perPage, setPerPage] = useState('24');
  const [page, setPage] = useState(1);

  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  const [availableTags, setAvailableTags] = useState([]);
  const [availableDevelopers, setAvailableDevelopers] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/tags`)
      .then(r => r.json())
      .then(data => setAvailableTags(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch(`${API_URL}/developers`)
      .then(r => r.json())
      .then(data => setAvailableDevelopers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const filterSections = useMemo(() => [
    { id: 'productType', label: 'Product Type', items: [
      { label: 'Game' }, { label: 'Bundle' },
    ]},
    { id: 'platform', label: 'Platform', items: [
      { label: 'Windows' }, { label: 'Linux' }, { label: 'MacOS' },
    ]},
    { id: 'tag', label: 'Tag', searchable: true, items: availableTags.map(t => ({ label: t.name })) },
    { id: 'developer', label: 'Developer', searchable: true, items: availableDevelopers.map(d => ({ label: d.displayName })) },
  ], [availableTags, availableDevelopers]);

  const buildSearchParams = useCallback(() => {
    const params = new URLSearchParams();

    const hasGame   = activeFilters.has('productType:Game');
    const hasBundle = activeFilters.has('productType:Bundle');
    if (hasGame && !hasBundle) params.set('type', 'GAME');
    else if (hasBundle && !hasGame) params.set('type', 'BUNDLE');

    const developerFilter = [...activeFilters].find(f => f.startsWith('developer:'));
    if (developerFilter) params.set('developer', developerFilter.split(':').slice(1).join(':'));

    const tagFilters = [...activeFilters].filter(f => f.startsWith('tag:'));
    tagFilters.forEach(f => {
      const name = f.split(':').slice(1).join(':');
      const tag = availableTags.find(t => t.name === name);
      if (tag) params.append('tagIds', tag.id);
    });

    const platformFilters = [...activeFilters]
      .filter(f => f.startsWith('platform:'))
      .map(f => f.split(':')[1]);
    platformFilters.forEach(p => params.append('platforms', p));

    params.set('page', page - 1);
    params.set('size', perPage);
    params.set('sort', sortBy);

    return params;
  }, [activeFilters, availableTags, page, perPage, sortBy]);

  useEffect(() => {
    setLoading(true);
    const params = buildSearchParams();
    fetch(`${API_URL}/search?${params}`)
      .then(r => r.json())
      .then(data => {
        setProducts(data.content || []);
        setTotalPages(data.totalPages || 1);
        setTotalElements(data.totalElements || 0);
      })
      .catch(() => {
        setProducts([]);
        setTotalPages(1);
        setTotalElements(0);
      })
      .finally(() => setLoading(false));
  }, [buildSearchParams]);

  const toggleSection = (id) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleFilter = (key) => {
    setActiveFilters(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
    setPage(1);
  };

  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (onSaleOnly) list = list.filter(p => p.discountPercentage > 0);
    if (priceFilter === 'under5')  list = list.filter(p => p.price != null && p.price < 24.73);
    else if (priceFilter === '5to10')  list = list.filter(p => p.price != null && p.price >= 24.73 && p.price < 49.50);
    else if (priceFilter === '10to20') list = list.filter(p => p.price != null && p.price >= 49.50 && p.price < 99);
    else if (priceFilter === 'over20') list = list.filter(p => p.price != null && p.price >= 99);
    return list;
  }, [products, onSaleOnly, priceFilter]);

  return (
    <div className="sp-page">
      <div className="sp-container">
        <h1 className="sp-title">Search Results</h1>

        {/* Controls bar */}
        <div className="sp-controls">
          <div className="sp-controls-left">
            <button className="sp-control-btn" onClick={() => setFiltersVisible(v => !v)}>
              <SlidersIcon />
              {filtersVisible ? 'Hide Filters' : 'Show Filters'}
            </button>
            <span className="sp-showing">
              Showing <strong>{totalElements.toLocaleString()}</strong> Products
            </span>
          </div>

          <div className="sp-controls-right">
            <div className="sp-control-btn sp-control-select-wrap">
              <GripIcon />
              <select
                className="sp-select"
                value={perPage}
                onChange={e => { setPerPage(e.target.value); setPage(1); }}
              >
                <option value="24">24 Results</option>
                <option value="36">36 Results</option>
                <option value="48">48 Results</option>
                <option value="60">60 Results</option>
              </select>
            </div>
            <div className="sp-control-btn sp-control-select-wrap">
              <SortIcon />
              <select className="sp-select" value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}>
                <option value="newest">Latest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className={`sp-main ${filtersVisible ? 'sp-main--with-filters' : ''}`}>

          {/* Filters sidebar */}
          {filtersVisible && (
            <aside className="sp-filters">
              {/* On Sale toggle */}
              <div className="sp-filter-section sp-filter-toggle-section">
                <div className="sp-filter-section-header sp-filter-section-header--row">
                  <span className="sp-filter-section-title">On Sale</span>
                  <label className="sp-toggle">
                    <input type="checkbox" checked={onSaleOnly} onChange={e => setOnSaleOnly(e.target.checked)} />
                    <span className="sp-toggle-slider" />
                  </label>
                </div>
              </div>

              {/* Price filter */}
              <div className="sp-filter-section">
                <button className="sp-filter-section-header" onClick={() => toggleSection('price')}>
                  <span className="sp-filter-section-title">Price</span>
                  <span className="sp-filter-section-icon">
                    {openSections.has('price') ? <MinusIcon /> : <PlusIcon />}
                  </span>
                </button>
                {openSections.has('price') && (
                  <div className="sp-filter-section-body">
                    <ul className="sp-filter-list">
                      {[
                        { val: 'under5',  label: 'Under €5.00' },
                        { val: '5to10',   label: '€5.00 - €9.99' },
                        { val: '10to20',  label: '€10.00 - €19.99' },
                        { val: 'over20',  label: 'Over €20.00' },
                        { val: 'all',     label: 'All' },
                      ].map(opt => (
                        <li key={opt.val} className="sp-filter-item">
                          <label className="sp-filter-label">
                            <input
                              type="radio"
                              className="sp-filter-radio"
                              name="price"
                              checked={priceFilter === opt.val}
                              onChange={() => setPriceFilter(opt.val)}
                            />
                            <span className="sp-filter-radio-custom" />
                            <span className="sp-filter-label-text">{opt.label}</span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {filterSections.map(section => (
                <FilterSection
                  key={section.id}
                  section={section}
                  openSections={openSections}
                  toggle={toggleSection}
                  activeFilters={activeFilters}
                  onToggleFilter={toggleFilter}
                />
              ))}
            </aside>
          )}

          {/* Product grid */}
          <div className="sp-grid-wrap">
            {loading ? (
              <div className="sp-loading">Loading...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="sp-empty">No products found.</div>
            ) : (
              <div className="sp-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={`${product.type}-${product.id}`} product={product} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="sp-pagination">
                <button
                  className="sp-page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(1)}
                  aria-label="First"
                >«</button>
                <button
                  className="sp-page-btn"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  aria-label="Previous"
                ><ChevronLeftIcon /></button>

                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <button
                      key={p}
                      className={`sp-page-btn ${page === p ? 'sp-page-btn--active' : ''}`}
                      onClick={() => setPage(p)}
                    >{p}</button>
                  );
                })}

                <button
                  className="sp-page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  aria-label="Next"
                ><ChevronRightIcon /></button>
                <button
                  className="sp-page-btn"
                  disabled={page === totalPages}
                  onClick={() => setPage(totalPages)}
                  aria-label="Last"
                >»</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
