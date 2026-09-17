import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, GitCompare, TrendingUp, TrendingDown, Check } from 'lucide-react'
import { Search, Loader2 } from 'lucide-react'
import { searchGames, getGameDetails } from '../services/gameService'

const Compare = () => {
  const [selectedGames, setSelectedGames] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [loadingGameIds, setLoadingGameIds] = useState([])

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    const timeoutId = setTimeout(async () => {
      try {
        const results = await searchGames(searchQuery, 1, 10)
        setSearchResults(results.results || [])
      } catch (error) {
        console.error('Search error:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const addGame = async (game) => {
    if (selectedGames.length < 3 && !selectedGames.find(g => g.id === game.id)) {
      // Add game ID to loading state
      setLoadingGameIds(prev => [...prev, game.id])

      try {
        // Fetch full game details including system requirements
        const fullGameDetails = await getGameDetails(game.id)
        setSelectedGames([...selectedGames, fullGameDetails])
      } catch (error) {
        console.error('Failed to load game details:', error)
        // Fall back to basic game data if full details fail
        setSelectedGames([...selectedGames, game])
      } finally {
        // Remove from loading state
        setLoadingGameIds(prev => prev.filter(id => id !== game.id))
      }

      setSearchQuery('')
      setSearchResults([])
    }
  }

  const removeGame = (gameId) => {
    setSelectedGames(selectedGames.filter(g => g.id !== gameId))
  }

  const filteredGames = searchResults.filter(game =>
    !selectedGames.find(g => g.id === game.id)
  )

  const comparisonData = [
    { label: 'Genre', key: 'genre' },
    { label: 'Rating', key: 'rating' },
    { label: 'Price', key: 'price', format: (val) => val === 0 ? 'Free' : `$${val}` },
    { label: 'Release Date', key: 'releaseDate', format: (val) => new Date(val).getFullYear() },
    { label: 'Developer', key: 'developer' },
    { label: 'Publisher', key: 'publisher' },
  ]

  const requirementsComparison = [
    { label: 'Min. Processor', key: 'processor', type: 'min' },
    { label: 'Min. Memory', key: 'memory', type: 'min' },
    { label: 'Min. Graphics', key: 'graphics', type: 'min' },
    { label: 'Min. Storage', key: 'storage', type: 'min' },
    { label: 'Rec. Processor', key: 'processor', type: 'rec' },
    { label: 'Rec. Memory', key: 'memory', type: 'rec' },
    { label: 'Rec. Graphics', key: 'graphics', type: 'rec' },
    { label: 'Rec. Storage', key: 'storage', type: 'rec' },
  ]

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-500/10 border border-accent-500/20 rounded-full mb-6">
            <GitCompare className="w-4 h-4 text-accent-400" />
            <span className="text-sm font-medium text-accent-400">Side-by-Side Comparison</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Compare <span className="gradient-text">Games</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Compare up to 3 games to find the perfect match for your preferences and hardware
          </p>
        </motion.div>

        {/* Game Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 rounded-3xl mb-12"
        >
          <h2 className="text-2xl font-bold mb-6">Select Games to Compare</h2>

          {/* Selected Games */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="aspect-[4/3] rounded-2xl border-2 border-dashed border-white/10 flex items-center justify-center relative overflow-hidden"
              >
                {selectedGames[index] ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full h-full relative group"
                  >
                    <img
                      src={selectedGames[index].image}
                      alt={selectedGames[index].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-950 to-transparent" />
                    <button
                      onClick={() => removeGame(selectedGames[index].id)}
                      className="absolute top-2 right-2 p-2 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h4 className="font-bold text-lg">{selectedGames[index].title}</h4>
                      <p className="text-sm text-gray-400">{selectedGames[index].genre}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center p-6">
                    <Plus className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Add Game {index + 1}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Search */}
          {selectedGames.length < 3 && (
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search any game to add (e.g., GTA V, Elden Ring)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-dark-900/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 transition-all duration-300"
                />
                {isSearching && (
                  <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400 animate-spin" />
                )}
              </div>

              {/* Search hint */}
              {searchQuery.length > 0 && searchQuery.length < 2 && (
                <p className="text-xs text-gray-500 mt-2">Type at least 2 characters to search...</p>
              )}

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchQuery.length >= 2 && filteredGames.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-2 max-h-96 overflow-y-auto bg-dark-900 border border-white/10 rounded-xl shadow-2xl"
                  >
                    {filteredGames.map((game) => (
                      <motion.button
                        key={game.id}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        onClick={() => addGame(game)}
                        className="w-full p-4 flex items-center gap-4 text-left border-b border-white/5 last:border-0 transition-colors"
                      >
                        <img
                          src={game.image}
                          alt={game.title}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/64x64/1a1a2e/FFFFFF?text=No+Image'
                          }}
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold">{game.title}</h4>
                          <p className="text-sm text-gray-500">{game.genre || 'Unknown'}</p>
                        </div>
                        <Plus className="w-5 h-5 text-primary-400" />
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* No results */}
              {searchQuery.length >= 2 && filteredGames.length === 0 && !isSearching && (
                <p className="text-sm text-gray-500 mt-2">No games found. Try a different search term.</p>
              )}
            </div>
          )}
        </motion.div>

        {/* Comparison Table */}
        {selectedGames.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Basic Info Comparison */}
            <div className="glass-card rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h3 className="text-2xl font-bold">Basic Information</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <tbody>
                    {comparisonData.map((item, index) => (
                      <motion.tr
                        key={item.key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-white/5"
                      >
                        <td className="p-4 font-medium text-gray-400 w-48">{item.label}</td>
                        {selectedGames.map((game) => (
                          <td key={game.id} className="p-4">
                            <ComparisonValue
                              value={item.format ? item.format(game[item.key]) : game[item.key]}
                              allValues={selectedGames.map(g => item.format ? item.format(g[item.key]) : g[item.key])}
                              type={item.key}
                            />
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* System Requirements Comparison */}
            {selectedGames.some(game => game.minimumRequirements || game.recommendedRequirements) && (
              <div className="glass-card rounded-3xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-2xl font-bold">System Requirements</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <tbody>
                      {requirementsComparison.map((item, index) => (
                        <motion.tr
                          key={`${item.key}-${item.type}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="border-b border-white/5"
                        >
                          <td className="p-4 font-medium text-gray-400 w-48">{item.label}</td>
                          {selectedGames.map((game) => {
                            const reqType = item.type === 'min' ? 'minimumRequirements' : 'recommendedRequirements'
                            const requirements = game[reqType]
                            const value = requirements ? requirements[item.key] : null

                            return (
                              <td key={game.id} className="p-4 text-sm text-gray-300">
                                {value || <span className="text-gray-600 italic">Not available</span>}
                              </td>
                            )
                          })}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Empty State */}
        {selectedGames.length < 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-dark-900/40 mb-6">
              <GitCompare className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Add Games to Compare</h3>
            <p className="text-gray-500">Select at least 2 games to see a detailed comparison</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

const ComparisonValue = ({ value, allValues, type }) => {
  let indicator = null

  if (type === 'rating') {
    const max = Math.max(...allValues)
    const min = Math.min(...allValues)
    if (value === max && max !== min) {
      indicator = <TrendingUp className="w-4 h-4 text-green-400 inline ml-2" />
    } else if (value === min && max !== min) {
      indicator = <TrendingDown className="w-4 h-4 text-red-400 inline ml-2" />
    }
  }

  if (type === 'price') {
    const prices = allValues.map(v => v === 'Free' ? 0 : parseFloat(v.replace('$', '')))
    const max = Math.max(...prices)
    const min = Math.min(...prices)
    const current = value === 'Free' ? 0 : parseFloat(value.replace('$', ''))

    if (current === min && max !== min) {
      indicator = <Check className="w-4 h-4 text-green-400 inline ml-2" />
    }
  }

  return (
    <span className="font-semibold">
      {value}
      {indicator}
    </span>
  )
}

export default Compare
