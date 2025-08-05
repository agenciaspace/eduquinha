import React from 'react'

const InputField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder, 
  required = false, 
  icon: Icon,
  rightIcon: RightIcon,
  onRightIconClick,
  className = '',
  disabled = false,
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <div className="relative overflow-hidden rounded-xl">
        {Icon && (
          <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none z-10">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            w-full py-3 px-4 rounded-xl 
            bg-gray-100 hover:bg-gray-200 focus:bg-white
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            transition-all duration-200 text-gray-900 placeholder-gray-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            relative z-20
            ${Icon ? 'pl-11' : 'pl-4'}
            ${RightIcon ? 'pr-11' : 'pr-4'}
            ${className}
          `}
          {...props}
        />
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center justify-center w-11 z-30">
            {onRightIconClick ? (
              <button
                type="button"
                onClick={onRightIconClick}
                className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none rounded flex items-center justify-center w-8 h-8"
              >
                <RightIcon className="h-5 w-5" />
              </button>
            ) : (
              <RightIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default InputField