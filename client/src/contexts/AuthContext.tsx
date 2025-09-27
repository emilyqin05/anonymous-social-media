"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

interface User {
  id: number
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem("token")
    if (token) {
      // Set axios default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`

      // Decode token to get user info (simple JWT decode)
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setUser({
          id: payload.userId,
          username: payload.username,
          email: payload.email,
        })
      } catch (error) {
        // Invalid token, remove it
        localStorage.removeItem("token")
        delete axios.defaults.headers.common["Authorization"]
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password })
      const { token, user: userData } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Login failed")
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/register", { username, email, password })
      const { token, user: userData } = response.data

      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Registration failed")
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
