import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Movie, Genre, FilterOption } from '../types';
import { TMDBService } from '../api/api';
import { getImageUrl } from '../api/api';
import './GalleryView.css';

const GalleryView: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<FilterOption[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try API; if it fails, surface error
      try {
        const [moviesResponse, genresResponse] = await Promise.all([
          TMDBService.getPopularMovies(),
          TMDBService.getGenres()
        ]);
        setMovies(moviesResponse.results);
        setGenres(genresResponse.genres);
      } catch (apiError) {
        throw apiError;
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Initialize genre filters
  useEffect(() => {
    if (genres.length > 0 && selectedGenres.length === 0) {
      setSelectedGenres(genres.map(genre => ({
        id: genre.id,
        name: genre.name,
        selected: false
      })));
    }
  }, [genres, selectedGenres.length]);

  const filteredMovies = useMemo(() => {
    const selectedGenreIds = selectedGenres
      .filter(genre => genre.selected)
      .map(genre => genre.id);

    if (selectedGenreIds.length === 0) {
      return movies;
    }

    return movies.filter(movie =>
      movie.genre_ids.some(genreId => selectedGenreIds.includes(genreId))
    );
  }, [movies, selectedGenres]);

  const handleGenreToggle = (genreId: number) => {
    setSelectedGenres(prev =>
      prev.map(genre =>
        genre.id === genreId
          ? { ...genre, selected: !genre.selected }
          : genre
      )
    );
  };

  const clearFilters = () => {
    setSelectedGenres(prev =>
      prev.map(genre => ({ ...genre, selected: false }))
    );
  };

  if (loading) {
    return (
      <div className="gallery-view">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-view">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="gallery-view">
      <div className="gallery-header">
        <h2>Movie Gallery</h2>
        
        <div className="filters-section">
          <h3>Filter by Genre</h3>
          <div className="genre-filters">
            {selectedGenres.map(genre => (
              <button
                key={genre.id}
                onClick={() => handleGenreToggle(genre.id)}
                className={`genre-filter ${genre.selected ? 'active' : ''}`}
              >
                {genre.name}
              </button>
            ))}
          </div>
          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="gallery-grid">
        {filteredMovies.map(movie => (
          <Link key={movie.id} to={`/movie/${movie.id}`} className="gallery-item">
            <div className="gallery-poster">
              <img
                src={getImageUrl(movie.poster_path, 'w300')}
                alt={movie.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-movie.png';
                }}
              />
              <div className="gallery-overlay">
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-rating">⭐ {movie.vote_average.toFixed(1)}</p>
                  <p className="movie-date">{movie.release_date}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div className="no-results">
          No matching movies found
        </div>
      )}
    </div>
  );
};

export default GalleryView;
