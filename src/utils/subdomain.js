/**
 * Utility functions for handling school subdomains
 */

export const getSubdomain = () => {
  const hostname = window.location.hostname
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check for subdomain in URL parameters for local testing
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('escola') || null
  }
  
  // Production - extract subdomain
  const parts = hostname.split('.')
  if (parts.length >= 3) {
    const subdomain = parts[0]
    // Ignore common subdomains
    if (['www', 'app', 'api', 'admin'].includes(subdomain)) {
      return null
    }
    return subdomain
  }
  
  return null
}

export const isSchoolSubdomain = () => {
  return getSubdomain() !== null
}

export const getSchoolUrl = (schoolSlug) => {
  const hostname = window.location.hostname
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const port = window.location.port ? `:${window.location.port}` : ''
    return `${window.location.protocol}//${hostname}${port}?escola=${schoolSlug}`
  }
  
  // Production
  const parts = hostname.split('.')
  if (parts.length >= 2) {
    const domain = parts.slice(-2).join('.')
    return `${window.location.protocol}//${schoolSlug}.${domain}`
  }
  
  return `${window.location.protocol}//${schoolSlug}.eduquinha.com.br`
}

export const getBaseUrl = () => {
  const hostname = window.location.hostname
  
  // Local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const port = window.location.port ? `:${window.location.port}` : ''
    return `${window.location.protocol}//${hostname}${port}`
  }
  
  // Production - remove subdomain
  const parts = hostname.split('.')
  if (parts.length >= 3) {
    const domain = parts.slice(-2).join('.')
    return `${window.location.protocol}//${domain}`
  }
  
  return window.location.origin
}

export const redirectToSchoolLogin = (schoolSlug) => {
  const schoolUrl = getSchoolUrl(schoolSlug)
  window.location.href = `${schoolUrl}/login`
}

export const redirectToSchoolRegister = (schoolSlug, role = 'aluno') => {
  const schoolUrl = getSchoolUrl(schoolSlug)
  window.location.href = `${schoolUrl}/cadastro?tipo=${role}`
}