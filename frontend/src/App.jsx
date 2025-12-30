import { useState } from 'react';
import SearchBar from './components/SearchBar';
import MovieResults from './components/MovieResults';

function App() {
  const [searchedMovie, setSearchedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = (data) => {
    if (data.searchedMovie) {
      setSearchedMovie(data.searchedMovie);
      setRecommendations(data.recommendations);
      setError(null);
    } else {
      setSearchedMovie(null);
      setRecommendations([]);
      setError('No movie found. Try a different search term.');
    }
    setLoading(false);
  };

  const handleSearchStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleSearchError = (errorMsg) => {
    setError(errorMsg);
    setLoading(false);
    setSearchedMovie(null);
    setRecommendations([]);
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">
            Movie Recommendation System
          </h1>
          <p className="text-gray-300 text-lg">
            Discover movies similar to your favorites
          </p>
        </header>

        {/* Search Bar */}
        <SearchBar
          onSearchResult={handleSearch}
          onSearchStart={handleSearchStart}
          onSearchError={handleSearchError}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center mt-12">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-highlight"></div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-8 bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && searchedMovie && (
          <MovieResults
            searchedMovie={searchedMovie}
            recommendations={recommendations}
          />
        )}

        {/* Empty State */}
        {!loading && !error && !searchedMovie && (
          <div className="mt-16 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-gray-400 text-lg">
              Search for a movie to get personalized recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;