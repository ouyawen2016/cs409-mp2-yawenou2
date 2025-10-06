import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { MovieDetails, Movie } from '../types';
import { TMDBService } from '../api/api';
import { getImageUrl } from '../api/api';
import './MovieDetail.css';

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as { resultIds?: number[] } | null) || null;
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const resultIds: number[] | null = state?.resultIds || null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadMovieDetails(parseInt(id));
      // If no resultIds passed, load default list for navigation fallback
      if (!resultIds) {
        loadAllMovies();
      }
    }
  }, [id, resultIds]);

  const loadMovieDetails = async (movieId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const movieDetails = await TMDBService.getMovieDetails(movieId);
        setMovie(movieDetails);
      } catch (apiError) {
        throw apiError;
      }
    } catch (err) {
      setError('Failed to load movie details');
    } finally {
      setLoading(false);
    }
  };

  const loadAllMovies = async () => {
    try {
      const response = await TMDBService.getPopularMovies();
      setAllMovies(response.results);
    } catch (err) {
      setAllMovies([]);
    }
  };

  const getSequence = (): number[] => {
    if (resultIds && resultIds.length > 0) return resultIds;
    return allMovies.map(m => m.id);
  };

  const getCurrentIndex = () => {
    const ids = getSequence();
    return ids.findIndex(movieId => movieId === parseInt(id || '0'));
  };

  const goToPrevious = () => {
    const ids = getSequence();
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      const previousId = ids[currentIndex - 1];
      navigate(`/movie/${previousId}`, { state: { resultIds: ids } });
    }
  };

  const goToNext = () => {
    const ids = getSequence();
    const currentIndex = getCurrentIndex();
    if (currentIndex < ids.length - 1) {
      const nextId = ids[currentIndex + 1];
      navigate(`/movie/${nextId}`, { state: { resultIds: ids } });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="movie-detail">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-detail">
        <div className="error">{error || 'Movie not found'}</div>
        <Link to="/" className="back-link">Back to Home</Link>
      </div>
    );
  }

  const sequenceIds = getSequence();
  const currentIndex = getCurrentIndex();
  const canGoPrevious = currentIndex > 0;
  const canGoNext = currentIndex < sequenceIds.length - 1;

  return (
    <div className="movie-detail">
      <div className="detail-header">
        <Link to="/" className="back-link">← Back to List</Link>
        <div className="navigation-buttons">
          <button
            onClick={goToPrevious}
            disabled={!canGoPrevious}
            className="nav-btn prev-btn"
          >
            ← Previous
          </button>
          <button
            onClick={goToNext}
            disabled={!canGoNext}
            className="nav-btn next-btn"
          >
            Next →
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-poster">
          <img
            src={getImageUrl(movie.backdrop_path, 'original')}
            alt={movie.title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-backdrop.png';
            }}
          />
        </div>

        <div className="detail-info">
          <h1 className="movie-title">{movie.title}</h1>
          {movie.tagline && <p className="movie-tagline">"{movie.tagline}"</p>}
          
          <div className="movie-meta">
            <div className="meta-item">
              <span className="meta-label">Release Date:</span>
              <span className="meta-value">{movie.release_date}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Rating:</span>
              <span className="meta-value">⭐ {movie.vote_average.toFixed(1)} ({movie.vote_count} votes)</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Runtime:</span>
              <span className="meta-value">{formatRuntime(movie.runtime)}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Status:</span>
              <span className="meta-value">{movie.status}</span>
            </div>
          </div>

          <div className="genres">
            <span className="genres-label">Genres:</span>
            <div className="genres-list">
              {movie.genres.map(genre => (
                <span key={genre.id} className="genre-tag">
                  {genre.name}
                </span>
              ))}
            </div>
          </div>

          <div className="movie-overview">
            <h3>Overview</h3>
            <p>{movie.overview}</p>
          </div>

          <div className="production-info">
            <div className="production-section">
              <h4>Production Companies</h4>
              <div className="production-list">
                {movie.production_companies.map(company => (
                  <span key={company.id} className="production-item">
                    {company.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="production-section">
              <h4>Production Countries</h4>
              <div className="production-list">
                {movie.production_countries.map(country => (
                  <span key={country.iso_3166_1} className="production-item">
                    {country.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="production-section">
              <h4>Languages</h4>
              <div className="production-list">
                {movie.spoken_languages.map(language => (
                  <span key={language.iso_639_1} className="production-item">
                    {language.english_name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="financial-info">
            <div className="financial-item">
              <span className="financial-label">Budget:</span>
              <span className="financial-value">{formatCurrency(movie.budget)}</span>
            </div>
            <div className="financial-item">
              <span className="financial-label">Revenue:</span>
              <span className="financial-value">{formatCurrency(movie.revenue)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
