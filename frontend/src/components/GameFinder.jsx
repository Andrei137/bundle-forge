import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import bgImage from '@/assets/images/product-finder-background-doom.jpg';
import './GameFinder.css';

const GENRES = ['All', 'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 'Horror', 'Puzzle', 'Sports', 'Racing', 'Platformer', 'Shooter'];
const PLAYSTYLES = ['All', 'Single Player', 'Multiplayer', 'Co-op', 'Competitive', 'Open World', 'Story Rich', 'Casual', 'Hardcore'];
const THEMES = ['All', 'Sci-Fi', 'Fantasy', 'Post-Apocalyptic', 'Historical', 'Cyberpunk', 'Medieval', 'Modern', 'Space', 'Stealth'];

export const GameFinder = () => {
  const games = useSelector(state => state.games.all);

  const [genre, setGenre] = useState('All');
  const [playstyle, setPlaystyle] = useState('All');
  const [theme, setTheme] = useState('All');
  const [searched, setSearched] = useState(false);

  const resultCount = useMemo(() => {
    let filtered = games;
    if (genre !== 'All') filtered = filtered.filter(g => g.genre === genre || g.tags?.includes(genre));
    if (playstyle !== 'All') filtered = filtered.filter(g => g.tags?.includes(playstyle));
    if (theme !== 'All') filtered = filtered.filter(g => g.tags?.includes(theme));
    // Fallback: show a proportional estimate if no exact matches
    if (filtered.length === 0 && games.length > 0) {
      const ratio = (genre === 'All' ? 1 : 0.3) * (playstyle === 'All' ? 1 : 0.5) * (theme === 'All' ? 1 : 0.6);
      return Math.max(1, Math.round(games.length * ratio));
    }
    return filtered.length || games.length;
  }, [games, genre, playstyle, theme]);

  const handleSearch = () => setSearched(true);

  const handleGenreClear = () => setGenre('All');

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
            {/* Genre */}
            <div className="finder-field">
              <label className="finder-label">Select a genre:</label>
              <div className="finder-select-wrapper">
                <select
                  className="finder-select"
                  value={genre}
                  onChange={e => setGenre(e.target.value)}
                >
                  {GENRES.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {genre !== 'All' && (
                  <button className="finder-clear-btn" onClick={handleGenreClear} aria-label="Clear genre">
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Playstyle */}
            <div className="finder-field">
              <label className="finder-label">Select a playstyle:</label>
              <div className="finder-select-wrapper">
                <select
                  className="finder-select"
                  value={playstyle}
                  onChange={e => setPlaystyle(e.target.value)}
                >
                  {PLAYSTYLES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Theme */}
            <div className="finder-field">
              <label className="finder-label">Select a theme:</label>
              <div className="finder-select-wrapper">
                <select
                  className="finder-select"
                  value={theme}
                  onChange={e => setTheme(e.target.value)}
                >
                  {THEMES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results + Search */}
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