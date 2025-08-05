import { Navigate, useLocation } from 'react-router-dom'

export default function PreserveParamsNavigate({ to, replace = false }) {
  const location = useLocation()
  
  // Preserve search params when navigating
  const preservedTo = `${to}${location.search}`
  
  return <Navigate to={preservedTo} replace={replace} />
}