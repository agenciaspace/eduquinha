import { useState, useEffect } from 'react'

export const useUrlParams = () => {
  const [params, setParams] = useState(() => {
    return Object.fromEntries(new URLSearchParams(window.location.search))
  })

  useEffect(() => {
    const updateParams = () => {
      const newParams = Object.fromEntries(new URLSearchParams(window.location.search))
      setParams(newParams)
      console.log('🔍 useUrlParams - URL params changed:', newParams)
    }

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', updateParams)
    
    // Listen for pushstate/replacestate (programmatic navigation)
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args)
      setTimeout(updateParams, 0)
    }
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args)
      setTimeout(updateParams, 0)
    }

    return () => {
      window.removeEventListener('popstate', updateParams)
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
    }
  }, [])

  return params
}