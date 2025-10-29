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
import { api } from "@/lib/api" // <-- your ApiClient instance

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const { wallet, balance, loading: walletLoading, createWallet, refreshBalance } = useWallet()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
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
      // await api.updateProfile(formData) // <-- plug real call when ready
      await refreshUser()
      toast({ title: "Profile updated", description: "Your profile has been successfully updated." })
    } catch {
      toast({ variant: "destructive", title: "Update failed", description: "Failed to update profile." })
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
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="wallet">Wallet</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* -------------------------------------------------------------- */
            /*  PROFILE TAB                                                    */
            /* -------------------------------------------------------------- */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span>Personal Information</span>
                  </CardTitle>
                  <CardDescription>Update your personal details and contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Account Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Role:</span>
                          <Badge variant="secondary">{user?.role.replace("_", " ")}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Member since:</span>
                          <span className="text-sm">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                   {/* -----  UPDATE PROFILE  ----- */}
<div className="space-y-2">
  <Button type="submit" disabled className="w-full cursor-not-allowed opacity-60">
    Update Profile
  </Button>
  <p className="text-xs text-muted-foreground text-center">
    Profile editing will be available soon.
  </p>
</div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* -------------------------------------------------------------- */
/*  WALLET TAB  (now with: transfer / fund / create-with-balance)  */
/* -------------------------------------------------------------- */}
<TabsContent value="wallet">
  <div className="space-y-6">
    {/* ---- main wallet card ---- */}
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          <span>Blockchain Wallet</span>
        </CardTitle>
        <CardDescription>Manage your Hedera wallet and view balances</CardDescription>
      </CardHeader>

      <CardContent>
        {walletLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : wallet ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Hedera Account ID</p>
                  <p className="font-mono text-sm text-muted-foreground">{wallet.hederaAccountId}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(wallet.hederaAccountId, "Account ID")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Public Key</p>
                  <p className="font-mono text-sm text-muted-foreground max-w-xs truncate">
                    {wallet.publicKey}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(wallet.publicKey, "Public Key")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Wallet Balance</h3>
                <Button variant="outline" size="sm" onClick={refreshBalance}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh
                </Button>
              </div>

              {balance ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-2xl font-bold">
                        {Number.parseFloat(balance.hbar).toFixed(4)}
                      </p>
                      <p className="text-sm text-muted-foreground">HBAR</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6 text-center">
                      <p className="text-2xl font-bold">
                        {Number.parseFloat(balance.zauToken).toFixed(4)}
                      </p>
                      <p className="text-sm text-muted-foreground">ZAU Token</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Alert>
                  <AlertDescription>Unable to fetch balance. Try refreshing.</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Wallet className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-medium">No Wallet Found</h3>
            <p className="mb-6 text-muted-foreground">
              Create a blockchain wallet to start trading animals as NFTs
            </p>
            <Button onClick={handleCreateWallet}>Create Wallet</Button>
          </div>
        )}
      </CardContent>
    </Card>

    {/* ---- send hbar card ---- */}
    {wallet && (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Send HBAR</CardTitle>
          <CardDescription>Transfer HBAR to another Hedera account</CardDescription>
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
            <div>
              <Label htmlFor="to">Recipient Account ID</Label>
              <Input id="to" name="to" placeholder="0.0.12345" required />
            </div>
            <div>
              <Label htmlFor="amount">Amount (HBAR)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.0001"
                min="0.0001"
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <LoadingSpinner size="sm" /> : "Send HBAR"}
            </Button>
          </form>
        </CardContent>
      </Card>
    )}

    {/* ---- fund my wallet card ---- */}
    {wallet && (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fund my wallet</CardTitle>
          <CardDescription>Top up your wallet with HBAR from the operator account</CardDescription>
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
          >
            {loading ? <LoadingSpinner size="sm" /> : "Add 10 HBAR"}
          </Button>
        </CardContent>
      </Card>
    )}

    {/* ---- create wallet + balance card ---- */}
    {!wallet && (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Create & fund wallet</CardTitle>
          <CardDescription>
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
                // re-fetch wallet/balance hooks
                await createWallet() // or simply reload your wallet query
                refreshBalance()
              } catch {
                toast({ variant: "destructive", title: "Creation failed" })
              } finally {
                setLoading(false)
              }
            }}
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="sm" /> : "Create wallet with 10 HBAR"}
          </Button>
        </CardContent>
      </Card>
    )}
  </div>
</TabsContent>
            {/* -------------------------------------------------------------- */
            /*  SECURITY TAB                                                   */
            /* -------------------------------------------------------------- */}
            <TabsContent value="security">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      <span>Password & Security</span>
                    </CardTitle>
                    <CardDescription>Manage your account security settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="mr-2 h-4 w-4" />
                      Two-Factor Authentication
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Login Sessions
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      <span>Notification Preferences</span>
                    </CardTitle>
                    <CardDescription>Choose how you want to receive notifications</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive trade updates via email</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Notifications</p>
                        <p className="text-sm text-muted-foreground">Receive trade updates via SMS</p>
                      </div>
                      <Button variant="outline" size="sm">
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