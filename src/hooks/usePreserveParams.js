import { useLocation } from 'react-router-dom'

export const usePreserveParams = () => {
  const location = useLocation()
  
  const preserveParams = (path) => {
    return `${path}${location.search}`
  }
  
  return { preserveParams }
}