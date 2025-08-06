import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSchool } from '../contexts/SchoolContext'
import { getSubdomain } from '../utils/subdomain'

export default function EnsureSchoolInUrl({ children }) {
  const { profile } = useAuth()
  const { school } = useSchool()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Only run if user is logged in and has a profile
    if (!profile?.escola_id) return

    const currentSubdomain = getSubdomain()
    
    // If we're in production and subdomain is already set, do nothing
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return
    }

    // For local development, ensure escola parameter is in URL
    const urlParams = new URLSearchParams(location.search)
    const escolaParam = urlParams.get('escola')
    
    // If escola parameter is missing but we have escola_id, fetch and add it
    if (!escolaParam && profile.escola_id && school?.slug) {
      urlParams.set('escola', school.slug)
      const newUrl = `${location.pathname}?${urlParams.toString()}${location.hash}`
      navigate(newUrl, { replace: true })
    }
  }, [profile, school, location, navigate])

  return children
}