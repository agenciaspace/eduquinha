import React from 'react'
import { cn } from '../utils/cn'

const Card = ({
  children,
  variant = 'default',
  hover = false,
  padding = 'default',
  className = '',
  ...props
}) => {
  const baseClasses = 'edu-card'
  
  const variants = {
    default: '',
    stat: 'edu-stat-card',
    playful: 'bg-gradient-to-br from-white to-primary-50/20'
  }
  
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  }
  
  const hoverClass = hover ? 'edu-card-hover' : ''
  
  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        paddings[padding],
        hoverClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Subcomponents for better organization
Card.Header = ({ children, className = '', ...props }) => (
  <div
    className={cn('mb-4 pb-4', className)}
    {...props}
  >
    {children}
  </div>
)

Card.Title = ({ children, className = '', ...props }) => (
  <h3
    className={cn('text-lg font-semibold text-gray-900 text-display', className)}
    {...props}
  >
    {children}
  </h3>
)

Card.Description = ({ children, className = '', ...props }) => (
  <p
    className={cn('text-sm text-gray-600 mt-1', className)}
    {...props}
  >
    {children}
  </p>
)

Card.Content = ({ children, className = '', ...props }) => (
  <div
    className={cn('', className)}
    {...props}
  >
    {children}
  </div>
)

Card.Footer = ({ children, className = '', ...props }) => (
  <div
    className={cn('mt-4 pt-4', className)}
    {...props}
  >
    {children}
  </div>
)

export default Card