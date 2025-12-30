require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Search movies and get recommendations
app.get('/api/search', async (req, res) => {
  const { query } = req.query;
  
  if (!query) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const connection = await db.getConnection();
    
    // IMPROVED SEARCH: Search in title, overview, genres, and keywords
    const [searchResults] = await connection.execute(
      `SELECT DISTINCT m.* FROM movies m
       LEFT JOIN movie_genres mg ON m.id = mg.movie_id
       LEFT JOIN genres g ON mg.genre_id = g.id
       LEFT JOIN movie_keywords mk ON m.id = mk.movie_id
       LEFT JOIN keywords k ON mk.keyword_id = k.id
       WHERE m.title LIKE ? 
          OR m.overview LIKE ?
          OR g.name LIKE ?
          OR k.name LIKE ?
       ORDER BY m.popularity DESC
       LIMIT 1`,
      [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
    );

    if (searchResults.length === 0) {
      connection.release();
      return res.json({ searchedMovie: null, recommendations: [] });
    }

    const searchedMovie = searchResults[0];
    
    // Get genres for the searched movie
    const [movieGenres] = await connection.execute(
      `SELECT g.name FROM genres g
       JOIN movie_genres mg ON g.id = mg.genre_id
       WHERE mg.movie_id = ?`,
      [searchedMovie.id]
    );

    // Get keywords for the searched movie
    const [movieKeywords] = await connection.execute(
      `SELECT k.name FROM keywords k
       JOIN movie_keywords mk ON k.id = mk.keyword_id
       WHERE mk.movie_id = ?`,
      [searchedMovie.id]
    );

    const genreNames = movieGenres.map(g => g.name);
    const keywordNames = movieKeywords.map(k => k.name);

    // IMPROVED SQL-based similarity query with better scoring
    const [recommendations] = await connection.execute(
      `SELECT DISTINCT m.*,
        (
          -- Genre matching score (3 points per match - increased weight)
          (SELECT COUNT(*) * 3 FROM movie_genres mg1
           JOIN movie_genres mg2 ON mg1.genre_id = mg2.genre_id
           WHERE mg1.movie_id = m.id AND mg2.movie_id = ?) +
          
          -- Keyword matching score (2 points per match - increased weight)
          (SELECT COUNT(*) * 2 FROM movie_keywords mk1
           JOIN movie_keywords mk2 ON mk1.keyword_id = mk2.keyword_id
           WHERE mk1.movie_id = m.id AND mk2.movie_id = ?) +
          
          -- Release year proximity (2 points if within 3 years, 1 point if within 5 years)
          (CASE 
            WHEN ABS(YEAR(m.release_date) - YEAR(?)) <= 3 THEN 2
            WHEN ABS(YEAR(m.release_date) - YEAR(?)) <= 5 THEN 1
            ELSE 0 
          END) +
          
          -- Rating similarity (2 points if within 1.0 rating, 1 point if within 2.0)
          (CASE 
            WHEN ABS(m.vote_average - ?) <= 1.0 THEN 2
            WHEN ABS(m.vote_average - ?) <= 2.0 THEN 1
            ELSE 0 
          END) +
          
          -- Popularity bonus (1 point if both are popular)
          (CASE WHEN m.popularity > 10 AND ? > 10 THEN 1 ELSE 0 END)
          
        ) AS similarity_score
       FROM movies m
       WHERE m.id != ?
       HAVING similarity_score > 0
       ORDER BY similarity_score DESC, m.vote_average DESC, m.popularity DESC
       LIMIT 5`,
      [
        searchedMovie.id, 
        searchedMovie.id, 
        searchedMovie.release_date,
        searchedMovie.release_date,
        searchedMovie.vote_average,
        searchedMovie.vote_average,
        searchedMovie.popularity,
        searchedMovie.id
      ]
    );

    // Get genres and keywords for each recommendation
    for (let movie of recommendations) {
      const [genres] = await connection.execute(
        `SELECT g.name FROM genres g
         JOIN movie_genres mg ON g.id = mg.genre_id
         WHERE mg.movie_id = ?`,
        [movie.id]
      );
      
      const [keywords] = await connection.execute(
        `SELECT k.name FROM keywords k
         JOIN movie_keywords mk ON k.id = mk.keyword_id
         WHERE mk.movie_id = ?
         LIMIT 5`,
        [movie.id]
      );
      
      movie.genres = genres.map(g => g.name);
      movie.keywords = keywords.map(k => k.name);
    }

    // Get genres and keywords for searched movie
    searchedMovie.genres = genreNames;
    searchedMovie.keywords = keywordNames.slice(0, 5);

    connection.release();

    res.json({
      searchedMovie,
      recommendations
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all movie titles for autocomplete (improved with more details)
app.get('/api/movies/titles', async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [movies] = await connection.execute(
      'SELECT id, title, release_date FROM movies ORDER BY popularity DESC LIMIT 1000'
    );
    connection.release();
    res.json(movies);
  } catch (error) {
    console.error('Error fetching titles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});