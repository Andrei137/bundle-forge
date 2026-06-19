import { useState, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, Navigate } from 'react-router-dom';
import { addToCart } from '../redux/slices/cartSlice';
import CartIcon from '../assets/icons/cart.svg?react';
import SteamIcon from '../assets/icons/steam.svg?react';
import WindowsIcon from '../assets/icons/windows.svg?react';
import AppleIcon from '../assets/icons/apple.svg?react';
import LinuxIcon from '../assets/icons/linux.svg?react';
import TrashIcon from '../assets/icons/trash.svg?react';
import PlusIcon from '../assets/icons/plus.svg?react';
import PreviousIcon from '../assets/icons/previous.svg?react';
import NextIcon from '../assets/icons/next.svg?react';
import './Bundle.css';
import './Game.css';

const API_URL = import.meta.env.VITE_API_URL;

/* ── Icons ── */
const ChevronIcon = ({ open }) => (
  <svg viewBox="0 0 512 512" fill="currentColor" width="12" height="12"
    style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
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
  win: <WindowsIcon width="12" height="12" className="icon-white" />,
  mac: <AppleIcon width="12" height="12" className="icon-white" />,
  linux: <LinuxIcon width="12" height="12" className="icon-white" />,
}[p] || null);

const PlatformIcons = ({ platforms }) => (
  <div className="pam-card-platforms">
    {(platforms || []).map(p => <PlatformIcon key={p} p={p} />)}
  </div>
);

/* ── Donation slider row ── */
const DonationSlider = ({ label, value, min, max, onChange, color, note, total }) => {
  const currentPct = total > 0 ? Math.round((value / total) * 100) : 0;
  const minPct = total > 0 ? Math.ceil((min / total) * 100) : 0;
  const maxPct = total > 0 ? Math.floor((max / total) * 100) : 100;

  const stepPct = (delta) => {
    const newPct = Math.min(maxPct, Math.max(minPct, currentPct + delta));
    onChange(newPct);
  };

  return (
    <div className="pam-slider-row">
      <div className="pam-slider-header">
        <span className="pam-slider-label">{label}</span>
        <span className="pam-slider-value" style={{ color }}>RON {value.toFixed(2)}</span>
      </div>
      {note && <div className="pam-slider-note">{note}</div>}
      <div className="pam-slider-with-pct">
        <button className="pam-slider-step-btn" onClick={() => stepPct(-1)} disabled={currentPct <= minPct}>
          <PreviousIcon width="8" height="8" className="icon-white" />
        </button>
        <div className="pam-slider-track-wrap">
          <div className="pam-slider-fill" style={{ width: `${currentPct}%`, background: color }} />
          <input
            type="range"
            className="pam-slider-input"
            min={minPct}
            max={maxPct}
            step={1}
            value={currentPct}
            onChange={e => onChange(parseInt(e.target.value, 10))}
          />
        </div>
        <button className="pam-slider-step-btn" onClick={() => stepPct(1)} disabled={currentPct >= maxPct}>
          <NextIcon width="8" height="8" className="icon-white" />
        </button>
        <input
          type="number"
          className="pam-slider-pct-input"
          value={currentPct}
          readOnly
          tabIndex={-1}
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
  const [notFound, setNotFound] = useState(false);

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
        // Bundle doesn't exist in the database: redirect to the app's Not Found page.
        if (res.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!res.ok) throw new Error(`Failed to load bundle (${res.status})`);
        return res.json();
      })
      .then(data => {
        if (!data) return;
        const b = bundleId ? data : data[0];
        if (!b) throw new Error('No bundles available');
        setBundle(b);
        setPlatformPct((b.platformMinPct ?? 10) / 100);
        setDevPct((b.devMinPct ?? 50) / 100);

        const storageKey = `bundle-selection-${b.id}`;
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const savedIds = new Set(JSON.parse(saved));
          const validIds = new Set((b.games || []).map(g => g.id).filter(id => savedIds.has(id)));
          setSelected(validIds);
        } else {
          const firstTier = [...(b.tiers || [])].sort((a, z) => a.numRequiredGames - z.numRequiredGames)[0];
          const preCount = firstTier?.numRequiredGames ?? 3;
          setSelected(new Set((b.games || []).slice(0, preCount).map(g => g.id)));
        }
      })
      .catch(err => setFetchError(err.message))
      .finally(() => setLoading(false));
  }, [bundleId]);

  useEffect(() => {
    if (!bundle) return;
    localStorage.setItem(`bundle-selection-${bundle.id}`, JSON.stringify([...selected]));
  }, [selected, bundle]);

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

  const redistributePct = (target, newPct) => {
    let p = Math.round(platformPct * 100);
    let d = Math.round(devPct * 100);
    let c = Math.max(0, 100 - p - d);
    const minP = Math.round(PLATFORM_MIN_PCT * 100);
    const minD = Math.round(DEV_MIN_PCT * 100);

    if (target === 'platform') {
      const delta = newPct - p;
      if (delta > 0) {
        // Take from Dev first, then Charity
        let rem = delta;
        const fromD = Math.min(rem, d - minD); d -= fromD; rem -= fromD;
        const fromC = Math.min(rem, c);         c -= fromC; rem -= fromC;
        p += delta - rem;
      } else {
        // Give to Charity
        if (p + delta < minP) return;
        c += -delta; p += delta;
      }
    } else if (target === 'dev') {
      const delta = newPct - d;
      if (delta > 0) {
        // Take from Platform first, then Charity
        let rem = delta;
        const fromP = Math.min(rem, p - minP); p -= fromP; rem -= fromP;
        const fromC = Math.min(rem, c);         c -= fromC; rem -= fromC;
        d += delta - rem;
      } else {
        // Give to Charity
        if (d + delta < minD) return;
        c += -delta; d += delta;
      }
    } else {
      const delta = newPct - c;
      if (delta > 0) {
        // Take from Platform first, then Dev
        let rem = delta;
        const fromP = Math.min(rem, p - minP); p -= fromP; rem -= fromP;
        const fromD = Math.min(rem, d - minD); d -= fromD; rem -= fromD;
        c += delta - rem;
      } else {
        // Give to Dev
        if (c + delta < 0) return;
        d += -delta; c += delta;
      }
    }

    setPlatformPct(p / 100);
    setDevPct(d / 100);
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
    const platformPctInt = Math.round(platformPct * 100);
    const devPctInt = Math.round(devPct * 100);

    const selectedGames = games.filter(g => selected.has(g.id));
    const numGames = selectedGames.length;
    // total can exceed basePrice when the customer chose to pay more — distribute
    // the extra evenly across selected games (with the rounding remainder absorbed
    // by the first few items so the sum exactly matches the customer's chosen total).
    const totalCents = Math.round(total * 100);
    const perGameCents = Math.floor(totalCents / numGames);
    const remainderCents = totalCents - perGameCents * numGames;

    selectedGames.forEach((game, index) => {
      const unitAmountCents = perGameCents + (index < remainderCents ? 1 : 0);
      dispatch(addToCart({
        id: game.id,
        title: game.title,
        price: unitAmountCents / 100,
        tierPrice: activeTier.pricePerGame,
        image: game.cover ? `${API_URL}${game.cover}` : '',
        quantity: 1,
        bundleId: bundle.id,
        bundleName: bundle.title,
        platformPct: platformPctInt,
        devPct: devPctInt,
        unitAmount: unitAmountCents,
      }));
    });
  };

  if (notFound) return <Navigate to="/404" replace />;

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
                        <SteamIcon width="14" height="14" className="icon-white" />
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
                        <><TrashIcon width="12" height="12" className="icon-white" /> Remove from bundle</>
                      ) : (
                        <><PlusIcon fill="currentColor" width="12" height="12" /> Add to bundle</>
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
                <strong>{firstTier.numRequiredGames} for RON {(firstTier.numRequiredGames * firstTier.pricePerGame).toFixed(2)}</strong>
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
                    onChange={pct => redistributePct('platform', pct)}
                    color="#f90"
                    note={`Min: RON ${platformMin.toFixed(2)} (${Math.round(PLATFORM_MIN_PCT * 100)}%)`}
                    total={total}
                  />
                  <DonationSlider
                    label="Developers"
                    value={devAmt}
                    min={devMin}
                    max={total - platformAmt}
                    onChange={pct => redistributePct('dev', pct)}
                    color="#4fc3f7"
                    note={`Min: RON ${devMin.toFixed(2)} (${Math.round(DEV_MIN_PCT * 100)}%)`}
                    total={total}
                  />

                  {(() => {
                    const charityPct = canCheckout ? Math.max(0, Math.round((1 - platformPct - devPct) * 100)) : 0;
                    const maxCharityPct = Math.floor((1 - PLATFORM_MIN_PCT - DEV_MIN_PCT) * 100);
                    const fillPct = charityPct;
                    return (
                      <div className="pam-slider-row">
                        <div className="pam-slider-header">
                          <span className="pam-slider-label">Charity</span>
                          <span className="pam-slider-value" style={{ color: '#4ade80' }}>RON {Math.max(0, charityAmt).toFixed(2)}</span>
                        </div>
                        <div className="pam-slider-with-pct">
                          <button className="pam-slider-step-btn" onClick={() => redistributePct('charity', charityPct - 1)} disabled={charityPct <= 0}>
                            <PreviousIcon width="8" height="8" className="icon-white" />
                          </button>
                          <div className="pam-slider-track-wrap">
                            <div className="pam-slider-fill" style={{ width: `${Math.max(0, Math.min(100, fillPct))}%`, background: '#4ade80' }} />
                            <input
                              type="range"
                              className="pam-slider-input"
                              min={0}
                              max={maxCharityPct}
                              step={1}
                              value={charityPct}
                              onChange={e => redistributePct('charity', parseInt(e.target.value, 10))}
                            />
                          </div>
                          <button className="pam-slider-step-btn" onClick={() => redistributePct('charity', charityPct + 1)} disabled={charityPct >= maxCharityPct}>
                            <NextIcon width="8" height="8" className="icon-white" />
                          </button>
                          <input
                            type="number"
                            className="pam-slider-pct-input"
                            value={charityPct}
                            readOnly
                            tabIndex={-1}
                          />
                        </div>
                      </div>
                    );
                  })()}

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
                  <span className="pam-subtotal-price">RON {(canCheckout ? total : rrpTotal).toFixed(2)}</span>
                  {canCheckout && rrpTotal > 0 && (
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
                <CartIcon width="16" height="16" /> GO TO CART
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
        <h1 className="pam-bundle-title">Build your own {bundle.title}</h1>
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
