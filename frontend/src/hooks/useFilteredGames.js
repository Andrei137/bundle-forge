import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export const useFilteredGames = () => {
  const games = useSelector(state => state.games.all);
  const filters = useSelector(state => state.filters);

  return useMemo(() => {
    let filtered = [...games];

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(query) ||
        game.category.toLowerCase().includes(query) ||
        game.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by categories
    if (filters.selectedCategories.length > 0) {
      filtered = filtered.filter(game =>
        filters.selectedCategories.includes(game.category)
      );
    }

    // Filter by platforms
    if (filters.selectedPlatforms.length > 0) {
      filtered = filtered.filter(game =>
        game.platforms.some(platform =>
          filters.selectedPlatforms.includes(platform)
        )
      );
    }

    // Filter by price range
    filtered = filtered.filter(game =>
      game.price >= filters.priceRange[0] && game.price <= filters.priceRange[1]
    );

    // Sort
    switch (filters.sortBy) {
      case 'price-low-high':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return filtered;
  }, [games, filters]);
};
