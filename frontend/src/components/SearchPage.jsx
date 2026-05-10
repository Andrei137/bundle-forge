import { useState, useMemo } from 'react';import { useNavigate } from 'react-router-dom';
import SteamIcon from '../assets/icons/steam.svg?react';
import WindowsIcon from '../assets/icons/windows.svg?react';
import AppleIcon from '../assets/icons/apple.svg?react';
import LinuxIcon from '../assets/icons/linux.svg?react';
import './SearchPage.css';

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

/* ── Sample product data ── */
const PRODUCTS = [
  { id:1, title:'PRAGMATA', price:250.33, originalPrice:305.41, discount:18, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/9f0d852b-5735-4dcf-a4ee-5ddfa549fbd7.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:2, title:'PRAGMATA Digital Deluxe', price:292.07, originalPrice:356.32, discount:18, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/6714598e-e554-40b4-b1bf-69f2c81210b8.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:3, title:'Mystery Egg Bundle', price:null, daysLeft:36, platforms:[], drm:'steam', image:'https://fanatical.imgix.net/product/original/963af282-9296-4e5e-a0c6-a40a40090b5e.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'bundle' },
  { id:4, title:'Crimson Desert', price:302.86, originalPrice:356.32, discount:15, platforms:['win','mac'], drm:'steam', image:'https://fanatical.imgix.net/product/original/134a0908-1db1-4101-bac3-6c98e09ef7ad.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:5, title:'SILENT HILL f', price:158.79, originalPrice:407.23, discount:61, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/a9bf64b8-a219-4db9-a1e8-37f79e9a2ec8.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game', label:'Recommended for you', labelType:'recommended' },
  { id:6, title:'Resident Evil Requiem', price:292.17, originalPrice:356.32, discount:18, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/5f3f4130-0902-4a6a-9493-d5cf307245dd.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:7, title:'SILENT HILL F - Digital Deluxe', price:178.64, originalPrice:458.14, discount:61, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/44acca9f-1ba3-47c7-aedd-436bb45d984e.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:8, title:'Crimson Desert Digital Deluxe', price:346.14, originalPrice:407.23, discount:15, platforms:['win','mac'], drm:'steam', image:'https://fanatical.imgix.net/product/original/1cafe082-36e3-4a1f-84f7-73fa042dac37.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:9, title:'SILENT HILL 2', price:138.93, originalPrice:356.32, discount:61, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/a91dab37-38d9-4d37-aebe-5daf8fde0ca8.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:10, title:'Build your own Legendary Bundle', price:null, daysLeft:30, platforms:[], drm:'steam', image:'https://fanatical.imgix.net/product/original/71430718-fd01-477c-a9e5-e5302ff6a490.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'bundle' },
  { id:11, title:'Build your own Adrenaline Bundle', price:null, daysLeft:34, platforms:[], drm:'steam', image:'https://fanatical.imgix.net/product/original/141dc784-be02-4956-aeda-6e40c28fc99c.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'bundle', label:'Just Launched', labelType:'launched' },
  { id:12, title:'Kerbal Space Program', price:52.69, originalPrice:188.32, discount:72, platforms:['win','mac','linux'], drm:'steam', image:'https://fanatical.imgix.net/product/original/30e55819-05e0-4bf1-8dfc-13afb14c2aef.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:13, title:"Sid Meier's Civilization® VI Anthology", price:76.31, originalPrice:509.05, discount:85, platforms:['mac','linux'], drm:'steam', image:'https://fanatical.imgix.net/product/original/d9aa1259-3b12-4a3b-a6e9-cbfdb8e4695a.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:14, title:'World War Z', price:50.35, originalPrice:152.68, discount:67, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/4882f445-9429-4e9e-b6da-9f1120048d09.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:15, title:'Resident Evil Requiem Deluxe Edition', price:333.92, originalPrice:407.23, discount:18, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/9bb14e99-b5fa-44ca-8328-3e67dce28371.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:16, title:'Escape from Tarkov', price:203.59, originalPrice:254.50, discount:20, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/9ef9fb90-d0fd-457d-a8f9-47f50aafc2f5.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:17, title:'Monster Hunter Stories 3: Twisted Reflection', price:292.17, originalPrice:356.32, discount:18, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/87855dea-5bdb-4299-9843-0b19959f1454.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:18, title:'DEATH STRANDING 2: ON THE BEACH', price:407.23, originalPrice:null, discount:0, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/b9b89c0b-da8c-4921-9e4f-8b780b20c39a.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:19, title:'Monster Hunter Wilds', price:320.17, originalPrice:356.32, discount:10, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/f5f48a08-909d-496e-809e-af2d1a95c773.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:20, title:'VIP Mystery Bundle - Verified Edition', price:25.40, originalPrice:null, discount:0, platforms:[], drm:'steam', image:'https://fanatical.imgix.net/product/original/bdc70d29-1f9d-474d-b86b-9f0dfc78576a.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'bundle', fromPrice:true },
  { id:21, title:'007 First Light', price:309.99, originalPrice:356.32, discount:13, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/adf832ce-cc7e-429c-88c9-8a097f501e34.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game', label:'Available May 26', labelType:'earlyaccess' },
  { id:22, title:'Assetto Corsa', price:84.46, originalPrice:101.77, discount:17, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/42e44547-be96-45ba-aed8-7204af58f12c.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:23, title:'Victoria 3: Volume 3', price:244.22, originalPrice:null, discount:0, platforms:['win','mac','linux'], drm:'steam', image:'https://fanatical.imgix.net/product/original/16bcfca1-df22-4790-b876-ba104ce4fe84.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'dlc', isDlc:true },
  { id:24, title:"Street Fighter™ 6 - Year 3 Ultimate Pass - DLC", price:211.23, originalPrice:254.50, discount:17, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/ca0f9b71-ce8f-45dc-b854-eba9e19d979a.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'dlc', isDlc:true },
  { id:25, title:'Outer Wilds', price:56.76, originalPrice:117.04, discount:52, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/cb7f5f08-62d7-45a1-a91c-68006e032fbc.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:26, title:'Resident Evil 4 Gold Edition', price:208.68, originalPrice:254.50, discount:18, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/c1c0dcc9-dfe0-492e-ae39-66fb23c2539b.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game', label:'In Library', labelType:'library' },
  { id:27, title:'Game Masters No Prep Book of Random Tables RPG Bundle', price:null, daysLeft:1, platforms:[], drm:'drivethrurpg', image:'https://fanatical.imgix.net/product/original/c78cd86e-ef5c-41bf-9aa3-95a94d3600ff.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'bundle', endingSoon:true },
  { id:28, title:'Marathon', price:146.57, originalPrice:203.59, discount:28, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/90b3b13f-9059-44d9-a05f-7ef0f02e2262.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:29, title:'Nioh 3', price:278.94, originalPrice:407.23, discount:32, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/c9457de4-f17b-47c0-90a3-ab39e6936f27.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:30, title:'Football Manager 26', price:265.70, originalPrice:305.41, discount:13, platforms:['win','mac'], drm:'steam', image:'https://fanatical.imgix.net/product/original/54e3b8a6-2e3e-4961-aef5-eccae049c0cd.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:31, title:'Warhammer 40,000: Rogue Trader - Voidfarer Edition', price:166.22, originalPrice:503.81, discount:67, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/baccae8a-0c22-4b4a-94b0-db0576293d7e.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'bundle' },
  { id:32, title:'Build your own Gamersky All-Stars Bundle', price:null, daysLeft:31, platforms:[], drm:'steam', image:'https://fanatical.imgix.net/product/original/cccc18a3-38a5-4929-a0f3-345aa78d0a8f.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'bundle' },
  { id:33, title:'Resident Evil Remake Trilogy', price:387.22, originalPrice:458.14, discount:15, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/eceaf3f5-e4b2-4b97-ba79-31774ab8adc6.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:34, title:'Street Fighter™ 6', price:166.93, originalPrice:203.59, discount:18, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/b1f60a12-13a9-4658-b18f-9d21c96a510b.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:35, title:'World War Z: Aftermath', price:63.99, originalPrice:173.04, discount:63, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/ab9df80f-3d2c-4e23-9b73-401dcdf01a2c.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
  { id:36, title:'Company of Heroes 3', price:97.95, originalPrice:279.95, discount:65, platforms:['win'], drm:'steam', image:'https://fanatical.imgix.net/product/original/97759890-54f8-4e2d-bb02-1fe0e0a4ada3.jpeg?auto=compress,format&w=307&fit=crop&h=173', type:'game' },
];

const FILTER_SECTIONS = [
  { id:'productType', label:'Product Type', items:[
    { label:'Game', count:'10,722' }, { label:'Bundle', count:'28' },
  ]},
  { id:'platform', label:'Platform', items:[
    { label:'Windows', count:'14,244' }, { label:'Linux', count:'2,445' }, { label:'MacOS', count:'3,934' },
  ]},
  { id:'tag', label:'Tag', searchable:true, items:[
    { label:'Action', count:'3,869' }, { label:'Adventure', count:'3,734' }, { label:'Strategy', count:'2,449' },
    { label:'Casual', count:'2,186' }, { label:'Simulation', count:'2,082' }, { label:'RPG', count:'2,006' },
    { label:'Story Rich', count:'1,972' }, { label:'Exploration', count:'1,472' },
  ]},
  { id:'developer', label:'Developer', searchable:true, items:[
    { label:'Capcom', count:'142' }, { label:'CD Projekt Red', count:'12' }, { label:'FromSoftware', count:'18' },
    { label:'Konami', count:'31' }, { label:'Paradox Interactive', count:'87' }, { label:'Ubisoft', count:'203' },
  ]},
];

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
  const labelCfg = product.label ? LABEL_CONFIG[product.labelType] : null;
  return (
    <div className="sp-card" onClick={() => navigate(`/games/${product.id}`)} style={{ cursor: 'pointer' }}>
      {labelCfg && (
        <div className={`sp-card-label ${labelCfg.cls}`}>
          <span className="sp-card-label-text">{product.label}</span>
          <div className="sp-card-label-slash" />
          <div className={`sp-card-label-triangle sp-card-label-triangle--${product.labelType}`} />
        </div>
      )}
      <div className="sp-card-cover">
        <img src={product.image} alt={product.title} className="sp-card-img" loading="lazy" />
      </div>
      <div className="sp-card-stripe">
        <div className="sp-card-name">{product.title}</div>
        <div className="sp-card-footer">
          <div className="sp-card-purchase">
            {product.daysLeft != null ? (
              <div className={`sp-card-timer ${product.endingSoon ? 'sp-card-timer--ending' : ''}`}>
                {product.daysLeft} Day{product.daysLeft !== 1 ? 's' : ''} Left
              </div>
            ) : product.price != null ? (
              <div className="sp-card-price-wrap">
                {product.discount > 0 && (
                  <span className="sp-card-discount">-{product.discount}%</span>
                )}
                <div className="sp-card-prices">
                  {product.originalPrice && (
                    <span className="sp-card-was">RON {product.originalPrice.toFixed(2)}</span>
                  )}
                  <span className="sp-card-now">
                    {product.fromPrice && <span className="sp-card-from">From </span>}
                    RON {product.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
          <div className="sp-card-meta">
            <div className="sp-card-platforms">
              {product.platforms.includes('win') && <WindowsIcon className="sp-card-os-icon" />}
              {product.platforms.includes('mac') && <AppleIcon className="sp-card-os-icon" />}
              {product.platforms.includes('linux') && <LinuxIcon className="sp-card-os-icon" />}
            </div>
            <div className="sp-card-drm">
              <SteamIcon className="sp-card-os-icon" />
            </div>
            {product.isDlc && <span className="sp-card-dlc">DLC</span>}
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
  const [sortBy, setSortBy] = useState('fan_alt_rank');
  const [perPage, setPerPage] = useState('24');
  const [page, setPage] = useState(1);

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
  };

  const filteredProducts = useMemo(() => {
    let list = [...PRODUCTS];
    if (onSaleOnly) list = list.filter(p => p.discount > 0);
    if (priceFilter === 'under5') list = list.filter(p => p.price != null && p.price < 24.73);
    else if (priceFilter === '5to10') list = list.filter(p => p.price != null && p.price >= 24.73 && p.price < 49.50);
    else if (priceFilter === '10to20') list = list.filter(p => p.price != null && p.price >= 49.50 && p.price < 99);
    else if (priceFilter === 'over20') list = list.filter(p => p.price != null && p.price >= 99);
    return list;
  }, [onSaleOnly, priceFilter]);

  const ITEMS_PER_PAGE = parseInt(perPage);
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const pageProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

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
              Showing <strong>{filteredProducts.length.toLocaleString()}</strong> Products
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
              <select className="sp-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="fan_alt_rank">Top Sellers</option>
                <option value="fan_price_asc">Price: Low to High</option>
                <option value="fan_price_desc">Price: High to Low</option>
                <option value="fan_name">Alphabetical</option>
                <option value="fan_discount">Top Discount</option>
                <option value="fan_latest">Latest Deals</option>
                <option value="fan_ending">Ending Soon</option>
                <option value="fan_wanted">Most Wanted</option>
                <option value="fan_release">Release: Newest</option>
                <option value="fan_rated">Top Rated</option>
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
                        { val:'under5',  label:'Under €5.00' },
                        { val:'5to10',   label:'€5.00 - €9.99' },
                        { val:'10to20',  label:'€10.00 - €19.99' },
                        { val:'over20',  label:'Over €20.00' },
                        { val:'all',     label:'All' },
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

              {FILTER_SECTIONS.map(section => (
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
            <div className="sp-grid">
              {pageProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
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
          </div>
        </div>
      </div>
    </div>
  );
};
