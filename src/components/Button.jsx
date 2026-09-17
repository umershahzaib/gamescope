import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'group relative overflow-hidden font-semibold tracking-wide transition-all duration-300 inline-flex items-center justify-center gap-2 rounded-2xl'

  const variants = {
    primary: 'bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/50 hover:shadow-xl hover:shadow-primary-500/60 hover:scale-105',
    secondary: 'bg-dark-800 text-white border border-white/10 hover:border-white/20 hover:bg-dark-700 hover:-translate-y-0.5',
    accent: 'bg-gradient-to-br from-accent-600 to-accent-700 text-white shadow-lg shadow-accent-500/50 hover:shadow-xl hover:shadow-accent-500/60 hover:scale-105',
    ghost: 'text-gray-300 hover:text-white hover:bg-white/5',
    outline: 'border-2 border-primary-500 text-primary-400 hover:bg-primary-500/10 hover:border-primary-400',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-10 py-5 text-lg',
  }

  return (
    <motion.button
      whileHover={{ scale: variant === 'ghost' ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon && (
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        )}
      </span>
      {(variant === 'primary' || variant === 'accent') && (
        <div className="absolute inset-0 -z-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
    </motion.button>
  )
}

export default Button
