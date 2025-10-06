import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Movie, SortOption } from '../types';
import { TMDBService } from '../api/api';
import { getImageUrl } from '../api/api';
import './ListView.css';

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightMatch = (text: string, query: string) => {
  if (!query) return text;
  const safe = escapeRegExp(query);
  const regex = new RegExp(`(${safe})`, 'ig');
  const parts = text.split(regex);
  return parts.map((part, index) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={index}>{part}</mark>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    )
  );
};

const ListView: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<keyof Movie>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const sortOptions: SortOption[] = [
    { key: 'title', label: 'Title' },
    { key: 'release_date', label: 'Release Date' },
    { key: 'vote_average', label: 'Rating' },
    { key: 'popularity', label: 'Popularity' }
  ];

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      // Try API; if it fails, surface error
      try {
        const response = await TMDBService.getPopularMovies();
        setMovies(response.results);
      } catch (apiError) {
        throw apiError;
      }
    } catch (err) {
      setError('Failed to load movies');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedMovies = useMemo(() => {
    let filtered = movies.filter(movie =>
      movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie.overview.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === 'asc' ? -1 : 1;
      if (bValue == null) return sortOrder === 'asc' ? 1 : -1;

     
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [movies, searchQuery, sortBy, sortOrder]);

  const currentResultIds = useMemo(() => filteredAndSortedMovies.map(m => m.id), [filteredAndSortedMovies]);

  if (loading) {
    return (
      <div className="list-view">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="list-view">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="list-view">
      <div className="list-header">
        <h2>Movie List</h2>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-container">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as keyof Movie)}
            className="sort-select"
          >
            {sortOptions.map(option => (
              <option key={option.key} value={option.key}>
                Sort by {option.label}
              </option>
            ))}
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="sort-order-btn"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      <div className="movies-grid">
        {filteredAndSortedMovies.map(movie => (
          <Link
            key={movie.id}
            to={`/movie/${movie.id}`}
            state={{ resultIds: currentResultIds }}
            className="movie-card"
          >
            <div className="movie-poster">
              <img
                src={getImageUrl(movie.poster_path)}
                alt={movie.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-movie.png';
                }}
              />
            </div>
            <div className="movie-info">
              <h3 className="movie-title">{highlightMatch(movie.title, searchQuery)}</h3>
              <p className="movie-date">{movie.release_date}</p>
              <p className="movie-rating">⭐ {movie.vote_average.toFixed(1)}</p>
              <p className="movie-overview">{highlightMatch(movie.overview.substring(0, 100), searchQuery)}...</p>
            </div>
          </Link>
        ))}
      </div>

      {filteredAndSortedMovies.length === 0 && (
        <div className="no-results">
          No matching movies found
        </div>
      )}
    </div>
  );
};

export default ListView;
