import React from 'react'
import { cn } from '../utils/cn'

const Badge = ({ 
  variant = 'default', 
  level, // legacy prop for backwards compatibility
  size = 'md',
  children,
  className = '',
  ...props 
}) => {
  // Handle legacy 'level' prop
  const finalVariant = level ? levelToVariant(level) : variant
  
  const baseClasses = 'edu-badge'
  
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'edu-badge-primary',
    success: 'edu-badge-success',
    warning: 'edu-badge-warning',
    error: 'edu-badge-error',
    // Legacy mappings
    high: 'edu-badge-error',
    medium: 'edu-badge-warning', 
    low: 'edu-badge-success'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-3 py-1 text-sm'
  }

  return (
    <span 
      className={cn(
        baseClasses,
        variants[finalVariant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// Helper function for legacy prop mapping
function levelToVariant(level) {
  const mapping = {
    high: 'error',
    medium: 'warning',
    low: 'success'
  }
  return mapping[level] || 'default'
}

export default Badge