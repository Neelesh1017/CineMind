import MovieCard from './MovieCard';

function MovieResults({ searchedMovie, recommendations }) {
  return (
    <div className="mt-12">
      {/* Searched Movie Section */}
      <div className="mb-12">
        <MovieCard movie={searchedMovie} isSearched={true} />
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 ? (
        <>
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white text-center mb-2">
              Recommended Movies
            </h2>
            <p className="text-gray-400 text-center">
              Based on similar genres, keywords, and ratings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {recommendations.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No similar movies found. Try searching for another movie.
          </p>
        </div>
      )}
    </div>
  );
}

export default MovieResults;