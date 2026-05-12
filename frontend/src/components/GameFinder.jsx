import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '@/assets/images/product-finder-background-doom.jpg';
import './GameFinder.css';

const API_URL = import.meta.env.VITE_API_URL;
const PLATFORMS = ['All', 'Windows', 'Linux', 'MacOS'];

export const GameFinder = () => {
  const navigate = useNavigate();

  const [tags, setTags] = useState([]);
  const [developers, setDevelopers] = useState([]);

  const [tag, setTag] = useState('All');
  const [platform, setPlatform] = useState('All');
  const [developer, setDeveloper] = useState('All');

  useEffect(() => {
    fetch(`${API_URL}/tags`)
      .then(r => r.json())
      .then(data => setTags(Array.isArray(data) ? data : []))
      .catch(() => {});

    fetch(`${API_URL}/developers`)
      .then(r => r.json())
      .then(data => setDevelopers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (tag !== 'All') params.append('f', `tag:${tag}`);
    if (platform !== 'All') params.append('f', `platform:${platform}`);
    if (developer !== 'All') params.append('f', `developer:${developer}`);
    window.scrollTo(0, 0);
    navigate(`/search?${params}`);
  };

  return (
    <section className="game-finder">
      <div className="game-finder-bg" style={{ backgroundImage: `url(${bgImage})` }} />
      <div className="game-finder-overlay" />

      <div className="game-finder-container">
        <div className="game-finder-hero">
          <h2 className="game-finder-title">Bundle Forge Game Finder</h2>
          <p className="game-finder-subtitle">
            Do you need help finding your next game? Use the filters below and we'll help you browse through 10,000+ games for something you will love!
          </p>
        </div>

        <div className="game-finder-panel">
          <div className="finder-filters">
            <div className="finder-field">
              <label className="finder-label">Select a tag:</label>
              <div className="finder-select-wrapper">
                <select className="finder-select" value={tag} onChange={e => setTag(e.target.value)}>
                  <option value="All">All</option>
                  {tags.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
                {tag !== 'All' && (
                  <button className="finder-clear-btn" onClick={() => setTag('All')} aria-label="Clear tag">✕</button>
                )}
              </div>
            </div>

            <div className="finder-field">
              <label className="finder-label">Select a platform:</label>
              <div className="finder-select-wrapper">
                <select className="finder-select" value={platform} onChange={e => setPlatform(e.target.value)}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {platform !== 'All' && (
                  <button className="finder-clear-btn" onClick={() => setPlatform('All')} aria-label="Clear platform">✕</button>
                )}
              </div>
            </div>

            <div className="finder-field">
              <label className="finder-label">Select a developer:</label>
              <div className="finder-select-wrapper">
                <select className="finder-select" value={developer} onChange={e => setDeveloper(e.target.value)}>
                  <option value="All">All</option>
                  {developers.map(d => <option key={d.id} value={d.displayName}>{d.displayName}</option>)}
                </select>
                {developer !== 'All' && (
                  <button className="finder-clear-btn" onClick={() => setDeveloper('All')} aria-label="Clear developer">✕</button>
                )}
              </div>
            </div>

            <div className="finder-action">
              <button className="finder-search-btn" onClick={handleSearch}>
                SEARCH
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
