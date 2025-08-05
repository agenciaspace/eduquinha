import React from 'react'
import { cn } from '../utils/cn'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  rightIcon: RightIcon,
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'edu-button'
  
  const variants = {
    primary: 'edu-button-primary',
    secondary: 'edu-button-secondary', 
    ghost: 'edu-button-ghost',
    magic: 'edu-button-magic',
    warm: 'edu-button-warm',
    success: 'edu-button-warm', // Maps to warm gradient
    warning: 'edu-button-warm',
    danger: 'bg-red-500 hover:bg-red-600 text-white hover:shadow-error hover:transform hover:scale-105'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg'
  }
  
  const isDisabled = disabled || loading
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        isDisabled && 'opacity-50 cursor-not-allowed transform-none shadow-none',
        className
      )}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      
      {Icon && !loading && (
        <Icon className="w-4 h-4" />
      )}
      
      {children}
      
      {RightIcon && !loading && (
        <RightIcon className="w-4 h-4" />
      )}
    </button>
  )
}

export default Button