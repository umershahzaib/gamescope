import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import GameCard from '../components/GameCard'
import GameCardSkeleton from '../components/GameCardSkeleton'
import { getFeaturedHomepageGames } from '../services/gameService'

const Home = () => {
  const [popularGames, setPopularGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true)
        setError(null)
        const games = await getFeaturedHomepageGames()
        setPopularGames(games)
      } catch (err) {
        console.error('Failed to load homepage games:', err)
        setError(err.message || 'Failed to load games')
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  // Select featured games (first 6-8 visually impressive titles)
  const featuredGames = popularGames.slice(0, 6)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background with Video and Gradient Mesh */}
        <div className="absolute inset-0 -z-10">
          {/* Video Background */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          >
            <source src="/GameScope_website_hero_video_20260916130953.mp4" type="video/mp4" />
          </video>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-950/80 via-dark-950/90 to-accent-950/80" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-500/20 rounded-full blur-[120px] animate-float" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent-500/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 flex items-center justify-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8 text-center max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full">
              <Sparkles className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-400">Discover Your Next Adventure</span>
            </div>

            <h1 className="text-6xl lg:text-8xl font-bold leading-tight">
              Find Games <br />
              <span className="gradient-text">You'll Love</span>
            </h1>

            <p className="text-xl text-gray-400 leading-relaxed mx-auto max-w-3xl">
              Discover, compare, and check if your PC can run the latest games.
              Make informed decisions with detailed specs and recommendations.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/browse">
                <Button size="lg" icon>
                  Browse Games
                </Button>
              </Link>
              <Link to="/pc-check">
                <Button size="lg" variant="secondary">
                  Check My PC
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 justify-center">
              <div>
                <div className="text-3xl font-bold gradient-text">500+</div>
                <div className="text-sm text-gray-500">Games Listed</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">10K+</div>
                <div className="text-sm text-gray-500">PC Checks</div>
              </div>
              <div>
                <div className="text-3xl font-bold gradient-text">98%</div>
                <div className="text-sm text-gray-500">Accuracy</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-bold">Featured Games</h2>
                <p className="text-gray-500">Handpicked titles with stunning visuals</p>
              </div>
            </div>
            <Link to="/browse">
              <Button variant="ghost" icon>
                View All
              </Button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <GameCardSkeleton key={index} index={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredGames.map((game, index) => (
                <GameCard key={game.id} game={game} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Popular Games Section - 40 Games */}
      <section className="py-24 px-6 bg-dark-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-12"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-4xl font-bold">Popular Games</h2>
                <p className="text-gray-500">Discover what everyone is playing</p>
              </div>
            </div>
            {!loading && popularGames.length > 0 && (
              <span className="text-sm text-gray-500">
                {popularGames.length} games
              </span>
            )}
          </motion.div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {[...Array(40)].map((_, index) => (
                <GameCardSkeleton key={index} index={index} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {popularGames.map((game, index) => (
                <GameCard key={game.id} game={game} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-[3rem] glass-card p-12 lg:p-20 text-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10" />
            <div className="relative space-y-6">
              <h2 className="text-5xl font-bold">
                Not Sure If Your <br />
                <span className="gradient-text">PC Can Handle It?</span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Check your system specifications instantly and get personalized game recommendations based on your hardware.
              </p>
              <div className="pt-4">
                <Link to="/pc-check">
                  <Button size="lg" variant="accent" icon>
                    Run PC Check
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default Home
