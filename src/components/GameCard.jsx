import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import StoreButton from './StoreButton'
import PriceDisplay from './PriceDisplay'

const GameCard = ({ game, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
    >
      <Link to={`/game/${game.id}`}>
        <div className="group relative overflow-hidden rounded-3xl glass-card hover-lift cursor-pointer">
          {/* Image Container */}
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={game.image}
              alt={game.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

            {/* Genre Badge */}
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1.5 text-xs font-medium bg-dark-900/80 backdrop-blur-md rounded-full border border-white/10">
                {game.genre}
              </span>
            </div>

            {/* Rating */}
            <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-dark-900/80 backdrop-blur-md rounded-full border border-white/10">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <span className="text-sm font-semibold">{game.rating}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary-400 transition-colors duration-300">
              {game.title}
            </h3>
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {game.description}
            </p>

            {/* System Requirements Indicator */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  game.canRun === 'high' ? 'bg-green-400' :
                  game.canRun === 'medium' ? 'bg-yellow-400' :
                  'bg-red-400'
                }`} />
                <span className="text-xs text-gray-500">
                  {game.canRun === 'high' ? 'Runs Smoothly' :
                   game.canRun === 'medium' ? 'Moderate' :
                   'Check Requirements'}
                </span>
              </div>

              {/* Pricing Display */}
              {game.pricing ? (
                <PriceDisplay pricing={game.pricing} size="sm" />
              ) : game.price > 0 ? (
                <span className="text-lg font-bold text-primary-400">${game.price}</span>
              ) : game.price === 0 && game.tags?.includes('Free-to-Play') ? (
                <span className="text-sm font-bold text-green-400">FREE TO PLAY</span>
              ) : (
                <span className="text-xs text-gray-500">Price unavailable</span>
              )}
            </div>

            {/* Store Badges */}
            {game.stores && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-gray-500 mb-2">Available on</p>
                <div className="flex flex-wrap gap-2">
                  {game.stores.steam && (
                    <StoreButton store="steam" url={game.stores.steam.url} size="xs" />
                  )}
                  {game.stores.epic && (
                    <StoreButton store="epic" url={game.stores.epic.url} size="xs" />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Hover Border Glow */}
          <div className="absolute inset-0 rounded-3xl border border-primary-500/0 group-hover:border-primary-500/50 transition-all duration-500" />
        </div>
      </Link>
    </motion.div>
  )
}

export default GameCard
