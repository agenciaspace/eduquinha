import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions and sets the user
    console.log('AuthContext - Checking initial session...')
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext - Initial session:', session?.user?.id || 'No session')
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId) => {
    try {
      console.log('👤 AuthContext - Fetching profile for user:', userId)
      
      // First, try to get profile with escola join
      let { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          escolas (
            id,
            nome,
            slug,
            logo_url
          )
        `)
        .eq('id', userId)
        .single()

      console.log('👤 AuthContext - Profile with escola join result:', { data, error })

      // If join fails, try without join
      if (error && error.code !== 'PGRST116') {
        console.log('👤 AuthContext - Join failed, trying simple query...')
        const simpleResult = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
        
        data = simpleResult.data
        error = simpleResult.error
        
        console.log('👤 AuthContext - Simple profile query result:', { data, error })
        
        // If we got profile data, try to fetch escola separately
        if (data && data.escola_id) {
          try {
            const { data: escolaData } = await supabase
              .from('escolas')
              .select('id, nome, slug, logo_url')
              .eq('id', data.escola_id)
              .single()
            
            if (escolaData) {
              data.escolas = escolaData
              console.log('👤 AuthContext - Added escola data separately:', escolaData)
            }
          } catch (escolaError) {
            console.log('👤 AuthContext - Could not fetch escola separately:', escolaError)
          }
        }
      }

      if (error) {
        console.error('👤 AuthContext - Profile fetch error:', error)
        if (error.code === 'PGRST116') {
          console.log('👤 AuthContext - No profile found in database for user:', userId)
          setProfile(null)
        } else {
          console.error('👤 AuthContext - Database error:', error.message)
          setProfile(null)
        }
      } else {
        console.log('👤 AuthContext - Profile fetched successfully:', data)
        setProfile(data)
      }
    } catch (error) {
      console.error('👤 AuthContext - Unexpected error fetching profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const signInWithEmail = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signUpWithEmail = async (email, password, metadata) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}