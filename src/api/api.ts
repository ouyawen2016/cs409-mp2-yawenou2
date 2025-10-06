import axios from 'axios';
import { Movie, MovieDetails, TMDBResponse, Genre } from '../types';

const ACCESS_TOKEN = process.env.REACT_APP_TMDB_TOKEN;  

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    accept: 'application/json'
  },
});

// Use v4 token for Authorization header only

api.defaults.headers.common.Authorization = `Bearer ${ACCESS_TOKEN}`;


export class TMDBService {
  // fetch popular movies
  static async getPopularMovies(page: number = 1): Promise<TMDBResponse<Movie>> {
    try {
      const response = await api.get('/movie/popular', {
        params: { page }
      });
      return response.data;
    } catch (error) {
      console.error('failed to fetch popular movies:', error);
      throw error;
    }
  }

  // search movies
  static async searchMovies(query: string, page: number = 1): Promise<TMDBResponse<Movie>> {
    try {
      const response = await api.get('/search/movie', {
        params: { query, page }
      });
      return response.data;
    } catch (error) {
      console.error('search movies failed:', error);
      throw error;
    }
  }

  // get movie details by id
  static async getMovieDetails(id: number): Promise<MovieDetails> {
    try {
      const response = await api.get(`/movie/${id}`);
      return response.data;
    } catch (error) {
      console.error('get movie details failed:', error);
      throw error;
    }
  }

  // Fetch genres
  static async getGenres(): Promise<{ genres: Genre[] }> {
    try {
      const response = await api.get('/genre/movie/list');
      return response.data;
    } catch (error) {
      console.error('failed to fetch genres:', error);
      throw error;
    }
  }

  // Fetch movies by genre
  static async getMoviesByGenre(genreId: number, page: number = 1): Promise<TMDBResponse<Movie>> {
    try {
      const response = await api.get('/discover/movie', {
        params: { 
          with_genres: genreId,
          page 
        }
      });
      return response.data;
    } catch (error) {
      console.error('failed to fetch movies by genre:', error);
      throw error;
    }
  }
}

export const getImageUrl = (path: string | null, size: 'w200' | 'w300' | 'w500' | 'original' = 'w300'): string => {
  if (!path) return '/placeholder-movie.png';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

