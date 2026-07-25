/**
 * games.js
 * Business rules related to games: active code counts,
 * list of available categories, sorting.
 * Doesn't touch the DOM — only receives/returns data.
 */

import { Codes } from './codes.js';

export const Games = {

  /**
   * Enriches each game with computed data (active codes, last verified).
   */
  withComputedFields(games, codesMap) {
    return games.map(game => {
      const codes = codesMap[game.id] || [];

      const activeCount = codes.filter(code => {
        if (code.status === 'active') return true;

        if (!code.expires) return true;

        return new Date(code.expires) >= new Date();
      }).length;

      const lastVerified = Codes.mostRecentVerification(codes);

      return {
        ...game,
        activeCount,
        lastVerified,
      };
    });
  },


  /**
   * Extracts the list of categories present in the games, with counts.
   */
  extractCategories(games) {
    const counts = new Map();

    games.forEach(game => {
      counts.set(
        game.category,
        (counts.get(game.category) || 0) + 1
      );
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({
        name,
        count
      }))
      .sort((a, b) => b.count - a.count);
  },


  /**
   * Sort games.
   */
  sort(games, mode) {
    const list = [...games];

    switch (mode) {

      case 'popular':
        return list.sort(
          (a, b) => b.popularity - a.popularity
        );

      case 'recent':
        return list.sort(
          (a, b) =>
            new Date(b.lastVerified || 0) -
            new Date(a.lastVerified || 0)
        );

      case 'az':
        return list.sort(
          (a, b) =>
            a.name.localeCompare(b.name, 'en-US')
        );

      default:
        return list;
    }
  },


  /**
   * Find game by ID.
   */
  findById(games, id) {
    return games.find(
      game => game.id === id
    );
  },

};
