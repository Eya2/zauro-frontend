"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useWallet } from "@/hooks/use-wallet"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  User, Mail, Phone, Calendar, Shield, Wallet, Copy, RefreshCw, Settings, Bell, Lock,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { wallet, balance, loading: walletLoading, createWallet, refreshBalance } = useWallet()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: (user as any)?.phone ?? "",
  })

  /* ---------- helpers ---------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }))

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!", description: `${label} copied to clipboard.` })
  }

  /* ---------- profile ---------- */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.updateProfile(formData)
      await refreshUser()
      toast({ title: "Profile updated", description: "Your profile has been successfully updated." })
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: err.response?.data?.message || "Failed to update profile.",
      })
    } finally {
      setLoading(false)
    }
  }

  /* ---------- wallet ---------- */
  const handleCreateWallet = async () => {
    try {
      await createWallet()
      toast({ title: "Wallet created", description: "Your blockchain wallet has been successfully created." })
    } catch {
      toast({ variant: "destructive", title: "Wallet creation failed" })
    }
  }

  /* ---------- render ---------- */
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16]">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-white/70 mt-2">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/15 border-white/20 rounded-xl p-1">
              <TabsTrigger
                value="profile"
                className="text-white/80 data-[state=active]:bg-[#093102] data-[state=active]:text-white rounded-lg"
              >
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="wallet"
                className="text-white/80 data-[state=active]:bg-[#093102] data-[state=active]:text-white rounded-lg"
              >
                Wallet
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="text-white/80 data-[state=active]:bg-[#093102] data-[state=active]:text-white rounded-lg"
              >
                Security
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <User className="h-5 w-5 text-[#939896]" />
                    <span>Personal Information</span>
                  </CardTitle>
                  <CardDescription className="text-white/70">Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-white">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-white">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                        />
                      </div>
                    </div>

                    <Separator className="bg-white/20" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-white">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-[#939896]" />
                          <span className="text-sm text-white/70">Role:</span>
                          <Badge className="bg-[#093102] text-white">{user?.role.replace("_", " ")}</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl"
                      >
                        {loading && <LoadingSpinner className="mr-2 h-4 w-4 text-white" />}
                        Update Profile
                      </Button>
                      {loading && (
                        <p className="text-xs text-white/70 text-center">Saving…</p>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wallet Tab */}
            <TabsContent value="wallet">
              <div className="space-y-8">
                {/* Main Wallet Card */}
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Wallet className="h-5 w-5 text-[#939896]" />
                      <span>Blockchain Wallet</span>
                    </CardTitle>
                    <CardDescription className="text-white/70">Manage your Hedera wallet and view balances</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {walletLoading ? (
                      <div className="flex justify-center py-8">
                        <LoadingSpinner className="text-white" />
                      </div>
                    ) : wallet ? (
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between rounded-xl border border-white/20 p-4 bg-white/15">
                            <div>
                              <p className="font-medium text-white">Hedera Account ID</p>
                              <p className="font-mono text-sm text-white/70">{wallet.hederaAccountId}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(wallet.hederaAccountId, "Account ID")}
                              className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                            >
                              <Copy className="h-4 w-4 text-white/50" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between rounded-xl border border-white/20 p-4 bg-white/15">
                            <div>
                              <p className="font-medium text-white">Public Key</p>
                              <p className="font-mono text-sm text-white/70 max-w-xs truncate">
                                {wallet.publicKey}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(wallet.publicKey, "Public Key")}
                              className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                            >
                              <Copy className="h-4 w-4 text-white/50" />
                            </Button>
                          </div>
                        </div>

                        <Separator className="bg-white/20" />

                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-white">Wallet Balance</h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={refreshBalance}
                              className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                            >
                              <RefreshCw className="mr-2 h-4 w-4 text-white/50" />
                              Refresh
                            </Button>
                          </div>

                          {balance ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <Card className="bg-white/15 border-white/20 rounded-xl">
                                <CardContent className="pt-6 text-center">
                                  <p className="text-2xl font-bold text-white">
                                    {Number.parseFloat(balance.hbar).toFixed(4)}
                                  </p>
                                  <p className="text-sm text-white/70">HBAR</p>
                                </CardContent>
                              </Card>
                              <Card className="bg-white/15 border-white/20 rounded-xl">
                                <CardContent className="pt-6 text-center">
                                  <p className="text-2xl font-bold text-white">
                                  <p className="text-sm text-white/70 font-bold">Coming soon</p>

                                  </p>
                                  <p className="text-sm text-white/70">ZAU Token</p>
                                </CardContent>
                              </Card>
                            </div>
                          ) : (
                            <Alert className="bg-red-500/20 text-red-100 border-red-400/30">
                              <AlertDescription>Unable to fetch balance. Try refreshing.</AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Wallet className="mx-auto mb-4 h-16 w-16 text-white/50" />
                        <h3 className="mb-2 text-lg font-medium text-white">No Wallet Found</h3>
                        <p className="mb-6 text-white/70">
                          Create a blockchain wallet to start trading animals as NFTs
                        </p>
                        <Button
                          onClick={handleCreateWallet}
                          className="bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl"
                        >
                          Create Wallet
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Send HBAR Card */}
                {wallet && (
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                    <CardHeader>
                      <CardTitle className="text-base text-white">Send HBAR</CardTitle>
                      <CardDescription className="text-white/70">Transfer HBAR to another Hedera account</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form
                        className="space-y-4"
                        onSubmit={async (e) => {
                          e.preventDefault()
                          const fd = new FormData(e.currentTarget)
                          const to = fd.get("to") as string
                          const amt = fd.get("amount") as string
                          if (!to || !amt) return
                          setLoading(true)
                          try {
                            const { txId } = await api.transferHbar(to, amt)
                            toast({ title: "Transfer sent", description: `Tx ID: ${txId}` })
                            refreshBalance()
                            e.currentTarget.reset()
                          } catch {
                            toast({ variant: "destructive", title: "Transfer failed" })
                          } finally {
                            setLoading(false)
                          }
                        }}
                      >
                        <div className="space-y-2">
                          <Label htmlFor="to" className="text-white">Recipient Account ID</Label>
                          <Input
                            id="to"
                            name="to"
                            placeholder="0.0.12345"
                            required
                            className="bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount" className="text-white">Amount (HBAR)</Label>
                          <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.0001"
                            min="0.0001"
                            required
                            className="bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl"
                        >
                          {loading ? <LoadingSpinner size="sm" className="text-white" /> : "Send HBAR"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {/* Fund My Wallet Card */}
                {wallet && (
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                    <CardHeader>
                      <CardTitle className="text-base text-white">Fund My Wallet</CardTitle>
                      <CardDescription className="text-white/70">
  Top up your wallet with HBAR from the operator account
  {" "}
  <span className="text-red-500 font-bold">
    (This is intended for testing purposes only.)
  </span>
</CardDescription>

                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={async () => {
                          setLoading(true)
                          try {
                            const { txId } = await api.fundMyAccount("10")
                            toast({ title: "Wallet funded", description: `Tx ID: ${txId}` })
                            refreshBalance()
                          } catch {
                            toast({ variant: "destructive", title: "Funding failed" })
                          } finally {
                            setLoading(false)
                          }
                        }}
                        disabled={loading}
                        className="bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl"
                      >
                        {loading ? <LoadingSpinner size="sm" className="text-white" /> : "Add 10 HBAR"}
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {/* Create Wallet + Balance Card */}
                {!wallet && (
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                    <CardHeader>
                      <CardTitle className="text-base text-white">Create & Fund Wallet</CardTitle>
                      <CardDescription className="text-white/70">
                        Create a new Hedera wallet and receive an initial 10 ℏ starting balance
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={async () => {
                          setLoading(true)
                          try {
                            const newWallet = await api.createWalletWithBalance(10)
                            toast({ title: "Wallet created & funded", description: `Account ${newWallet.hederaAccountId}` })
                            await createWallet()
                            refreshBalance()
                          } catch {
                            toast({ variant: "destructive", title: "Creation failed" })
                          } finally {
                            setLoading(false)
                          }
                        }}
                        disabled={loading}
                        className="bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl"
                      >
                        {loading ? <LoadingSpinner size="sm" className="text-white" /> : "Create Wallet with 10 HBAR"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <div className="space-y-8">
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Lock className="h-5 w-5 text-[#939896]" />
                      <span>Password & Security</span>
                    </CardTitle>
                    <CardDescription className="text-white/70">Manage your account security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                    >
                      <Lock className="mr-2 h-4 w-4 text-white/50" />
                      Change Password
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                    >
                      <Shield className="mr-2 h-4 w-4 text-white/50" />
                      Two-Factor Authentication
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                    >
                      <Settings className="mr-2 h-4 w-4 text-white/50" />
                      Login Sessions
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Bell className="h-5 w-5 text-[#939896]" />
                      <span>Notification Preferences</span>
                    </CardTitle>
                    <CardDescription className="text-white/70">Choose how you want to receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">Email Notifications</p>
                        <p className="text-sm text-white/70">Receive trade updates via email</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                      >
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">SMS Notifications</p>
                        <p className="text-sm text-white/70">Receive trade updates via SMS</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                      >
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ProtectedRoute>
  )
}