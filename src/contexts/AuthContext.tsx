import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useNavigate } from 'react-router-dom'

// Log environment variables on load
console.log('=== AuthContext Environment Check ===')
const supabaseUrl = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('SUPABASE_URL:', supabaseUrl ? '✅ Defined' : '❌ Missing')
console.log('SUPABASE_KEY:', supabaseKey ? '✅ Defined' : '❌ Missing')

// Create client with error handling
let supabase
try {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables')
  }
  supabase = createClient(supabaseUrl, supabaseKey)
  console.log('✅ Supabase client created successfully')
} catch (error) {
  console.error('❌ Error creating Supabase client:', error)
  // Create a dummy client to prevent app from crashing
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthContextType {
  user: User | null
  role: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ role: string }>
  logout: () => Promise<void>
  updateUserProfile: (data: Partial<User>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('🔄 AuthProvider useEffect running')
    
    // Verificar se há uma sessão ativa
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('Session check:', session ? '✅ Session found' : '❌ No session')
      if (error) {
        console.error('Session error:', error)
        return
      }
      
      if (session) {
        // Buscar perfil do usuário
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile, error }) => {
            if (error) {
              console.error('Profile error:', error)
              return
            }

            if (profile) {
              console.log('✅ Profile loaded:', profile.role)
              setUser({
                id: session.user.id,
                name: profile.name || '',
                email: session.user.email!,
                role: profile.role
              })
              setRole(profile.role)
              setIsAuthenticated(true)
            }
          })
      }
    })

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event)
      
      if (event === 'SIGNED_IN' && session) {
        // Buscar perfil do usuário
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (error) {
          console.error('Profile error:', error)
          return
        }

        if (profile) {
          console.log('✅ Profile updated:', profile.role)
          setUser({
            id: session.user.id,
            name: profile.name || '',
            email: session.user.email!,
            role: profile.role
          })
          setRole(profile.role)
          setIsAuthenticated(true)
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('❌ User signed out')
        setUser(null)
        setRole(null)
        setIsAuthenticated(false)
        navigate('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [navigate])

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Buscar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) throw profileError

      // Verificar status para profissionais
      if (profile.role === 'professional' && profile.status !== 'approved') {
        throw new Error('Profissional não aprovado')
      }

      setUser({
        id: data.user.id,
        name: profile.name || '',
        email: data.user.email!,
        role: profile.role
      })
      setRole(profile.role)
      setIsAuthenticated(true)

      return { role: profile.role }
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      setUser(null)
      setRole(null)
      setIsAuthenticated(false)
      navigate('/login')
    } catch (error) {
      console.error('Erro no logout:', error)
      throw error
    }
  }

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          // outros campos que podem ser atualizados
        })
        .eq('id', user.id)

      if (error) throw error

      setUser({ ...user, ...data })
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, role, isAuthenticated, login, logout, updateUserProfile }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
