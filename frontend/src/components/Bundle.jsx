import { useState, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import './Bundle.css';

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

/* ── Game data ── */
const ALL_GAMES = [
  { id: 1, title: 'Fear the Spotlight', rrp: 101.93, platforms: ['win','mac','linux'], image: 'https://fanatical.imgix.net/product/original/6fedd063-9f69-46a3-a5b6-b5789fbab98a.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 2, title: 'Tower of Mask', rrp: 55.02, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/0ce21c52-ea67-4b8c-9753-67b9d48db8e8.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 3, title: 'DreadOut 2', rrp: 85.61, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/4677c1e2-a1ad-4ab9-9b86-cfac7a55efcb.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 4, title: 'Kriophobia', rrp: 62.66, platforms: ['win','mac'], image: 'https://fanatical.imgix.net/product/original/dc11ac3d-e52f-4d6f-8aa5-33afad1fe883.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 5, title: 'The Door in the Basement', rrp: 55.02, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/f3b2d1b1-e899-44ca-8fc6-e1806dadc71c.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 6, title: 'Them and Us', rrp: 173.31, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/43b59812-0153-40a1-aaea-0440c05b773e.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 7, title: 'Draft of Darkness', rrp: 75.41, platforms: ['win','linux'], image: 'https://fanatical.imgix.net/product/original/9e89e524-ee67-47eb-b96d-dd820af18f7a.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 8, title: 'Lost Alone Ultimate', rrp: 75.41, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/21b66320-5e4f-4ab1-9e96-ca69e6f2f26c.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 9, title: "Creepy Shift: Uncle Joe's Motel", rrp: 35.64, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/4a31a4ec-b007-4bea-93d3-5012acc8f7ff.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 10, title: 'Employee of The Month', rrp: 50.94, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/0a637a0e-555b-42b6-a3ea-3a8ae34927bf.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 11, title: 'Creepy Shift: House For Sale', rrp: 35.64, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/10318f61-7070-4b3c-aa24-42b3f3cfb3e3.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 12, title: 'Creepy Shift: Roadside Diner', rrp: 35.64, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/38aebb52-be6a-4fda-8b76-f430dd802a84.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 13, title: 'The Alien Cube', rrp: 101.93, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/51c5de37-b85f-418d-a97f-3845c0424ab7.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 14, title: 'Jack Holmes: Master of Puppets', rrp: 76.43, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/102484df-b86c-499b-84c6-d85e809cd5bf.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 15, title: 'Mirror Forge', rrp: 65.21, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/78d1e133-f634-495d-be2b-b83e6fa2d9b3.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 16, title: 'Hauntsville', rrp: 94.28, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/9b037f3d-5edb-470d-ae16-4f37025c2429.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 17, title: 'Y. Village - The Visitors', rrp: 39.72, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/fb63a08e-18e3-415e-9a89-4f9332071882.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 18, title: 'Locked in my Darkness 1 & 2', rrp: 71.28, platforms: ['win','linux'], image: 'https://fanatical.imgix.net/product/original/e8845ea3-aa30-4908-8320-a4c4d4d3804c.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 19, title: 'Astrumis - Survive Together', rrp: 49.71, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/813f088d-c087-4b3e-8ced-800223f0342b.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
  { id: 20, title: 'CashGrab: Refunded', rrp: 35.13, platforms: ['win'], image: 'https://fanatical.imgix.net/product/original/2f7f2455-b0ff-4091-b6a2-77fa68a8f06e.jpeg?auto=compress,format&w=307&fit=crop&h=173' },
];

const TIERS = [
  { min: 3, price: 16.98, label: '3 + Games' },
  { min: 5, price: 15.30, label: '5 + Games' },
  { min: 7, price: 14.53, label: '7 + Games', bestValue: true },
];

// Platform icon map
const PlatformIcon = ({ p }) => ({
  win: <WinIcon />, mac: <MacIcon />, linux: <LinuxIcon />
}[p] || null);

/* ── Platform icons display ── */
const PlatformIcons = ({ platforms }) => (
  <div className="pam-card-platforms">
    {platforms.map(p => <PlatformIcon key={p} p={p} />)}
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

  // Selected game IDs (start with first 3 selected)
  const [selected, setSelected] = useState(new Set([1, 2, 3]));
  const [donationOpen, setDonationOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customAmountError, setCustomAmountError] = useState('');

  // Minimums for sliders (% of base price)
  const PLATFORM_MIN_PCT = 0.10; // 10%
  const DEV_MIN_PCT = 0.15;      // 15%

  // Donation splits (0–1 as pct of total)
  const [platformPct, setPlatformPct] = useState(0.10);
  const [devPct, setDevPct] = useState(0.50);
  // charity gets remainder

  const count = selected.size;

  // Active tier
  const activeTier = useMemo(() => {
    const sorted = [...TIERS].sort((a, b) => b.min - a.min);
    return sorted.find(t => count >= t.min) || TIERS[0];
  }, [count]);

  // Base subtotal
  const basePrice = useMemo(() => {
    if (count < 3) return 0;
    return count * activeTier.price;
  }, [count, activeTier]);

  // Total (custom amount if set and valid)
  const total = useMemo(() => {
    const ca = parseFloat(customAmount);
    if (!isNaN(ca) && ca > basePrice) return ca;
    return basePrice;
  }, [customAmount, basePrice]);

  // RRP total
  const rrpTotal = useMemo(() => {
    return ALL_GAMES.filter(g => selected.has(g.id)).reduce((s, g) => s + g.rrp, 0);
  }, [selected]);

  const savingPct = rrpTotal > 0 ? Math.round((1 - total / rrpTotal) * 100) : 0;

  // Donation amounts
  const platformAmt = total * platformPct;
  const devAmt = total * devPct;
  const charityAmt = total - platformAmt - devAmt;

  const platformMin = total * PLATFORM_MIN_PCT;
  const devMin = total * DEV_MIN_PCT;

  const handlePlatformChange = (val) => {
    const remaining = total - val - devAmt;
    if (remaining < 0) return;
    setPlatformPct(val / total);
  };

  const handleDevChange = (val) => {
    const remaining = total - platformAmt - val;
    if (remaining < 0) return;
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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGoToCart = () => {
    if (count < 3) return;
    const selectedGames = ALL_GAMES.filter(g => selected.has(g.id));
    selectedGames.forEach(game => {
      dispatch(addToCart({ id: game.id, title: game.title, price: activeTier.price, image: game.image, quantity: 1 }));
    });
  };

  const canCheckout = count >= 3;

  return (
    <div className="pam-page">
      <div className="pam-content-wrap">

        {/* ── LEFT: game grid ── */}
        <section className="pam-left">
          <div className="pam-grid">
            {ALL_GAMES.map(game => {
              const isSelected = selected.has(game.id);
              return (
                <article key={game.id} className={`pam-card ${isSelected ? 'pam-card--selected' : ''}`}>
                  <div className="pam-card-cover">
                    <img src={game.image} alt={game.title} className="pam-card-img" loading="lazy" />
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
                      <a href="#" className="pam-card-details-link">Product Details</a>
                      <span className="pam-card-rrp"><span className="pam-card-rrp-label">RRP</span> RON {game.rrp.toFixed(2)}</span>
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
          {/* Cover */}
          <div className="pam-cover-wrap">
            <img
              src="https://fanatical.imgix.net/product/original/db4e7503-78e4-4f8a-be5c-49e5c7b48809.jpeg?auto=compress,format&w=524&fit=max"
              alt="Build your own Survival Horror Bundle"
              className="pam-cover-img"
            />
          </div>

          {/* Save more message */}
          <p className="pam-save-msg">
            Build your own Bundle from <span className="pam-save-msg-highlight">3 for <strong>RON 50.94</strong></span>. Add games to start saving. The more you add, the more you save!
          </p>

          <div className="pam-sticky-container">
            {/* Tier boxes */}
            <div className="pam-tiers">
              {TIERS.map(tier => (
                <div key={tier.min} className={`pam-tier ${count >= tier.min ? 'pam-tier--active' : ''}`}>
                  <div className="pam-tier-qty">
                    {tier.label}
                    {tier.bestValue && <span className="pam-tier-best">Best value</span>}
                  </div>
                  <div className="pam-tier-price">
                    <span className="pam-tier-price-val">RON {tier.price.toFixed(2)}</span>
                    <span className="pam-tier-price-per"> / Per item</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Other amount input */}
            <div className="pam-custom-amount">
              <label className="pam-custom-amount-label">Pay more — support developers & charity</label>
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

                  {/* Visual split bar */}
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
              {count < 3 && (
                <p className="pam-subtotal-hint">Select at least 3 games to continue</p>
              )}
              <button className="pam-go-to-cart" disabled={!canCheckout} onClick={handleGoToCart}>
                <CartIcon /> GO TO CART
              </button>
            </div>

            {/* Region */}
            <div className="pam-region">
              <CheckCircleIcon />
              <span>This product activates in Romania 🇷🇴</span>
              <a href="#regions" className="pam-check-regions">Check Regions</a>
            </div>

            {/* Payments */}
            <div className="pam-payments">
              <span className="pam-payments-label">Payments:</span>
              <div className="pam-payment-icons">
                {['PayPal', 'VISA', 'MC', 'G Pay', 'BNPL'].map(p => (
                  <span key={p} className="pam-payment-icon">{p}</span>
                ))}
              </div>
            </div>

            {/* ── Charity info ── */}
            <div className="pam-charity-info">
              <div className="pam-charity-info-header">
                <HeartIcon />
                <span className="pam-charity-info-name">Whale & Dolphin Conservation</span>
              </div>
              <p className="pam-charity-info-desc">
                WDC is the leading global charity dedicated to the protection of whales and dolphins. They work to end captivity, bycatch, and other threats through advocacy, research, and education worldwide.
              </p>
              <a href="https://uk.whales.org" target="_blank" rel="noopener noreferrer" className="pam-charity-info-link">
                Visit their website <ExternalLinkIcon />
              </a>
            </div>
          </div>
        </aside>
      </div>

      {/* ── Bundle info below ── */}
      <div className="pam-bundle-info">
        <h1 className="pam-bundle-title">Build your own Survival Horror Bundle</h1>
        <p className="pam-bundle-short">
          Test your nerves with our brand new collection of unsettling survival horror titles! If you're prepared for the frights, you might just last the night.
        </p>
        <section className="pam-bundle-about">
          <h2>About this Bundle</h2>
          <p>It's time to test your mettle in perilous new worlds with our freshly curated Build your own Survival Horror Bundle.</p>
          <p>Choose from this creepy collection of games and face demons, zombies, monsters, and more horrors beyond your imagination.</p>
          <p>Genre veterans and novices alike will find a vast array of gloriously atmospheric worlds to survive, including abandoned spaceships, creepy motels, and twisted subterranean hellscapes.</p>
          <p>It's time to clock in for the late shift, and see if you can make it through the night.</p>
          <p><em>* All games are supplied as official Steam keys. Available while stocks last.</em></p>
        </section>
      </div>
    </div>
  );
};
