"use client"

import Image from "next/image"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20 p-8 text-center space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/40 shadow-lg shadow-[#0288D1]/30 animate-pulse">
            <Image src="/logo.png" alt="Zauro" width={64} height={64} className="object-contain" priority />
          </div>
          <div>
            <span className="font-bold text-3xl text-white tracking-wide drop-shadow-md">Zauro</span>
            <p className="text-sm uppercase tracking-widest text-white/70">Marketplace</p>
          </div>
        </div>

        {/* Loading Spinner and Text */}
        <div className="space-y-4">
          <LoadingSpinner size="lg" className="text-white mx-auto" />
          <p className="text-white/80 text-lg">Loading your blockchain-verified marketplace...</p>
        </div>
      </div>
    </div>
  )
}