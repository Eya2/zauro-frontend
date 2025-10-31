"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()

  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await login(formData.email, formData.password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16] p-4">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center text-center mb-10 animate-fade-in">
          <Link href="/" className="flex flex-col items-center gap-3 group">
          <div className="w-28 h-28 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/40 scale-100 group-hover:scale-105 transition-transform shadow-lg shadow-[#0288D1]/30">
  <Image src="/logo.png" alt="Zauro" width={96} height={96} className="object-contain" />
            </div>
            <span className="text-white font-bold text-4xl tracking-wide drop-shadow-md">Zauro</span>
            <span className="text-xs uppercase tracking-widest text-white/70">Marketplace</span>
          </Link>
          <p className="text-white/80 mt-4 text-sm max-w-sm">
            Trading animals with trust — traceability and transparency for everyone.
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
          <CardHeader>
            <CardTitle className="text-center text-white text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-center text-white/70 text-sm">
              Sign in to continue your journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-500/20 text-red-100 border-red-400/30">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 bg-white/15 text-white border-white/20 placeholder:text-white/50"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2 text-white/60 hover:text-white"
                    onClick={() => setShowPassword((s) => !s)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
              </div>

              <Link href="/auth/forgot-password" className="text-sm text-white/60 hover:underline">
                Forgot password?
              </Link>

              <Button
                type="submit"
                className="w-full bg-[#093102] text-white/60 py-2 rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <p className="text-center text-sm mt-6 text-white/80">
              No account yet?{" "}
              <Link href="/auth/register" className="text-[#939896] hover:underline font-semibold">
                Create one
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
