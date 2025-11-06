import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import type { FC, PropsWithChildren } from 'react'

import { authenticate, setAuthToken } from '../services/api'

type AuthUser = {
  email: string
  role: 'admin' | 'usuario'
}

type AuthCredentials = {
  email: string
  password: string
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isLoading: boolean
  login: (credentials: AuthCredentials) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const TOKEN_STORAGE_KEY = 'davidstore:auth-token'
const USER_STORAGE_KEY = 'davidstore:auth-user'

const resolveRole = (email: string): AuthUser['role'] => {
  return email === 'admin@davidstore.com' ? 'admin' : 'usuario'
}

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const lastCredentialsRef = useRef<AuthCredentials | null>(null)

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY)
    const storedUser = window.localStorage.getItem(USER_STORAGE_KEY)

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as AuthUser
        setToken(storedToken)
        setUser(parsedUser)
        setAuthToken(storedToken)
      } catch (error) {
        console.warn('Não foi possível restaurar a sessão armazenada:', error)
        window.localStorage.removeItem(TOKEN_STORAGE_KEY)
        window.localStorage.removeItem(USER_STORAGE_KEY)
      }
    }
  }, [])

  const persistSession = useCallback((sessionToken: string, email: string) => {
    const authUser: AuthUser = {
      email,
      role: resolveRole(email)
    }

    setToken(sessionToken)
    setUser(authUser)
    setAuthToken(sessionToken)

    window.localStorage.setItem(TOKEN_STORAGE_KEY, sessionToken)
    window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser))
  }, [])

  const clearSession = useCallback(() => {
    setToken(null)
    setUser(null)
    setAuthToken()
    window.localStorage.removeItem(TOKEN_STORAGE_KEY)
    window.localStorage.removeItem(USER_STORAGE_KEY)
  }, [])

  const login = useCallback(async (credentials: AuthCredentials): Promise<void> => {
    setIsLoading(true)
    try {
      const response = await authenticate(credentials)
      persistSession(response.token, credentials.email)
      lastCredentialsRef.current = credentials
    } finally {
      setIsLoading(false)
    }
  }, [persistSession])

  const logout = useCallback(() => {
    lastCredentialsRef.current = null
    clearSession()
  }, [clearSession])

  const refresh = useCallback(async (): Promise<void> => {
    if (!lastCredentialsRef.current) {
      throw new Error('Credenciais não disponíveis para atualizar a sessão.')
    }

    await login(lastCredentialsRef.current)
  }, [login])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    token,
    isAuthenticated: Boolean(token),
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    logout,
    refresh
  }), [user, token, isLoading, login, logout, refresh])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider')
  }

  return context
}

export default AuthContext
