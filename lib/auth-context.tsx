"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "./types"
import { api } from "./api"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ----------  MOUNT : restore session ----------
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken")
      const raw = localStorage.getItem("user")

      // 1. try to restore saved user instantly
      if (token && raw) {
        try {
          setUser(JSON.parse(raw))
        } catch {
          localStorage.removeItem("user")
        }
      }

      // 2. verify / refresh profile in background
      if (token) {
        try {
          const fresh = await api.getProfile()
          setUser(fresh)
          localStorage.setItem("user", JSON.stringify(fresh))
        } catch {
          // token invalid → wipe everything
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("user")
          setUser(null)
        }
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  // ----------  LOGIN ----------
  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password })
    localStorage.setItem("accessToken", response.accessToken)
    localStorage.setItem("refreshToken", response.refreshToken)
    localStorage.setItem("user", JSON.stringify(response.user)) // persist
    setUser(response.user)
  }

  // ----------  REGISTER ----------
  const register = async (data: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }) => {
    const response = await api.register(data)
    localStorage.setItem("accessToken", response.accessToken)
    localStorage.setItem("refreshToken", response.refreshToken)
    localStorage.setItem("user", JSON.stringify(response.user)) // persist
    setUser(response.user)
  }

  // ----------  LOGOUT ----------
  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user") // wipe persisted user
    setUser(null)
  }

  // ----------  REFRESH USER ----------
  const refreshUser = async () => {
    if (!user) return
    try {
      const fresh = await api.getProfile()
      setUser(fresh)
      localStorage.setItem("user", JSON.stringify(fresh))
    } catch (error) {
      console.error("Failed to refresh user data:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}