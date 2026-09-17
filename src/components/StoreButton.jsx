import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'

const StoreButton = ({ store, url, size = 'sm', className = '' }) => {
  const storeConfig = {
    steam: {
      name: 'Steam',
      color: 'from-[#1b2838] to-[#2a475e]',
      hoverColor: 'hover:from-[#2a475e] hover:to-[#1b2838]',
      borderColor: 'border-[#66c0f4]/30',
      textColor: 'text-[#66c0f4]',
    },
    epic: {
      name: 'Epic Games',
      color: 'from-[#0d0d0d] to-[#2a2a2a]',
      hoverColor: 'hover:from-[#2a2a2a] hover:to-[#0d0d0d]',
      borderColor: 'border-white/20',
      textColor: 'text-white',
    }
  }

  const config = storeConfig[store]
  if (!config) return null

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  }

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        inline-flex items-center gap-2
        bg-gradient-to-r ${config.color}
        ${config.hoverColor}
        border ${config.borderColor}
        ${config.textColor}
        ${sizeClasses[size]}
        rounded-lg font-medium
        backdrop-blur-md
        transition-all duration-300
        hover:shadow-lg
        ${className}
      `}
    >
      <span>{config.name}</span>
      <ExternalLink className="w-3 h-3" />
    </motion.a>
  )
}

export default StoreButton
