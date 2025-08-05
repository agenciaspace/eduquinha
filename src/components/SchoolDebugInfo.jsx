import React, { useEffect, useState } from 'react'
import { AlertCircle, Info } from 'lucide-react'
import { getSubdomain, isSchoolSubdomain } from '../utils/subdomain'
import { useSchool } from '../contexts/SchoolContext'

export default function SchoolDebugInfo() {
  const { school, loading, error, isSchoolSite } = useSchool()
  const [debugData, setDebugData] = useState({})

  useEffect(() => {
    const updateDebugData = () => {
      setDebugData({
        timestamp: new Date().toISOString(),
        url: {
          href: window.location.href,
          hostname: window.location.hostname,
          search: window.location.search,
          params: Object.fromEntries(new URLSearchParams(window.location.search))
        },
        subdomain: {
          detected: getSubdomain(),
          isSchoolSite: isSchoolSubdomain()
        },
        context: {
          loading,
          error,
          isSchoolSite,
          schoolData: school
        }
      })
    }

    updateDebugData()
    
    // Update on URL change
    const handleLocationChange = () => {
      setTimeout(updateDebugData, 100)
    }
    
    window.addEventListener('popstate', handleLocationChange)
    return () => window.removeEventListener('popstate', handleLocationChange)
  }, [school, loading, error, isSchoolSite])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-black/90 text-white p-4 rounded-lg shadow-lg text-xs z-50">
      <div className="flex items-center gap-2 mb-2">
        <Info className="w-4 h-4" />
        <span className="font-semibold">School Debug</span>
      </div>
      
      <div className="space-y-2">
        <div>
          <strong>URL:</strong> {debugData.url?.search || 'sem params'}
        </div>
        
        <div>
          <strong>Subdomain:</strong> 
          <span className={`ml-1 px-1 rounded ${
            debugData.subdomain?.detected 
              ? 'bg-green-600' 
              : 'bg-red-600'
          }`}>
            {debugData.subdomain?.detected || 'nenhum'}
          </span>
        </div>
        
        <div>
          <strong>Is School Site:</strong> 
          <span className={`ml-1 px-1 rounded ${
            debugData.context?.isSchoolSite 
              ? 'bg-green-600' 
              : 'bg-red-600'
          }`}>
            {debugData.context?.isSchoolSite ? 'SIM' : 'NÃO'}
          </span>
        </div>
        
        <div>
          <strong>Context Loading:</strong> 
          <span className={`ml-1 px-1 rounded ${
            debugData.context?.loading 
              ? 'bg-yellow-600' 
              : 'bg-gray-600'
          }`}>
            {debugData.context?.loading ? 'SIM' : 'NÃO'}
          </span>
        </div>
        
        {debugData.context?.error && (
          <div className="bg-red-600 p-1 rounded">
            <strong>Erro:</strong> {debugData.context.error}
          </div>
        )}
        
        {debugData.context?.schoolData && (
          <div className="bg-green-600 p-1 rounded">
            <strong>Escola:</strong> {debugData.context.schoolData.nome}
          </div>
        )}
      </div>
    </div>
  )
}