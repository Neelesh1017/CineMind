function MovieCard({ movie, isSearched = false }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatRuntime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <div className={`bg-gradient-to-br from-secondary to-accent rounded-xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-highlight/50 ${isSearched ? 'border-2 border-highlight' : ''}`}>
      {isSearched && (
        <div className="bg-highlight text-white text-center py-2 font-semibold text-sm">
          YOUR SEARCH
        </div>
      )}
      
      <div className="p-6">
        {/* Title */}
        <h3 className="text-2xl font-bold text-white mb-2 line-clamp-2">
          {movie.title}
        </h3>

        {/* Rating and Year */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-xl">⭐</span>
            <span className="text-white font-semibold">{movie.vote_average?.toFixed(1) || 'N/A'}</span>
          </div>
          <span className="text-gray-300">|</span>
          <span className="text-gray-300">{formatDate(movie.release_date)}</span>
          {movie.runtime && (
            <>
              <span className="text-gray-300">|</span>
              <span className="text-gray-300">{formatRuntime(movie.runtime)}</span>
            </>
          )}
        </div>

        {/* Genres */}
        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {movie.genres.map((genre, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-highlight/30 text-white rounded-full text-sm font-medium"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Overview */}
        <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
          {movie.overview || 'No overview available.'}
        </p>

        {/* Keywords */}
        {movie.keywords && movie.keywords.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <p className="text-gray-400 text-xs mb-2">Keywords:</p>
            <div className="flex flex-wrap gap-2">
              {movie.keywords.slice(0, 5).map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/5 text-gray-400 rounded text-xs"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Similarity Score */}
        {movie.similarity_score !== undefined && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Similarity Match</span>
              <span className="text-highlight font-bold">{movie.similarity_score} points</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieCard;