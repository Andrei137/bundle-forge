import { GameCard } from './GameCard';
import { useFilteredGames } from '../hooks/useFilteredGames';
import './GameGrid.css';

export const GameGrid = () => {
  const filteredGames = useFilteredGames();

  if (filteredGames.length === 0) {
    return (
      <div className="games-container">
        <div className="no-results">
          <div className="no-results-icon">🎮</div>
          <h2>No games found</h2>
          <p>Try adjusting your filters or search for something else</p>
        </div>
      </div>
    );
  }

  return (
    <div className="games-container">
      <div className="games-header">
        <h2>Available Games</h2>
        <p className="games-count">Showing {filteredGames.length} games</p>
      </div>
      <div className="games-grid">
        {filteredGames.map(game => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};
