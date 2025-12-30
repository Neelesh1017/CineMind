require('dotenv').config();
const fs = require('fs');
const csv = require('csv-parser');
const db = require('./db');

async function seedDatabase() {
  console.log('Starting database seeding...');
  
  const connection = await db.getConnection();
  
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0');
    await connection.execute('TRUNCATE TABLE movie_keywords');
    await connection.execute('TRUNCATE TABLE movie_genres');
    await connection.execute('TRUNCATE TABLE movie_companies');
    await connection.execute('TRUNCATE TABLE keywords');
    await connection.execute('TRUNCATE TABLE genres');
    await connection.execute('TRUNCATE TABLE production_companies');
    await connection.execute('TRUNCATE TABLE movies');
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    const movies = [];
    const genresMap = new Map();
    const keywordsMap = new Map();
    const companiesMap = new Map();
    
    // Read CSV file
    console.log('Reading CSV file...');
    await new Promise((resolve, reject) => {
      fs.createReadStream('tmdb_5000_movies1.csv')
        .pipe(csv())
        .on('data', (row) => {
          movies.push(row);
        })
        .on('end', resolve)
        .on('error', reject);
    });
    
    console.log(`Loaded ${movies.length} movies from CSV`);
    
    // Process movies
    let genreIdCounter = 1;
    let keywordIdCounter = 1;
    let companyIdCounter = 1;
    
    for (let i = 0; i < movies.length; i++) {
      const movie = movies[i];
      
      if (i % 500 === 0) {
        console.log(`Processing movie ${i + 1}/${movies.length}...`);
      }
      
      // Parse JSON fields
      let genres = [];
      let keywords = [];
      let companies = [];
      
      try {
        if (movie.genres) {
          genres = JSON.parse(movie.genres.replace(/'/g, '"'));
        }
      } catch (e) {
        genres = [];
      }
      
      try {
        if (movie.keywords) {
          keywords = JSON.parse(movie.keywords.replace(/'/g, '"'));
        }
      } catch (e) {
        keywords = [];
      }
      
      try {
        if (movie.production_companies) {
          companies = JSON.parse(movie.production_companies.replace(/'/g, '"'));
        }
      } catch (e) {
        companies = [];
      }
      
      // Insert movie
      const releaseDate = movie.release_date || null;
      const runtime = movie.runtime ? parseFloat(movie.runtime) : null;
      const budget = movie.budget ? parseInt(movie.budget) : 0;
      const revenue = movie.revenue ? parseInt(movie.revenue) : 0;
      const popularity = movie.popularity ? parseFloat(movie.popularity) : 0;
      const voteAverage = movie.vote_average ? parseFloat(movie.vote_average) : 0;
      const voteCount = movie.vote_count ? parseInt(movie.vote_count) : 0;
      
      await connection.execute(
        `INSERT INTO movies (id, title, original_title, overview, tagline, release_date, 
         runtime, budget, revenue, popularity, vote_average, vote_count, 
         original_language, status, homepage) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          parseInt(movie.id),
          movie.title,
          movie.original_title,
          movie.overview,
          movie.tagline,
          releaseDate,
          runtime,
          budget,
          revenue,
          popularity,
          voteAverage,
          voteCount,
          movie.original_language,
          movie.status,
          movie.homepage
        ]
      );
      
      // Process genres
      for (const genre of genres) {
        if (!genresMap.has(genre.name)) {
          genresMap.set(genre.name, genre.id || genreIdCounter++);
          await connection.execute(
            'INSERT IGNORE INTO genres (id, name) VALUES (?, ?)',
            [genresMap.get(genre.name), genre.name]
          );
        }
        
        await connection.execute(
          'INSERT IGNORE INTO movie_genres (movie_id, genre_id) VALUES (?, ?)',
          [parseInt(movie.id), genresMap.get(genre.name)]
        );
      }
      
      // Process keywords
      for (const keyword of keywords) {
        if (!keywordsMap.has(keyword.name)) {
          keywordsMap.set(keyword.name, keyword.id || keywordIdCounter++);
          await connection.execute(
            'INSERT IGNORE INTO keywords (id, name) VALUES (?, ?)',
            [keywordsMap.get(keyword.name), keyword.name]
          );
        }
        
        await connection.execute(
          'INSERT IGNORE INTO movie_keywords (movie_id, keyword_id) VALUES (?, ?)',
          [parseInt(movie.id), keywordsMap.get(keyword.name)]
        );
      }
      
      // Process production companies
      for (const company of companies) {
        if (!companiesMap.has(company.name)) {
          companiesMap.set(company.name, company.id || companyIdCounter++);
          await connection.execute(
            'INSERT IGNORE INTO production_companies (id, name) VALUES (?, ?)',
            [companiesMap.get(company.name), company.name]
          );
        }
        
        await connection.execute(
          'INSERT IGNORE INTO movie_companies (movie_id, company_id) VALUES (?, ?)',
          [parseInt(movie.id), companiesMap.get(company.name)]
        );
      }
    }
    
    console.log('✓ Database seeding completed successfully!');
    console.log(`  - Movies: ${movies.length}`);
    console.log(`  - Genres: ${genresMap.size}`);
    console.log(`  - Keywords: ${keywordsMap.size}`);
    console.log(`  - Companies: ${companiesMap.size}`);
    
  } catch (error) {
    console.error('✗ Seeding error:', error);
  } finally {
    connection.release();
    process.exit();
  }
}

seedDatabase();