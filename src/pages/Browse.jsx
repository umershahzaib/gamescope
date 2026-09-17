import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, SlidersHorizontal, Loader2 } from 'lucide-react'
import GameCard from '../components/GameCard'
import GameCardSkeleton from '../components/GameCardSkeleton'
import { searchGames, getGamesByGenre } from '../services/gameService'

const Browse = () => {
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [games, setGames] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchError, setSearchError] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Load games by genre when genre changes
  useEffect(() => {
    const loadGamesByGenre = async () => {
      try {
        setIsLoading(true)
        setSearchError(null)
        setCurrentPage(1)
        const result = await getGamesByGenre(selectedGenre, 1, 40)
        setGames(result.results || [])
        setHasMore(result.next !== null)
      } catch (error) {
        console.error('Failed to load games:', error)
        setSearchError('Failed to load games. Please try again.')
        setGames([])
      } finally {
        setIsLoading(false)
      }
    }

    if (!searchQuery) {
      loadGamesByGenre()
    }
  }, [selectedGenre, searchQuery])

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    setSearchError(null)

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchGames(searchQuery, 1, 40)
        setGames(results.results || [])
        setHasMore(results.next !== null)
        setCurrentPage(1)
      } catch (error) {
        console.error('Search error:', error)
        setSearchError(error.message || 'Game search is temporarily unavailable. Please try again.')
        setGames([])
      } finally {
        setIsSearching(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  // Load more games
  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return

    try {
      setIsLoadingMore(true)
      const nextPage = currentPage + 1

      let result
      if (searchQuery && searchQuery.length >= 2) {
        result = await searchGames(searchQuery, nextPage, 40)
      } else {
        result = await getGamesByGenre(selectedGenre, nextPage, 40)
      }

      setGames(prev => [...prev, ...(result.results || [])])
      setHasMore(result.next !== null)
      setCurrentPage(nextPage)
    } catch (error) {
      console.error('Load more error:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  // Filter and sort games
  const displayGames = games
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      if (sortBy === 'price') {
        const priceA = a.pricing?.cheapestPrice || a.price || 0
        const priceB = b.pricing?.cheapestPrice || b.price || 0
        return priceA - priceB
      }
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '')
      return 0
    })

  const genres = ['All', 'Action', 'RPG', 'FPS', 'Adventure', 'Strategy', 'Simulation', 'Sports', 'Racing', 'Horror']

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-5xl font-bold mb-4">Browse Games</h1>
          <p className="text-xl text-gray-400">
            {searchQuery.length >= 2 ? 'Searching the live game database...' : 'Discover games from our live database'}
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12 space-y-6"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search games from live database (e.g., GTA V, Minecraft, Elden Ring)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-dark-900/40 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-all duration-300"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400 animate-spin" />
            )}
          </div>

          {/* Search hint */}
          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="text-sm text-gray-500">Type at least 2 characters to search...</p>
          )}

          {/* API Error */}
          {searchError && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
              <p className="text-red-400">{searchError}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 items-center justify-between">
            {/* Genre Filter */}
            {!searchQuery && (
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <motion.button
                      key={genre}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                        selectedGenre === genre
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/50'
                          : 'bg-dark-900/40 text-gray-400 hover:text-white hover:bg-dark-800'
                      }`}
                    >
                      {genre}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort By */}
            <div className="flex items-center gap-3">
              <SlidersHorizontal className="w-5 h-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-dark-900/40 backdrop-blur-xl border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 cursor-pointer"
              >
                <option value="rating">Highest Rated</option>
                <option value="price">Price: Low to High</option>
                <option value="title">A-Z</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 text-gray-400"
        >
          {isLoading || isSearching ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {isSearching ? 'Searching...' : 'Loading games...'}
            </span>
          ) : (
            <>
              Showing {displayGames.length} {displayGames.length === 1 ? 'game' : 'games'}
              {searchQuery.length >= 2 && <span className="text-primary-400 ml-2">(from live database)</span>}
            </>
          )}
        </motion.div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(40)].map((_, index) => (
              <GameCardSkeleton key={index} index={index} />
            ))}
          </div>
        ) : searchError ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-500/10 mb-6">
              <Search className="w-12 h-12 text-red-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Error Loading Games</h3>
            <p className="text-gray-500 mb-6">{searchError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-xl font-medium transition-colors"
            >
              Retry
            </button>
          </motion.div>
        ) : displayGames.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayGames.map((game, index) => (
                <GameCard key={`${game.id}-${index}`} game={game} index={index} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 text-center"
              >
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="px-8 py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl font-medium transition-all duration-300 inline-flex items-center gap-3"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Loading more games...
                    </>
                  ) : (
                    'Load More Games'
                  )}
                </button>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-dark-900/40 mb-6">
              <Search className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No games found</h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Browse
