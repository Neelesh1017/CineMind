import { useState } from 'react';
import axios from 'axios';

function SearchBar({ onSearchResult, onSearchStart, onSearchError }) {
  const [query, setQuery] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      onSearchError('Please enter a movie title');
      return;
    }

    onSearchStart();

    try {
      const response = await axios.get(`/api/search?query=${encodeURIComponent(query)}`);
      onSearchResult(response.data);
    } catch (error) {
      console.error('Search error:', error);
      onSearchError('Failed to fetch recommendations. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a movie... (e.g., Avatar, Inception, Interstellar)"
          className="w-full px-6 py-4 text-lg rounded-full bg-white/10 backdrop-blur-sm text-white placeholder-gray-400 border-2 border-transparent focus:border-highlight focus:outline-none transition-all duration-300"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-highlight hover:bg-highlight/90 text-white px-8 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105"
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchBar;