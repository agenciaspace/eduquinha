import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { getSubdomain } from '../utils/subdomain'
import { useUrlParams } from '../hooks/useUrlParams'

const SchoolContext = createContext({})

export const useSchool = () => useContext(SchoolContext)

export const SchoolProvider = ({ children }) => {
  const [school, setSchool] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const urlParams = useUrlParams()

  useEffect(() => {
    console.log('🏫 SchoolContext - URL params changed:', urlParams)
    fetchSchoolData()
  }, [urlParams.escola]) // Re-run when 'escola' parameter changes

  const fetchSchoolData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const subdomain = getSubdomain()
      console.log('🏫 SchoolContext - URL atual:', window.location.href)
      console.log('🏫 SchoolContext - Search params:', window.location.search)
      console.log('🏫 SchoolContext - Subdomain detected:', subdomain)
      
      if (!subdomain) {
        console.log('🏫 SchoolContext - No subdomain, using main site')
        setSchool(null)
        setLoading(false)
        return
      }

      console.log('🏫 SchoolContext - Fetching school with slug:', subdomain)

      // Fetch school data from database
      const { data, error } = await supabase
        .from('escolas')
        .select(`
          *,
          configuracoes_escola (*)
        `)
        .eq('slug', subdomain)
        .eq('ativo', true)
        .single()

      console.log('🏫 SchoolContext - Query result:', { data, error })

      if (error) {
        console.error('🏫 SchoolContext - Error fetching school:', error)
        if (error.code === 'PGRST116') {
          // No school found with this subdomain
          console.log('🏫 SchoolContext - School not found with slug:', subdomain)
          setError('SCHOOL_NOT_FOUND')
        } else {
          console.log('🏫 SchoolContext - Database error:', error.message)
          setError('SCHOOL_LOAD_ERROR')
        }
        setSchool(null)
      } else {
        console.log('🏫 SchoolContext - School data loaded successfully:', data)
        setSchool(data)
      }
    } catch (error) {
      console.error('🏫 SchoolContext - Unexpected error:', error)
      setError('Erro inesperado')
      setSchool(null)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    school,
    loading,
    error,
    isSchoolSite: !!school,
    refreshSchool: fetchSchoolData
  }

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  )
}