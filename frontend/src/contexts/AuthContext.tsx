'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import type { FC, PropsWithChildren } from 'react'

import {
  authenticate,
  refreshSession,
  setAuthToken,
  signOut,
  type AuthResponse
} from '@/services/api'

type AuthUser = AuthResponse['user']

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
  isRestoring: boolean
  login: (credentials: AuthCredentials) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isRestoring, setIsRestoring] = useState<boolean>(true)

  const applySession = useCallback((session: AuthResponse) => {
    setToken(session.accessToken)
    setUser(session.user)
    setAuthToken(session.accessToken)
  }, [])

  const clearSession = useCallback(() => {
    setToken(null)
    setUser(null)
    setAuthToken()
  }, [])

  const login = useCallback(
    async (credentials: AuthCredentials): Promise<void> => {
      setIsLoading(true)
      try {
        const response = await authenticate(credentials)
        applySession(response)
      } catch (error) {
        clearSession()
        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [applySession, clearSession]
  )

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      await signOut()
    } finally {
      clearSession()
      setIsLoading(false)
    }
  }, [clearSession])

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    try {
      const session = await refreshSession()
      applySession(session)
    } catch (error) {
      clearSession()
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [applySession, clearSession])

  useEffect(() => {
    const restoreSession = async (): Promise<void> => {
      try {
        const session = await refreshSession()
        applySession(session)
      } catch (error) {
        clearSession()
        console.warn('Não foi possível restaurar a sessão existente.', error)
      } finally {
        setIsRestoring(false)
      }
    }

    void restoreSession()
  }, [applySession, clearSession])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isAdmin: user?.role === 'admin',
      isLoading,
      isRestoring,
      login,
      logout,
      refresh
    }),
    [user, token, isLoading, isRestoring, login, logout, refresh]
  )

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
