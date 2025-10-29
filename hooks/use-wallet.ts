"use client"

import { useState, useEffect } from "react"
import type { Wallet, WalletBalance } from "@/lib/types"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"

export function useWallet() {
  const { user } = useAuth()
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [balance, setBalance] = useState<WalletBalance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchWallet = async () => {
    if (!user) return
    console.log(">>> fetching wallet for user", user.id)
    try {
      setLoading(true)
      const w = await api.getMyWallet()
      console.log(">>> wallet OK", w)
      setWallet(w)

      // balance
      const b = await api.getWalletBalance()
      console.log(">>> balance OK", b)
      setBalance(b)
    } catch (e: any) {
      console.error(">>> wallet/balance KO", e.message, e.response?.status)
      if (e.response?.status === 404) setWallet(null) // pas encore créé
      else setError(e.message || "Failed to fetch wallet")
    } finally {
      setLoading(false)
    }
  }

  const createWallet = async () => {
    const w = await api.createWallet()   // POST + déballage corrigé
    setWallet(w)
    const b = await api.getWalletBalance()
    setBalance(b)
  }

  const refreshBalance = async () => {
    if (!wallet) return
    try {
      const balanceData = await api.getWalletBalance()
      setBalance(balanceData)
    } catch (err: any) {
      setError(err.message || "Failed to refresh balance")
    }
  }

  useEffect(() => {
    fetchWallet()
  }, [user])

  return { wallet, balance, loading, error, createWallet, refreshBalance, refetch: fetchWallet }
}