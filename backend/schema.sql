-- Create database
CREATE DATABASE IF NOT EXISTS movie_recommendation;
USE movie_recommendation;

-- Movies table
CREATE TABLE IF NOT EXISTS movies (
  id INT PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  original_title VARCHAR(500),
  overview TEXT,
  tagline TEXT,
  release_date DATE,
  runtime FLOAT,
  budget BIGINT,
  revenue BIGINT,
  popularity FLOAT,
  vote_average FLOAT,
  vote_count INT,
  original_language VARCHAR(10),
  status VARCHAR(50),
  homepage VARCHAR(500),
  INDEX idx_title (title),
  INDEX idx_popularity (popularity),
  INDEX idx_vote_average (vote_average),
  INDEX idx_release_date (release_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Genres table
CREATE TABLE IF NOT EXISTS genres (
  id INT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Movie-Genre junction table
CREATE TABLE IF NOT EXISTS movie_genres (
  movie_id INT,
  genre_id INT,
  PRIMARY KEY (movie_id, genre_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE,
  INDEX idx_movie (movie_id),
  INDEX idx_genre (genre_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Keywords table
CREATE TABLE IF NOT EXISTS keywords (
  id INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Movie-Keyword junction table
CREATE TABLE IF NOT EXISTS movie_keywords (
  movie_id INT,
  keyword_id INT,
  PRIMARY KEY (movie_id, keyword_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (keyword_id) REFERENCES keywords(id) ON DELETE CASCADE,
  INDEX idx_movie (movie_id),
  INDEX idx_keyword (keyword_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Production Companies table
CREATE TABLE IF NOT EXISTS production_companies (
  id INT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Movie-Production Company junction table
CREATE TABLE IF NOT EXISTS movie_companies (
  movie_id INT,
  company_id INT,
  PRIMARY KEY (movie_id, company_id),
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES production_companies(id) ON DELETE CASCADE,
  INDEX idx_movie (movie_id),
  INDEX idx_company (company_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;