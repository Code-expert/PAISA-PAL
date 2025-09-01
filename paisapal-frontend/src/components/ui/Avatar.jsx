import React, { useState } from 'react'
import { User } from 'lucide-react'

export default function Avatar({ 
  src, 
  alt, 
  size = 'md', 
  shape = 'circle',
  className = '',
  fallback = null,
  status = null // 'online', 'offline', 'away', 'busy'
}) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-xl',
    '2xl': 'w-32 h-32 text-2xl'
  }

  const shapeClass = shape === 'square' ? 'rounded-lg' : 'rounded-full'

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return ''
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Generate background color from name
  const getBackgroundColor = (name) => {
    if (!name) return 'bg-gray-500'
    
    const colors = [
      'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500',
      'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500',
      'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
      'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500'
    ]
    
    const hash = name.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc)
    }, 0)
    
    return colors[Math.abs(hash) % colors.length]
  }

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500'
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    setImageLoading(false)
    setImageError(false)
  }

  const showFallback = !src || imageError || imageLoading

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`
          ${sizeClasses[size]} 
          ${shapeClass}
          ${showFallback ? getBackgroundColor(alt) : 'bg-gray-200'}
          flex items-center justify-center 
          font-semibold text-white 
          select-none overflow-hidden
          transition-all duration-200
        `}
      >
        {src && !imageError && (
          <img
            src={src}
            alt={alt}
            className={`w-full h-full object-cover ${shapeClass}`}
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoading ? 'none' : 'block' }}
          />
        )}
        
        {showFallback && (
          <>
            {fallback ? (
              fallback
            ) : getInitials(alt) ? (
              <span className="font-medium">
                {getInitials(alt)}
              </span>
            ) : (
              <User className={`${size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'}`} />
            )}
          </>
        )}
        
        {imageLoading && src && !imageError && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
        )}
      </div>

      {/* Status indicator */}
      {status && (
        <div className={`
          absolute -bottom-0.5 -right-0.5 
          ${size === 'xs' ? 'w-2 h-2' : size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} 
          ${statusColors[status]} 
          border-2 border-white dark:border-gray-800
          ${shapeClass}
        `} />
      )}
    </div>
  )
}

// Avatar Group Component
export function AvatarGroup({ 
  children, 
  max = 3, 
  size = 'md',
  className = ''
}) {
  const avatars = React.Children.toArray(children)
  const visibleAvatars = avatars.slice(0, max)
  const remainingCount = avatars.length - max

  const overlapClass = size === 'xs' ? '-space-x-1' : 
                      size === 'sm' ? '-space-x-1.5' : 
                      '-space-x-2'

  return (
    <div className={`flex items-center ${overlapClass} ${className}`}>
      {visibleAvatars.map((avatar, index) => 
        React.cloneElement(avatar, {
          key: index,
          size,
          className: `ring-2 ring-white dark:ring-gray-800 ${avatar.props.className || ''}`
        })
      )}
      
      {remainingCount > 0 && (
        <Avatar
          size={size}
          alt={`+${remainingCount}`}
          className="ring-2 ring-white dark:ring-gray-800 bg-gray-500 text-white font-medium"
          fallback={<span>+{remainingCount}</span>}
        />
      )}
    </div>
  )
}
