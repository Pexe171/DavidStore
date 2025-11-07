import config from '../../config/default.js'
import { authenticate, logout, refreshTokens, register } from '../services/authService.js'
import { BadRequestError } from '../utils/errors.js'
import {
  getAccessCookieName,
  getAccessCookieOptions,
  getRefreshCookieName,
  getRefreshCookieOptions
} from '../services/tokenService.js'

const buildRequestContext = req => ({
  ip: req.ip,
  userAgent: req.get('user-agent')
})

const setRefreshTokenCookie = (res, token) => {
  if (token) {
    res.cookie(getRefreshCookieName(), token, getRefreshCookieOptions())
  }
}

const clearRefreshTokenCookie = res => {
  res.clearCookie(getRefreshCookieName(), {
    path: config.security.jwt.refreshToken.cookieOptions.path || '/'
  })
}

const setAccessTokenCookie = (res, token) => {
  if (token) {
    res.cookie(getAccessCookieName(), token, getAccessCookieOptions())
  }
}

const clearAccessTokenCookie = res => {
  res.clearCookie(getAccessCookieName(), {
    path: config.security.jwt.accessToken.cookieOptions.path || '/'
  })
}

const sendAuthResponse = (res, session) => {
  res.json({
    token: session.accessToken,
    accessToken: session.accessToken,
    expiresIn: session.expiresIn,
    refreshTokenExpiresAt: session.refreshTokenExpiresAt,
    user: session.user
  })
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const session = await authenticate(email, password, buildRequestContext(req))
    setRefreshTokenCookie(res, session.refreshToken)
    setAccessTokenCookie(res, session.accessToken)
    sendAuthResponse(res, session)
  } catch (error) {
    next(error)
  }
}

export const signup = async (req, res, next) => {
  try {
    const session = await register(req.body, buildRequestContext(req))
    res.status(201)
    setRefreshTokenCookie(res, session.refreshToken)
    setAccessTokenCookie(res, session.accessToken)
    sendAuthResponse(res, session)
  } catch (error) {
    next(error)
  }
}

export const refresh = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.[getRefreshCookieName()]
    const providedToken = req.body?.refreshToken
    const refreshToken = cookieToken || providedToken
    if (!refreshToken) {
      throw new BadRequestError('Refresh token não fornecido.')
    }
    const session = await refreshTokens(refreshToken, buildRequestContext(req))
    setRefreshTokenCookie(res, session.refreshToken)
    setAccessTokenCookie(res, session.accessToken)
    sendAuthResponse(res, session)
  } catch (error) {
    next(error)
  }
}

export const signout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.[getRefreshCookieName()] || req.body?.refreshToken
    if (refreshToken) {
      await logout(refreshToken)
    }
    clearRefreshTokenCookie(res)
    clearAccessTokenCookie(res)
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
