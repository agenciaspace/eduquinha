import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getSchoolUrl, getSubdomain } from '../utils/subdomain'

/**
 * Hook to redirect user to their school's subdomain after login
 */
export const useSchoolRedirect = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Only redirect if user is logged in and has a profile with escola
    if (!user || !profile?.escolas?.slug) return

    const currentSubdomain = getSubdomain()
    const expectedSubdomain = profile.escolas.slug

    // If we're already on the correct subdomain, do nothing
    if (currentSubdomain === expectedSubdomain) {
      return
    }

    // If we're in production, redirect to the correct subdomain
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      const schoolUrl = getSchoolUrl(expectedSubdomain)
      window.location.href = `${schoolUrl}/dashboard`
      return
    }

    // For local development, use navigate with escola parameter
    const urlParams = new URLSearchParams(location.search)
    urlParams.set('escola', expectedSubdomain)
    
    const newUrl = `/dashboard?${urlParams.toString()}`
    navigate(newUrl, { replace: true })
    
  }, [user, profile, navigate, location])
}

/**
 * Hook to ensure URL always contains school parameter in development
 */
export const useEnsureSchoolParam = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Only run in development
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return
    }

    // Only if user has a school
    if (!profile?.escolas?.slug) return

    const urlParams = new URLSearchParams(location.search)
    const escolaParam = urlParams.get('escola')

    // If escola parameter is missing, add it
    if (!escolaParam) {
      urlParams.set('escola', profile.escolas.slug)
      const newUrl = `${location.pathname}?${urlParams.toString()}${location.hash}`
      navigate(newUrl, { replace: true })
    }
  }, [profile, location, navigate])
}