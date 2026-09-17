import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Monitor, Cpu, MemoryStick, HardDrive, Gamepad2, CheckCircle2, XCircle, AlertCircle, Zap, Search, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import { searchGames, getGameDetails } from '../services/gameService'

const PCCheck = () => {
  const [specs, setSpecs] = useState({
    os: '',
    processor: '',
    memory: '',
    graphics: '',
    storage: '',
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  const [compatibilityResult, setCompatibilityResult] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Debounced game search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
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
    }, 400) // 400ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleInputChange = (field, value) => {
    setSpecs(prev => ({ ...prev, [field]: value }))
  }

  const handleGameSelect = async (game) => {
    setSelectedGame(game)
    setSearchQuery('')
    setSearchResults([])
    setCompatibilityResult(null)

    // Fetch full game details if not already loaded
    if (!game.minimumRequirements || !game.recommendedRequirements) {
      try {
        const fullDetails = await getGameDetails(game.id)
        setSelectedGame(fullDetails)
      } catch (error) {
        console.error('Failed to fetch game details:', error)
      }
    }
  }

  const analyzeCompatibility = () => {
    if (!selectedGame) return

    setIsAnalyzing(true)

    // Simulate analysis delay
    setTimeout(() => {
      const result = calculateCompatibility(specs, selectedGame)
      setCompatibilityResult(result)
      setIsAnalyzing(false)
    }, 1500)
  }

  const calculateCompatibility = (userSpecs, game) => {
    // Check if game has system requirements
    if (!game.minimumRequirements && !game.recommendedRequirements) {
      return {
        status: 'unavailable',
        message: 'System requirements are not available for this game',
        canRun: null,
      }
    }

    // Simple heuristic-based compatibility check
    const specString = Object.values(userSpecs).join(' ').toLowerCase()
    let score = 0
    let maxScore = 0
    const details = []

    // GPU Check
    maxScore += 30
    if (specString.includes('rtx 40') || specString.includes('rx 7')) {
      score += 30
      details.push({ component: 'GPU', status: 'excellent', message: 'High-end graphics card' })
    } else if (specString.includes('rtx 30') || specString.includes('rtx 20') || specString.includes('rx 6')) {
      score += 25
      details.push({ component: 'GPU', status: 'good', message: 'Modern graphics card' })
    } else if (specString.includes('rtx') || specString.includes('gtx 16') || specString.includes('rx 5')) {
      score += 20
      details.push({ component: 'GPU', status: 'moderate', message: 'Capable graphics card' })
    } else if (specString.includes('gtx')) {
      score += 10
      details.push({ component: 'GPU', status: 'low', message: 'Older graphics card' })
    } else {
      details.push({ component: 'GPU', status: 'unknown', message: 'Unable to determine GPU capability' })
    }

    // RAM Check
    maxScore += 25
    if (specString.includes('32 gb') || specString.includes('64 gb')) {
      score += 25
      details.push({ component: 'RAM', status: 'excellent', message: 'Plenty of memory' })
    } else if (specString.includes('16 gb')) {
      score += 20
      details.push({ component: 'RAM', status: 'good', message: 'Adequate memory for modern games' })
    } else if (specString.includes('12 gb')) {
      score += 15
      details.push({ component: 'RAM', status: 'moderate', message: 'Sufficient for most games' })
    } else if (specString.includes('8 gb')) {
      score += 10
      details.push({ component: 'RAM', status: 'low', message: 'Minimum for modern games' })
    } else {
      details.push({ component: 'RAM', status: 'unknown', message: 'Unable to determine RAM' })
    }

    // CPU Check
    maxScore += 25
    if (specString.includes('i9') || specString.includes('ryzen 9') || specString.includes('i7-13') || specString.includes('i7-12')) {
      score += 25
      details.push({ component: 'CPU', status: 'excellent', message: 'High-performance processor' })
    } else if (specString.includes('i7') || specString.includes('ryzen 7') || specString.includes('i5-13') || specString.includes('i5-12')) {
      score += 20
      details.push({ component: 'CPU', status: 'good', message: 'Strong processor' })
    } else if (specString.includes('i5') || specString.includes('ryzen 5')) {
      score += 15
      details.push({ component: 'CPU', status: 'moderate', message: 'Capable processor' })
    } else if (specString.includes('i3') || specString.includes('ryzen 3')) {
      score += 10
      details.push({ component: 'CPU', status: 'low', message: 'Entry-level processor' })
    } else {
      details.push({ component: 'CPU', status: 'unknown', message: 'Unable to determine CPU' })
    }

    // Storage Check
    maxScore += 20
    if (specString.includes('nvme') || specString.includes('m.2')) {
      score += 20
      details.push({ component: 'Storage', status: 'excellent', message: 'Fast NVMe storage' })
    } else if (specString.includes('ssd')) {
      score += 15
      details.push({ component: 'Storage', status: 'good', message: 'SSD storage' })
    } else if (specString.includes('hdd')) {
      score += 5
      details.push({ component: 'Storage', status: 'low', message: 'HDD may cause slow loading times' })
    } else {
      details.push({ component: 'Storage', status: 'unknown', message: 'Unable to determine storage type' })
    }

    const percentage = Math.round((score / maxScore) * 100)

    let status, message, canRun
    if (percentage >= 80) {
      status = 'excellent'
      message = 'Your PC can run this game at high settings with excellent performance'
      canRun = true
    } else if (percentage >= 60) {
      status = 'good'
      message = 'Your PC can run this game smoothly at medium to high settings'
      canRun = true
    } else if (percentage >= 40) {
      status = 'moderate'
      message = 'Your PC can run this game, but you may need to lower graphics settings'
      canRun = true
    } else {
      status = 'low'
      message = 'Your PC may struggle to run this game. Consider upgrading your hardware'
      canRun = false
    }

    return {
      status,
      message,
      canRun,
      score: percentage,
      details,
      hasRequirements: !!(game.minimumRequirements || game.recommendedRequirements),
    }
  }

  const canAnalyze = Object.values(specs).every(val => val.trim() !== '') && selectedGame

  return (
    <div className="min-h-screen py-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-6">
            <Zap className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-primary-400">Instant Compatibility Check</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            Can Your PC <span className="gradient-text">Run It?</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Enter your system specifications and discover which games your PC can handle
          </p>
        </motion.div>

        {/* Specs Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 rounded-3xl mb-12"
        >
          <h2 className="text-2xl font-bold mb-8">Enter Your System Specs</h2>
          <div className="space-y-6">
            <SpecInput
              icon={Monitor}
              label="Operating System"
              placeholder="e.g., Windows 11, Windows 10"
              value={specs.os}
              onChange={(val) => handleInputChange('os', val)}
            />
            <SpecInput
              icon={Cpu}
              label="Processor"
              placeholder="e.g., Intel Core i7-10700K, AMD Ryzen 7 5800X"
              value={specs.processor}
              onChange={(val) => handleInputChange('processor', val)}
            />
            <SpecInput
              icon={MemoryStick}
              label="Memory (RAM)"
              placeholder="e.g., 16 GB DDR4"
              value={specs.memory}
              onChange={(val) => handleInputChange('memory', val)}
            />
            <SpecInput
              icon={Gamepad2}
              label="Graphics Card"
              placeholder="e.g., NVIDIA RTX 3070, AMD RX 6800"
              value={specs.graphics}
              onChange={(val) => handleInputChange('graphics', val)}
            />
            <SpecInput
              icon={HardDrive}
              label="Storage"
              placeholder="e.g., 500 GB SSD"
              value={specs.storage}
              onChange={(val) => handleInputChange('storage', val)}
            />
          </div>
        </motion.div>

        {/* Game Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 rounded-3xl mb-12"
        >
          <h2 className="text-2xl font-bold mb-4">Select a Game to Check</h2>
          <p className="text-gray-400 mb-6">Search for any game to check compatibility with your PC</p>

          {/* Search Input */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search any game (e.g., Cyberpunk 2077, GTA V, Elden Ring)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-dark-900/40 backdrop-blur-xl border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary-500/50 transition-all duration-300"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400 animate-spin" />
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-2 mb-6 max-h-96 overflow-y-auto">
              {searchResults.map((game) => (
                <motion.div
                  key={game.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleGameSelect(game)}
                  className="flex items-center gap-4 p-4 bg-dark-900/40 rounded-xl border border-white/5 hover:border-primary-500/50 transition-all cursor-pointer"
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
                    <h4 className="font-semibold mb-1">{game.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{game.genre || 'Unknown'}</span>
                      {game.releaseDate && (
                        <>
                          <span>•</span>
                          <span>{new Date(game.releaseDate).getFullYear()}</span>
                        </>
                      )}
                      {game.rating > 0 && (
                        <>
                          <span>•</span>
                          <span>★ {game.rating.toFixed(1)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Search hint */}
          {searchQuery.length > 0 && searchQuery.length < 2 && !isSearching && (
            <p className="text-sm text-gray-500 mb-4">Type at least 2 characters to search...</p>
          )}

          {/* No results */}
          {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
            <div className="text-center py-8">
              <p className="text-gray-400">No games found. Try another search term.</p>
            </div>
          )}

          {/* Selected Game */}
          {selectedGame && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-primary-500/10 border-2 border-primary-500/30 rounded-2xl"
            >
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={selectedGame.image}
                  alt={selectedGame.title}
                  className="w-20 h-20 rounded-xl object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x80/1a1a2e/FFFFFF?text=No+Image'
                  }}
                />
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">{selectedGame.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{selectedGame.genre || 'Unknown'}</span>
                    {selectedGame.releaseDate && (
                      <>
                        <span>•</span>
                        <span>{new Date(selectedGame.releaseDate).getFullYear()}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedGame(null)
                    setCompatibilityResult(null)
                  }}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* System Requirements if available */}
              {(selectedGame.minimumRequirements || selectedGame.recommendedRequirements) && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-green-400 mb-2">✓ System requirements available</p>
                </div>
              )}

              {!selectedGame.minimumRequirements && !selectedGame.recommendedRequirements && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <p className="text-xs text-yellow-400">⚠ System requirements not available - compatibility check will be estimate-based</p>
                </div>
              )}
            </motion.div>
          )}

          <div className="mt-8">
            <Button
              size="lg"
              icon
              disabled={!canAnalyze || isAnalyzing}
              onClick={analyzeCompatibility}
              className="w-full"
            >
              {isAnalyzing ? 'Analyzing Compatibility...' : 'Check Compatibility'}
            </Button>
          </div>
        </motion.div>

        {/* Compatibility Results */}
        <AnimatePresence>
          {compatibilityResult && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="glass-card p-8 rounded-3xl"
            >
              {compatibilityResult.status === 'unavailable' ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-2">Requirements Unavailable</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    {compatibilityResult.message}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-8">
                    <div className={`p-4 rounded-2xl ${
                      compatibilityResult.status === 'excellent' ? 'bg-green-500/10' :
                      compatibilityResult.status === 'good' ? 'bg-blue-500/10' :
                      compatibilityResult.status === 'moderate' ? 'bg-yellow-500/10' :
                      'bg-red-500/10'
                    }`}>
                      {compatibilityResult.canRun ? (
                        <CheckCircle2 className={`w-8 h-8 ${
                          compatibilityResult.status === 'excellent' ? 'text-green-400' :
                          compatibilityResult.status === 'good' ? 'text-blue-400' :
                          'text-yellow-400'
                        }`} />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-1">
                        {compatibilityResult.canRun ? 'Your PC Can Run This Game' : 'Compatibility Issues Detected'}
                      </h3>
                      <p className="text-gray-400">{compatibilityResult.message}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-4xl font-bold ${
                        compatibilityResult.score >= 80 ? 'text-green-400' :
                        compatibilityResult.score >= 60 ? 'text-blue-400' :
                        compatibilityResult.score >= 40 ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {compatibilityResult.score}%
                      </div>
                      <div className="text-sm text-gray-500">Match</div>
                    </div>
                  </div>

                  {/* Component Details */}
                  {compatibilityResult.details && compatibilityResult.details.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-lg font-semibold mb-4">Component Analysis</h4>
                      {compatibilityResult.details.map((detail, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-dark-900/40 rounded-xl"
                        >
                          <div className={`w-2 h-2 rounded-full ${
                            detail.status === 'excellent' ? 'bg-green-400' :
                            detail.status === 'good' ? 'bg-blue-400' :
                            detail.status === 'moderate' ? 'bg-yellow-400' :
                            detail.status === 'low' ? 'bg-red-400' :
                            'bg-gray-400'
                          }`} />
                          <div className="flex-1">
                            <div className="font-medium">{detail.component}</div>
                            <div className="text-sm text-gray-500">{detail.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* System Requirements Display */}
                  {selectedGame && (selectedGame.minimumRequirements || selectedGame.recommendedRequirements) && (
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <h4 className="text-lg font-semibold mb-4">Game System Requirements</h4>
                      <div className="grid md:grid-cols-2 gap-6">
                        {selectedGame.minimumRequirements && (
                          <div className="space-y-3">
                            <h5 className="font-medium text-yellow-400">Minimum</h5>
                            <div className="space-y-2 text-sm">
                              {Object.entries(selectedGame.minimumRequirements).map(([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="text-gray-500 capitalize">{key}:</span>
                                  <span className="text-gray-300">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedGame.recommendedRequirements && (
                          <div className="space-y-3">
                            <h5 className="font-medium text-green-400">Recommended</h5>
                            <div className="space-y-2 text-sm">
                              {Object.entries(selectedGame.recommendedRequirements).map(([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="text-gray-500 capitalize">{key}:</span>
                                  <span className="text-gray-300">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* View Game Details Link */}
                  <div className="mt-8 flex gap-4">
                    <Link to={`/game/${selectedGame?.id}`} className="flex-1">
                      <Button variant="secondary" className="w-full">
                        View Game Details
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedGame(null)
                        setCompatibilityResult(null)
                        setSearchQuery('')
                      }}
                      className="flex-1"
                    >
                      Check Another Game
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

const SpecInput = ({ icon: Icon, label, placeholder, value, onChange }) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
      <Icon className="w-4 h-4" />
      {label}
    </label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-dark-900/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-primary-500/50 transition-all duration-300"
    />
  </div>
)

export default PCCheck
