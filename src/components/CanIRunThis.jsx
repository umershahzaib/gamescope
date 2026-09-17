import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Monitor, Cpu, MemoryStick, HardDrive, Gamepad2, CheckCircle, XCircle, AlertCircle, Save } from 'lucide-react'
import { getUserPCSpecs, saveUserPCSpecs } from '../utils/pcStorage'
import { checkCompatibility } from '../utils/compatibilityChecker'
import Button from './Button'

const CanIRunThis = ({ game, onClose }) => {
  const [userSpecs, setUserSpecs] = useState({
    cpu: '',
    gpu: '',
    ram: '',
    vram: '',
    os: '',
    storage: ''
  })
  const [result, setResult] = useState(null)
  const [hasChecked, setHasChecked] = useState(false)

  // Load saved specs on mount
  useEffect(() => {
    const savedSpecs = getUserPCSpecs()
    setUserSpecs(savedSpecs)
  }, [])

  const handleInputChange = (field, value) => {
    setUserSpecs(prev => ({ ...prev, [field]: value }))
  }

  const handleCheck = () => {
    const gameRequirements = {
      minimum: game.minimumRequirements,
      recommended: game.recommendedRequirements
    }

    const compatibilityResult = checkCompatibility(userSpecs, gameRequirements)
    setResult(compatibilityResult)
    setHasChecked(true)

    // Save specs for future use
    saveUserPCSpecs(userSpecs)
  }

  const canCheck = Object.values(userSpecs).some(val => val && val.trim() !== '')

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-400" />
      case 'uncertain':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pass':
        return 'bg-green-500/10 border-green-500/20'
      case 'fail':
        return 'bg-red-500/10 border-red-500/20'
      case 'uncertain':
        return 'bg-yellow-500/10 border-yellow-500/20'
      default:
        return 'bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card p-8 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">🎮 Can I Run This?</h2>
            <p className="text-gray-400">{game.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Check if requirements are available */}
        {!game.minimumRequirements ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Requirements Not Available</h3>
            <p className="text-gray-400 mb-6">
              System requirements for this game are not available in our database.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        ) : (
          <>
            {/* PC Specs Form */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Your PC Specifications</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Save className="w-3 h-3" />
                  <span>Auto-saved</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <SpecInput
                  icon={Monitor}
                  label="Operating System"
                  placeholder="e.g., Windows 11"
                  value={userSpecs.os}
                  onChange={(val) => handleInputChange('os', val)}
                />
                <SpecInput
                  icon={Cpu}
                  label="Processor (CPU)"
                  placeholder="e.g., Intel Core i7-10700K"
                  value={userSpecs.cpu}
                  onChange={(val) => handleInputChange('cpu', val)}
                />
                <SpecInput
                  icon={MemoryStick}
                  label="Memory (RAM)"
                  placeholder="e.g., 16 GB"
                  value={userSpecs.ram}
                  onChange={(val) => handleInputChange('ram', val)}
                />
                <SpecInput
                  icon={Gamepad2}
                  label="Graphics Card (GPU)"
                  placeholder="e.g., NVIDIA RTX 3070"
                  value={userSpecs.gpu}
                  onChange={(val) => handleInputChange('gpu', val)}
                />
                <SpecInput
                  icon={MemoryStick}
                  label="Video Memory (VRAM)"
                  placeholder="e.g., 8 GB"
                  value={userSpecs.vram}
                  onChange={(val) => handleInputChange('vram', val)}
                />
                <SpecInput
                  icon={HardDrive}
                  label="Available Storage"
                  placeholder="e.g., 500 GB"
                  value={userSpecs.storage}
                  onChange={(val) => handleInputChange('storage', val)}
                />
              </div>
            </div>

            {/* Check Button */}
            <div className="mb-8">
              <Button
                size="lg"
                disabled={!canCheck}
                onClick={handleCheck}
                className="w-full"
              >
                Check Compatibility
              </Button>
            </div>

            {/* Results */}
            <AnimatePresence>
              {hasChecked && result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Overall Result */}
                  <div className={`p-6 rounded-2xl border-2 ${
                    result.canRun === true ? 'bg-green-500/10 border-green-500/30' :
                    result.canRun === false ? 'bg-red-500/10 border-red-500/30' :
                    'bg-yellow-500/10 border-yellow-500/30'
                  }`}>
                    <div className="flex items-center gap-4 mb-4">
                      {result.canRun === true ? (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      ) : result.canRun === false ? (
                        <XCircle className="w-8 h-8 text-red-400" />
                      ) : (
                        <AlertCircle className="w-8 h-8 text-yellow-400" />
                      )}
                      <h3 className="text-xl font-bold">
                        {result.canRun === true ? 'Your PC Can Run This Game!' :
                         result.canRun === false ? 'Your PC May Not Meet Requirements' :
                         'Compatibility Uncertain'}
                      </h3>
                    </div>
                    <p className="text-gray-300">{result.message}</p>
                  </div>

                  {/* Breakdown */}
                  {result.breakdown && (
                    <div>
                      <h4 className="text-lg font-semibold mb-4">Component Breakdown</h4>
                      <div className="space-y-3">
                        {Object.entries(result.breakdown).map(([component, info]) => (
                          <div
                            key={component}
                            className={`flex items-center justify-between p-4 rounded-xl border ${getStatusColor(info.status)}`}
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(info.status)}
                              <div>
                                <div className="font-medium capitalize">{component === 'cpu' ? 'CPU' : component === 'gpu' ? 'GPU' : component === 'os' ? 'OS' : component === 'vram' ? 'VRAM' : component === 'ram' ? 'RAM' : component}</div>
                                <div className="text-sm text-gray-400">{info.message}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </motion.div>
    </motion.div>
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

export default CanIRunThis
