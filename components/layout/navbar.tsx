"use client"

import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { useWallet } from "@/hooks/use-wallet"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, User, LogOut, Wallet, Settings } from "lucide-react"

export function Navbar() {
  const { user, logout } = useAuth()
  const { balance } = useWallet()

  if (!user) return null // guard

  return (
    <nav className="bg-white/10 backdrop-blur-xl border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/40 scale-100 group-hover:scale-105 transition-transform shadow-lg shadow-[#0288D1]/30">
              <Image src="/logo.png" alt="Zauro" width={40} height={40} className="object-contain" priority />
            </div>
            <div className="flex flex-col animate-fade-in">
              <span className="font-bold text-xl text-white tracking-wide">Zauro</span>
              <span className="text-xs uppercase tracking-widest text-white/70">Marketplace</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/dashboard"
              className="text-white/80 hover:text-[#939896] transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/animals"
              className="text-white/80 hover:text-[#939896] transition-colors font-medium"
            >
              Animals
            </Link>
            <Link
              href="/trades"
              className="text-white/80 hover:text-[#939896] transition-colors font-medium"
            >
              Trading
            </Link>
            {(user.role === "ADMIN" || user.role === "HR_MANAGER") && (
              <Link
                href="/admin"
                className="text-white/80 hover:text-[#939896] transition-colors font-medium"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Wallet Balance */}
            {balance && (
              <div className="hidden sm:flex items-center space-x-2 text-sm bg-white/15 px-3 py-1.5 rounded-lg border border-white/20">
                <Wallet className="w-4 h-4 text-white/50" />
                <span className="text-white font-medium">{Number.parseFloat(balance.hbar).toFixed(2)} HBAR</span>
              </div>
            )}

            {/* User Menu + Logout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full text-white/60 hover:text-white hover:bg-white/10">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-[#093102] text-white font-semibold">
                      {user.firstName?.[0] ?? ""}
                      {user.lastName?.[0] ?? ""}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-white/10 backdrop-blur-xl border-white/20 text-white" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-white/70">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center text-white hover:bg-white/15">
                    <User className="mr-2 h-4 w-4 text-white/50" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center text-white hover:bg-white/15">
                    <Settings className="mr-2 h-4 w-4 text-white/50" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout()
                    window.location.href = "/auth/login"
                  }}
                  className="text-red-100 hover:bg-red-500/20"
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-100" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
    
  )
}