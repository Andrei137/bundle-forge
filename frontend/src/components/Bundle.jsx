import { useState, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { addToCart } from '../redux/slices/cartSlice';
import './Bundle.css';

const API_URL = import.meta.env.VITE_API_URL;

/* ── Icons ── */
const PlusIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" width="12" height="12">
    <path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/>
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" width="12" height="12">
    <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/>
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 576 512" fill="currentColor" width="16" height="16">
    <path d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
  </svg>
);

const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 512 512" fill="currentColor" width="12" height="12"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 512 512" fill="#4ade80" width="14" height="14">
    <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"/>
  </svg>
);

const SteamIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
  </svg>
);

const WinIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" width="12" height="12">
    <path d="M0 93.7l183.6-25.3v177.4H0V93.7zm0 324.6l183.6 25.3V268.4H0v149.9zm203.8 28L448 480V268.4H203.8v177.9zm0-380.6v180.1H448V32L203.8 65.7z"/>
  </svg>
);

const MacIcon = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" width="12" height="12">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
  </svg>
);

const LinuxIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" width="12" height="12">
    <path d="M220.8 123.3c1 .5 1.8 1.7 3 1.7 1.1 0 2.8-.4 2.9-1.5.2-1.4-1.9-2.3-3.2-2.9-1.7-.7-3.9-1-5.5-.1-.4.2-.8.7-.6 1.1.3 1.3 2.3 1.1 3.4 1.7zm-21.9 1.7c1.2 0 2-1.2 3-1.7 1.1-.6 3.1-.4 3.5-1.6.2-.4-.2-.9-.6-1.1-1.6-.9-3.8-.6-5.5.1-1.3.6-3.4 1.5-3.2 2.9.1 1 1.8 1.5 2.8 1.4zM183 75.8c10.1 0 20.8 14.2 19.1 33.5-3.5 1-7.1 2.5-10.2 4.6 1.2-8.9-3.3-20.1-9.6-19.6-8.4.7-9.8 21.2-1.8 28.1 1 .8 1.9-.2-5.9 5.5-15.6-14.6-10.5-52.1 8.4-52.1z"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 512 512" fill="currentColor" width="12" height="12">
    <path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z"/>
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 512 512" fill="currentColor" width="16" height="16">
    <path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
  </svg>
);

/* ── Platform icon map ── */
const PlatformIcon = ({ p }) => ({
  win: <WinIcon />, mac: <MacIcon />, linux: <LinuxIcon />
}[p] || null);

const PlatformIcons = ({ platforms }) => (
  <div className="pam-card-platforms">
    {(platforms || []).map(p => <PlatformIcon key={p} p={p} />)}
  </div>
);

/* ── Donation slider row ── */
const DonationSlider = ({ label, value, min, max, onChange, color, note }) => {
  const pct = max > 0 ? ((value - min) / Math.max(max - min, 0.01)) * 100 : 0;
  return (
    <div className="pam-slider-row">
      <div className="pam-slider-header">
        <span className="pam-slider-label">{label}</span>
        <span className="pam-slider-value" style={{ color }}>RON {value.toFixed(2)}</span>
      </div>
      {note && <div className="pam-slider-note">{note}</div>}
      <div className="pam-slider-track-wrap">
        <div className="pam-slider-fill" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
        <input
          type="range"
          className="pam-slider-input"
          min={min}
          max={max}
          step={0.01}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

/* ── Main component ── */
export const Bundle = () => {
  const dispatch = useDispatch();
  const { id: bundleId } = useParams();

  const [bundle, setBundle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const [selected, setSelected] = useState(new Set());
  const [donationOpen, setDonationOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customAmountError, setCustomAmountError] = useState('');
  const [platformPct, setPlatformPct] = useState(0.10);
  const [devPct, setDevPct] = useState(0.50);

  useEffect(() => {
    const url = bundleId
      ? `${API_URL}/bundles/${bundleId}`
      : `${API_URL}/bundles`;

    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load bundle (${res.status})`);
        return res.json();
      })
      .then(data => {
        const b = bundleId ? data : data[0];
        if (!b) throw new Error('No bundles available');
        setBundle(b);
        setPlatformPct((b.platformMinPct ?? 10) / 100);
        setDevPct((b.devMinPct ?? 50) / 100);
        // Pre-select the first numRequiredGames games of the lowest tier
        const firstTier = [...(b.tiers || [])].sort((a, z) => a.numRequiredGames - z.numRequiredGames)[0];
        const preCount = firstTier?.numRequiredGames ?? 3;
        setSelected(new Set((b.games || []).slice(0, preCount).map(g => g.id)));
      })
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [bundleId]);

  const games = bundle?.games ?? [];
  const tiers = useMemo(() => [...(bundle?.tiers ?? [])].sort((a, b) => a.numRequiredGames - b.numRequiredGames), [bundle]);
  const PLATFORM_MIN_PCT = (bundle?.platformMinPct ?? 10) / 100;
  const DEV_MIN_PCT = (bundle?.devMinPct ?? 15) / 100;

  const count = selected.size;

  const activeTier = useMemo(() => {
    const sorted = [...tiers].sort((a, b) => b.numRequiredGames - a.numRequiredGames);
    return sorted.find(t => count >= t.numRequiredGames) || tiers[0] || { numRequiredGames: 3, pricePerGame: 0 };
  }, [count, tiers]);

  const basePrice = useMemo(() => {
    if (!tiers.length || count < (tiers[0]?.numRequiredGames ?? 3)) return 0;
    return count * activeTier.pricePerGame;
  }, [count, activeTier, tiers]);

  const total = useMemo(() => {
    const ca = parseFloat(customAmount);
    if (!isNaN(ca) && ca > basePrice) return ca;
    return basePrice;
  }, [customAmount, basePrice]);

  const rrpTotal = useMemo(() => {
    return games.filter(g => selected.has(g.id)).reduce((s, g) => s + (g.rrp ?? 0), 0);
  }, [selected, games]);

  const savingPct = rrpTotal > 0 ? Math.round((1 - total / rrpTotal) * 100) : 0;

  const platformAmt = total * platformPct;
  const devAmt = total * devPct;
  const charityAmt = total - platformAmt - devAmt;
  const platformMin = total * PLATFORM_MIN_PCT;
  const devMin = total * DEV_MIN_PCT;

  const handlePlatformChange = (val) => {
    if (total - val - devAmt < 0) return;
    setPlatformPct(val / total);
  };

  const handleDevChange = (val) => {
    if (total - platformAmt - val < 0) return;
    setDevPct(val / total);
  };

  const handleCustomAmount = (e) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (val && (isNaN(num) || num <= basePrice)) {
      setCustomAmountError(`Minimum amount is RON ${basePrice.toFixed(2)}`);
    } else {
      setCustomAmountError('');
    }
  };

  const toggleGame = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const minGames = tiers[0]?.numRequiredGames ?? 3;
  const canCheckout = count >= minGames;

  const handleGoToCart = () => {
    if (!canCheckout) return;
    games.filter(g => selected.has(g.id)).forEach(game => {
      dispatch(addToCart({
        id: game.id,
        title: game.title,
        price: activeTier.pricePerGame,
        image: game.cover ? `${API_URL}${game.cover}` : '',
        quantity: 1,
      }));
    });
  };

  if (loading) {
    return (
      <div className="pam-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#888' }}>Loading bundle...</p>
      </div>
    );
  }

  if (fetchError || !bundle) {
    return (
      <div className="pam-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: '#ff4444' }}>{fetchError || 'Bundle not found'}</p>
      </div>
    );
  }

  const firstTier = tiers[0];

  return (
    <div className="pam-page">
      <div className="pam-content-wrap">

        {/* ── LEFT: game grid ── */}
        <section className="pam-left">
          <div className="pam-grid">
            {games.map(game => {
              const isSelected = selected.has(game.id);
              const imgSrc = game.cover ? `${API_URL}${game.cover}` : '';
              return (
                <article key={game.id} className={`pam-card ${isSelected ? 'pam-card--selected' : ''}`}>
                  <div className="pam-card-cover">
                    {imgSrc && <img src={imgSrc} alt={game.title} className="pam-card-img" loading="lazy" />}
                    <div className="pam-card-overlay">
                      <span className="pam-card-name">{game.title}</span>
                    </div>
                    {isSelected && <div className="pam-card-selected-badge">✓</div>}
                  </div>

                  <div className="pam-card-body">
                    <div className="pam-card-top">
                      <div className="pam-card-drm">
                        <SteamIcon />
                        <span className="pam-card-drm-label">STEAM</span>
                      </div>
                      <PlatformIcons platforms={game.platforms} />
                    </div>
                    <div className="pam-card-bottom">
                      <a href={`/game/${game.id}`} className="pam-card-details-link">Product Details</a>
                      <span className="pam-card-rrp"><span className="pam-card-rrp-label">RRP</span> RON {(game.rrp ?? 0).toFixed(2)}</span>
                    </div>
                    <button
                      className={`pam-card-btn ${isSelected ? 'pam-card-btn--selected' : ''}`}
                      onClick={() => toggleGame(game.id)}
                    >
                      {isSelected ? (
                        <><TrashIcon /> Remove from bundle</>
                      ) : (
                        <><PlusIcon /> Add to bundle</>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── RIGHT: sticky sidebar ── */}
        <aside className="pam-right">
          {bundle.cover && (
            <div className="pam-cover-wrap">
              <img
                src={`${API_URL}${bundle.cover}`}
                alt={bundle.title}
                className="pam-cover-img"
              />
            </div>
          )}

          {firstTier && (
            <p className="pam-save-msg">
              Build your own Bundle from{' '}
              <span className="pam-save-msg-highlight">
                {firstTier.numRequiredGames} for <strong>RON {(firstTier.numRequiredGames * firstTier.pricePerGame).toFixed(2)}</strong>
              </span>. Add games to start saving. The more you add, the more you save!
            </p>
          )}

          <div className="pam-sticky-container">
            {/* Tier boxes */}
            <div className="pam-tiers">
              {tiers.map((tier, idx) => (
                <div key={tier.numRequiredGames} className={`pam-tier ${count >= tier.numRequiredGames ? 'pam-tier--active' : ''}`}>
                  <div className="pam-tier-qty">
                    {tier.numRequiredGames}+ Games
                    {idx === tiers.length - 1 && tiers.length > 1 && (
                      <span className="pam-tier-best">Best value</span>
                    )}
                  </div>
                  <div className="pam-tier-price">
                    <span className="pam-tier-price-val">RON {tier.pricePerGame.toFixed(2)}</span>
                    <span className="pam-tier-price-per"> / Per item</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Other amount input */}
            <div className="pam-custom-amount">
              <label className="pam-custom-amount-label">Pay more — support developers &amp; charity</label>
              <div className="pam-custom-amount-wrap">
                <span className="pam-custom-amount-prefix">RON</span>
                <input
                  type="number"
                  className={`pam-custom-amount-input ${customAmountError ? 'pam-custom-amount-input--error' : ''}`}
                  placeholder={basePrice > 0 ? basePrice.toFixed(2) : '0.00'}
                  value={customAmount}
                  onChange={handleCustomAmount}
                  min={basePrice}
                  step="0.01"
                />
              </div>
              {customAmountError && <p className="pam-custom-amount-error">{customAmountError}</p>}
            </div>

            {/* Adjust Donation collapsible */}
            <div className="pam-donation-section">
              <button className="pam-donation-toggle" onClick={() => setDonationOpen(v => !v)}>
                <div className="pam-donation-toggle-left">
                  <HeartIcon />
                  <span>Adjust Donation</span>
                </div>
                <ChevronIcon open={donationOpen} />
              </button>
              <div className="pam-donation-divider" />

              {donationOpen && (
                <div className="pam-donation-body">
                  <p className="pam-donation-intro">
                    Drag the sliders to decide how your payment is split.
                    Platform &amp; Developer shares have a minimum requirement.
                  </p>

                  <DonationSlider
                    label="Bundle Forge Platform"
                    value={platformAmt}
                    min={platformMin}
                    max={total - devAmt}
                    onChange={handlePlatformChange}
                    color="#f90"
                    note={`Min: RON ${platformMin.toFixed(2)} (${Math.round(PLATFORM_MIN_PCT * 100)}%)`}
                  />
                  <DonationSlider
                    label="Developers"
                    value={devAmt}
                    min={devMin}
                    max={total - platformAmt}
                    onChange={handleDevChange}
                    color="#4fc3f7"
                    note={`Min: RON ${devMin.toFixed(2)} (${Math.round(DEV_MIN_PCT * 100)}%)`}
                  />

                  <div className="pam-charity-split">
                    <span className="pam-charity-split-label">Charity</span>
                    <span className="pam-charity-split-value" style={{ color: '#4ade80' }}>
                      RON {Math.max(0, charityAmt).toFixed(2)}
                    </span>
                  </div>

                  <div className="pam-split-bar">
                    <div className="pam-split-seg" style={{ width: `${platformPct * 100}%`, background: '#f90' }} title="Platform" />
                    <div className="pam-split-seg" style={{ width: `${devPct * 100}%`, background: '#4fc3f7' }} title="Developers" />
                    <div className="pam-split-seg" style={{ flex: 1, background: '#4ade80' }} title="Charity" />
                  </div>
                  <div className="pam-split-legend">
                    <span><span className="pam-split-dot" style={{ background: '#f90' }} />Platform</span>
                    <span><span className="pam-split-dot" style={{ background: '#4fc3f7' }} />Developers</span>
                    <span><span className="pam-split-dot" style={{ background: '#4ade80' }} />Charity</span>
                  </div>
                </div>
              )}
            </div>

            {/* Subtotal */}
            <div className="pam-subtotal">
              <div className="pam-subtotal-top">
                <span className="pam-subtotal-label">Subtotal</span>
                <div className="pam-subtotal-prices">
                  <span className="pam-subtotal-price">RON {total.toFixed(2)}</span>
                  {rrpTotal > 0 && (
                    <>
                      <span className="pam-subtotal-was">RON {rrpTotal.toFixed(2)}</span>
                      <span className="pam-subtotal-save">-{savingPct}%</span>
                    </>
                  )}
                </div>
              </div>
              {count < minGames && (
                <p className="pam-subtotal-hint">Select at least {minGames} games to continue</p>
              )}
              <button className="pam-go-to-cart" disabled={!canCheckout} onClick={handleGoToCart}>
                <CartIcon /> GO TO CART
              </button>
            </div>

            {/* ── Charity info ── */}
            {bundle.charity && (
              <div className="pam-charity-info">
                <div className="pam-charity-info-header">
                  <HeartIcon />
                  <span className="pam-charity-info-name">{bundle.charity.name}</span>
                </div>
                <p className="pam-charity-info-desc">{bundle.charity.shortDescription}</p>
                {bundle.charity.website && (
                  <a href={bundle.charity.website} target="_blank" rel="noopener noreferrer" className="pam-charity-info-link">
                    Visit their website <ExternalLinkIcon />
                  </a>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── Bundle info below ── */}
      <div className="pam-bundle-info">
        <h1 className="pam-bundle-title">{bundle.title}</h1>
        <p className="pam-bundle-short">{bundle.shortDescription}</p>
        <section className="pam-bundle-about">
          <h2>About this Bundle</h2>
          {bundle.longDescription.split('\n').filter(Boolean).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
          <p><em>* All games are supplied as official Steam keys. Available while stocks last.</em></p>
        </section>
      </div>
    </div>
  );
};
