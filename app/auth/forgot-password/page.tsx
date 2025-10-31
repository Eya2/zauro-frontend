"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Mail, Phone, ArrowLeft, CheckCircle, Lock } from "lucide-react"

type Step = "request" | "verify" | "reset" | "success"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("request")
  const [method, setMethod] = useState<"email" | "phone">("email")
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  /* -------------------------------------------------- */
  /* 1. REQUEST OTP                                     */
  /* -------------------------------------------------- */
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const payload =
        method === "email"
          ? { email: formData.email.trim() }
          : { phone: formData.phone.trim() }

      await api.requestPasswordReset(payload)
      setSuccess(`OTP sent to your ${method}`)
      setStep("verify")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  /* -------------------------------------------------- */
  /* 2. VERIFY OTP                                      */
  /* -------------------------------------------------- */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload = { code: formData.code.trim() }
      if (method === "email") Object.assign(payload, { email: formData.email.trim() })
      else Object.assign(payload, { phone: formData.phone.trim() })

      await api.verifyOtp(payload)
      setStep("reset")
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  /* -------------------------------------------------- */
  /* 3. RESET PASSWORD                                  */
  /* -------------------------------------------------- */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }
    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long")
      setLoading(false)
      return
    }

    try {
      const payload = {
        code: formData.code.trim(),
        newPassword: formData.newPassword,
      } as any
      if (method === "email") payload.email = formData.email.trim()
      else payload.phone = formData.phone.trim()

      await api.resetPassword(payload)
      setStep("success")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  /* -------------------------------------------------- */
  /* UI                                                 */
  /* -------------------------------------------------- */
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16] p-4">
      <div className="w-full max-w-lg">
        {/* Logo Section */}
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

        {/* Card */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              {step !== "request" && step !== "success" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white/60 hover:text-white"
                  onClick={() => {
                    if (step === "verify") setStep("request")
                    if (step === "reset") setStep("verify")
                  }}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <CardTitle className="text-center text-white text-2xl">
                  {step === "request" && "Reset Password"}
                  {step === "verify" && "Verify OTP"}
                  {step === "reset" && "New Password"}
                  {step === "success" && "Password Reset"}
                </CardTitle>
                <CardDescription className="text-center text-white/70 text-sm">
                  {step === "request" && "Choose how you'd like to receive your reset code"}
                  {step === "verify" && `Enter the code sent to your ${method}`}
                  {step === "reset" && "Create a new password for your account"}
                  {step === "success" && "Your password has been successfully reset"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 bg-red-500/20 text-red-100 border-red-400/30">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4 bg-green-500/20 text-green-100 border-green-400/30">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            {/* ---------- 1. REQUEST OTP ---------- */}
            {step === "request" && (
              <Tabs value={method} onValueChange={(v) => setMethod(v as "email" | "phone")}>
                <TabsList className="grid w-full grid-cols-2 bg-white/15 border-white/20">
                  <TabsTrigger value="email" className="text-white/80 data-[state=active]:bg-[#093102] data-[state=active]:text-white">
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="text-white/80 data-[state=active]:bg-[#093102] data-[state=active]:text-white">
                    Phone
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email">
                  <form onSubmit={handleRequestOtp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email Address</Label>
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
                    <Button
                      type="submit"
                      className="w-full bg-[#093102] text-white py-2 rounded-xl"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Sending OTP...
                        </>
                      ) : (
                        "Send Reset Code"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="phone">
                  <form onSubmit={handleRequestOtp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={formData.phone}
                          onChange={handleChange}
                          className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50"
                          required
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#093102] text-white py-2 rounded-xl"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Sending OTP...
                        </>
                      ) : (
                        "Send Reset Code"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            )}

            {/* ---------- 2. VERIFY OTP ---------- */}
            {step === "verify" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-white">Verification Code</Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={formData.code}
                    onChange={handleChange}
                    className="text-center text-lg tracking-widest bg-white/15 text-white border-white/20 placeholder:text-white/50"
                    maxLength={6}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#093102] text-white py-2 rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </form>
            )}

            {/* ---------- 3. RESET PASSWORD ---------- */}
            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-white">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" aria-hidden="true" />
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#093102] text-white py-2 rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Resetting...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}

            {/* ---------- 4. SUCCESS ---------- */}
            {step === "success" && (
              <div className="text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <p className="text-white/80">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
                <Button asChild className="w-full bg-[#093102] text-white py-2 rounded-xl">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
              </div>
            )}

            {/* ---------- FOOTER LINK ---------- */}
            {step === "request" && (
              <div className="mt-6 text-center">
                <p className="text-sm text-white/80">
                  Remember your password?{" "}
                  <Link href="/auth/login" className="text-[#939896] hover:underline font-semibold">
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}