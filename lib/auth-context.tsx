"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "./types"
import { api } from "./api"

// 1.  fix the shape so it matches the backend DTO
interface RegisterDTO {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  country?: string        // ← NEW
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: RegisterDTO) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  /* ----------  MOUNT : restore session  ---------- */
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("accessToken")
      const raw = localStorage.getItem("user")

      if (token && raw) {
        try {
          setUser(JSON.parse(raw))
        } catch {
          localStorage.removeItem("user")
        }
      }

      if (token) {
        try {
          const fresh = await api.getProfile()
          setUser(fresh)
          localStorage.setItem("user", JSON.stringify(fresh))
        } catch {
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

 /* ----------  LOGIN  ---------- */
const login = async (email: string, password: string): Promise<User> => {
  const response = await api.login({ email, password })
  localStorage.setItem("accessToken", response.accessToken)
  localStorage.setItem("refreshToken", response.refreshToken)
  localStorage.setItem("user", JSON.stringify(response.user))
  setUser(response.user)
  return response.user // ← ajoutée
}

  /* ----------  REGISTER  ---------- */
  const register = async (data: RegisterDTO) => {
    const response = await api.register(data)
    localStorage.setItem("accessToken", response.accessToken)
    localStorage.setItem("refreshToken", response.refreshToken)
    localStorage.setItem("user", JSON.stringify(response.user))
    setUser(response.user)
  }

  /* ----------  LOGOUT  ---------- */
  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    setUser(null)
  }

  /* ----------  REFRESH USER  ---------- */
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
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