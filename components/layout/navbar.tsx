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
    <nav className="border-b border-primary/20 bg-card/80 backdrop-blur-sm sticky top-0 z-50 agricultural-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
        {/* Logo */}
<Link href="/dashboard" className="flex items-center space-x-3 logo-container">
  <div className="relative w-10 h-10">
    <Image src="/logo.png" alt="Zauro Marketplace" fill className="object-contain" priority />
  </div>
  <div className="flex flex-col">
    <span className="font-bold text-xl text-foreground tracking-wide">Zauro</span>
  </div>
</Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link href="/animals" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Animals
            </Link>
            <Link href="/trades" className="text-muted-foreground hover:text-primary transition-colors font-medium">
              Trading
            </Link>
            {(user.role === "ADMIN" || user.role === "HR_MANAGER") && (
              <Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Wallet Balance */}
            {balance && (
              <div className="hidden sm:flex items-center space-x-2 text-sm bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/20">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-foreground font-medium">{Number.parseFloat(balance.hbar).toFixed(2)} HBAR</span>
                <span className="text-muted-foreground">|</span>
                <span className="text-foreground font-medium">{Number.parseFloat(balance.zauToken).toFixed(2)} ZAU</span>
              </div>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="hover:bg-primary/10" asChild>
              <Link href="/notifications">
                <Bell className="w-4 h-4" />
              </Link>
            </Button>

            {/* User Menu  +  Logout */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-primary/10">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                      {user.firstName?.[0] ?? ""}
                      {user.lastName?.[0] ?? ""}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 agricultural-card" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-foreground">{user.firstName} {user.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    <Badge variant="secondary" className="w-fit text-xs bg-primary/10 text-primary">
                      {user.role?.replace("_", " ") ?? "—"}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center"><User className="mr-2 h-4 w-4" />Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center"><Settings className="mr-2 h-4 w-4" />Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout()
                    window.location.href = "/auth/login"
                  }}
                  className="text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
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