import { DollarSign } from 'lucide-react'

const PriceDisplay = ({ pricing, size = 'md', className = '' }) => {
  if (!pricing || !pricing.cheapestPrice) {
    return (
      <div className={`text-gray-500 ${className}`}>
        <span className="text-sm">Price unavailable</span>
      </div>
    )
  }

  const { cheapestPrice, cheapestStore, prices } = pricing

  // Find the cheapest deal details
  const cheapestDeal = prices.find(p => p.salePrice === cheapestPrice)

  const hasDiscount = cheapestDeal?.originalPrice &&
    cheapestDeal.originalPrice > cheapestDeal.salePrice

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  }

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-center gap-2">
        {hasDiscount && (
          <span className={`${sizeClasses[size]} text-gray-500 line-through`}>
            ${cheapestDeal.originalPrice.toFixed(2)}
          </span>
        )}
        <span className={`${sizeClasses[size]} font-bold text-green-400 flex items-center gap-1`}>
          <DollarSign className="w-4 h-4" />
          {cheapestPrice.toFixed(2)}
        </span>
        {hasDiscount && cheapestDeal.savings > 0 && (
          <span className="px-2 py-0.5 text-xs font-medium bg-green-500/20 text-green-400 rounded">
            -{Math.round(cheapestDeal.savings)}% OFF
          </span>
        )}
      </div>
      {cheapestStore && (
        <span className="text-xs text-gray-500">
          on {cheapestStore}
        </span>
      )}
    </div>
  )
}

export default PriceDisplay
