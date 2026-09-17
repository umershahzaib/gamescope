import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Calendar, Users, Gamepad2, Loader2, AlertCircle, ShoppingCart } from 'lucide-react'
import { getGameDetails, getPopularGames } from '../services/gameService'
import Button from '../components/Button'
import GameCard from '../components/GameCard'
import StoreButton from '../components/StoreButton'
import PriceDisplay from '../components/PriceDisplay'
import SystemRequirements from '../components/SystemRequirements'
import CanIRunThis from '../components/CanIRunThis'

const GameDetail = () => {
  const { id } = useParams()
  const [game, setGame] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recommendedGames, setRecommendedGames] = useState([])
  const [showCompatibilityChecker, setShowCompatibilityChecker] = useState(false)

  useEffect(() => {
    const loadGame = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch game from API
        const apiGame = await getGameDetails(id)
        setGame(apiGame)

        // Fetch recommended games (popular games as recommendations)
        try {
          const popularResult = await getPopularGames(1, 6)
          // Filter out current game from recommendations
          const filtered = popularResult.results.filter(g => g.id !== parseInt(id))
          setRecommendedGames(filtered.slice(0, 3))
        } catch (err) {
          console.error('Failed to load recommended games:', err)
          setRecommendedGames([])
        }
      } catch (err) {
        setError(err.message || 'Failed to load game details')
      } finally {
        setLoading(false)
      }
    }

    loadGame()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-primary-400 animate-spin mx-auto mb-4" />
          <p className="text-xl text-gray-400">Loading game details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Game Not Found</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link to="/browse">
            <Button>Browse Games</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Game not found</h2>
          <Link to="/browse">
            <Button>Browse Games</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Link to="/browse">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Browse</span>
          </motion.button>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={game.image}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/80 to-dark-950/40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl space-y-6"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-4 py-2 bg-primary-500/20 backdrop-blur-md rounded-full border border-primary-500/30 text-primary-400 font-medium">
                {game.genre}
              </span>
              <div className="flex items-center gap-2 px-4 py-2 bg-dark-900/80 backdrop-blur-md rounded-full">
                <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
                <span className="font-semibold">{game.rating ? game.rating.toFixed(1) : 'N/A'}/10</span>
              </div>
            </div>

            <h1 className="text-6xl font-bold">{game.title}</h1>
            <p className="text-xl text-gray-300 leading-relaxed">{game.description || 'No description available.'}</p>

            {/* Store Buttons */}
            {game.stores && (
              <div className="flex flex-wrap gap-3">
                {game.stores.steam && (
                  <StoreButton store="steam" url={game.stores.steam.url} size="lg" />
                )}
                {game.stores.epic && (
                  <StoreButton store="epic" url={game.stores.epic.url} size="lg" />
                )}
              </div>
            )}

            {/* Pricing Display */}
            {game.pricing && (
              <div className="pt-2">
                <PriceDisplay pricing={game.pricing} size="lg" />
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-4">
              <Button
                size="lg"
                variant="accent"
                onClick={() => setShowCompatibilityChecker(true)}
              >
                🎮 Can I Run This?
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Game Details */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6 rounded-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary-400" />
                <div>
                  <div className="text-sm text-gray-500">Release Date</div>
                  <div className="font-semibold">
                    {game.releaseDate ? new Date(game.releaseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 rounded-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-accent-400" />
                <div>
                  <div className="text-sm text-gray-500">Developer</div>
                  <div className="font-semibold">{game.developer || 'Unknown'}</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6 rounded-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <Gamepad2 className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm text-gray-500">Platforms</div>
                  <div className="font-semibold">{game.platforms?.join(', ') || 'Unknown'}</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Tags */}
          {game.tags && game.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-16"
            >
              <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase tracking-wide">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {game.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-dark-900/40 border border-white/10 rounded-xl text-sm font-medium hover:border-primary-500/50 transition-colors cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Buy/Play Section */}
          {game.stores && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mb-16"
            >
              <div className="glass-card p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <ShoppingCart className="w-6 h-6 text-primary-400" />
                  <h2 className="text-3xl font-bold">Buy / Play</h2>
                </div>
                <div className="space-y-4">
                  {game.stores.steam && (
                    <div className="flex items-center justify-between p-4 bg-dark-900/40 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                      <div>
                        <h4 className="font-semibold text-lg mb-1">Steam</h4>
                        <p className="text-sm text-gray-500">Available on Steam</p>
                      </div>
                      <StoreButton store="steam" url={game.stores.steam.url} size="md" />
                    </div>
                  )}
                  {game.stores.epic && (
                    <div className="flex items-center justify-between p-4 bg-dark-900/40 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                      <div>
                        <h4 className="font-semibold text-lg mb-1">Epic Games Store</h4>
                        <p className="text-sm text-gray-500">Available on Epic Games</p>
                      </div>
                      <StoreButton store="epic" url={game.stores.epic.url} size="md" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* System Requirements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold mb-8">🖥️ System Requirements</h2>
            <SystemRequirements
              minimum={game.minimumRequirements}
              recommended={game.recommendedRequirements}
            />
          </motion.div>

          {/* Recommended Games */}
          {recommendedGames.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">You Might Also Like</h2>
                <Link to="/browse">
                  <Button variant="ghost" icon>
                    View More
                  </Button>
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recommendedGames.map((game, index) => (
                  <GameCard key={game.id} game={game} index={index} />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Can I Run This Modal */}
      <AnimatePresence>
        {showCompatibilityChecker && game && (
          <CanIRunThis
            game={game}
            onClose={() => setShowCompatibilityChecker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default GameDetail
