import { motion } from 'framer-motion'

const GameCardSkeleton = ({ index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1]
      }}
      className="overflow-hidden rounded-3xl glass-card"
    >
      {/* Image Skeleton */}
      <div className="relative aspect-[16/9] bg-dark-900/60 animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/50 to-transparent opacity-60" />

        {/* Genre Badge Skeleton */}
        <div className="absolute top-4 right-4">
          <div className="w-20 h-6 bg-dark-800/80 backdrop-blur-md rounded-full animate-pulse" />
        </div>

        {/* Rating Skeleton */}
        <div className="absolute top-4 left-4">
          <div className="w-16 h-6 bg-dark-800/80 backdrop-blur-md rounded-full animate-pulse" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="h-6 bg-dark-800/60 rounded-lg animate-pulse w-3/4" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-dark-800/40 rounded animate-pulse w-full" />
          <div className="h-4 bg-dark-800/40 rounded animate-pulse w-5/6" />
        </div>

        {/* Bottom Info */}
        <div className="flex items-center justify-between pt-2">
          <div className="h-4 bg-dark-800/40 rounded animate-pulse w-24" />
          <div className="h-6 bg-dark-800/60 rounded-lg animate-pulse w-16" />
        </div>
      </div>
    </motion.div>
  )
}

export default GameCardSkeleton
