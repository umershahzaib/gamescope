import { motion } from 'framer-motion'
import { Monitor, Cpu, MemoryStick, HardDrive, Gamepad2, AlertCircle } from 'lucide-react'

const SystemRequirements = ({ minimum, recommended }) => {
  // Check if requirements exist
  const hasMinimum = minimum && Object.keys(minimum).length > 0 && !minimum.raw
  const hasRecommended = recommended && Object.keys(recommended).length > 0 && !recommended.raw

  if (!hasMinimum && !hasRecommended) {
    return (
      <div className="glass-card p-8 rounded-3xl text-center">
        <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">System Requirements Unavailable</h3>
        <p className="text-gray-400">System requirements for this game are not available in our database.</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Minimum Requirements */}
      {hasMinimum && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 rounded-3xl space-y-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <Monitor className="w-6 h-6 text-yellow-400" />
            </div>
            <h3 className="text-2xl font-bold">Minimum</h3>
          </div>
          <div className="space-y-4">
            {minimum.os && <RequirementItem icon={Monitor} label="OS" value={minimum.os} />}
            {minimum.processor && <RequirementItem icon={Cpu} label="Processor" value={minimum.processor} />}
            {minimum.memory && <RequirementItem icon={MemoryStick} label="Memory" value={minimum.memory} />}
            {minimum.graphics && <RequirementItem icon={Gamepad2} label="Graphics" value={minimum.graphics} />}
            {minimum.directx && <RequirementItem icon={HardDrive} label="DirectX" value={minimum.directx} />}
            {minimum.storage && <RequirementItem icon={HardDrive} label="Storage" value={minimum.storage} />}
            {minimum.additionalNotes && (
              <RequirementItem icon={AlertCircle} label="Additional Notes" value={minimum.additionalNotes} />
            )}
          </div>
          {minimum.raw && (
            <div className="mt-4 p-4 bg-dark-900/40 rounded-xl text-sm text-gray-400 whitespace-pre-wrap">
              {minimum.raw}
            </div>
          )}
        </motion.div>
      )}

      {/* Recommended Requirements */}
      {hasRecommended && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 rounded-3xl space-y-6 border-2 border-primary-500/20"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-500/10 rounded-xl">
              <Monitor className="w-6 h-6 text-primary-400" />
            </div>
            <h3 className="text-2xl font-bold">Recommended</h3>
          </div>
          <div className="space-y-4">
            {recommended.os && <RequirementItem icon={Monitor} label="OS" value={recommended.os} />}
            {recommended.processor && <RequirementItem icon={Cpu} label="Processor" value={recommended.processor} />}
            {recommended.memory && <RequirementItem icon={MemoryStick} label="Memory" value={recommended.memory} />}
            {recommended.graphics && <RequirementItem icon={Gamepad2} label="Graphics" value={recommended.graphics} />}
            {recommended.directx && <RequirementItem icon={HardDrive} label="DirectX" value={recommended.directx} />}
            {recommended.storage && <RequirementItem icon={HardDrive} label="Storage" value={recommended.storage} />}
            {recommended.additionalNotes && (
              <RequirementItem icon={AlertCircle} label="Additional Notes" value={recommended.additionalNotes} />
            )}
          </div>
          {recommended.raw && (
            <div className="mt-4 p-4 bg-dark-900/40 rounded-xl text-sm text-gray-400 whitespace-pre-wrap">
              {recommended.raw}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

const RequirementItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 group">
    <Icon className="w-5 h-5 text-gray-500 mt-0.5 group-hover:text-primary-400 transition-colors flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="text-sm text-gray-500 mb-0.5">{label}</div>
      <div className="font-medium text-gray-300 break-words">{value}</div>
    </div>
  </div>
)

export default SystemRequirements
