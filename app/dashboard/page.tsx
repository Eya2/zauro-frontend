"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { useWallet } from "@/hooks/use-wallet"
import { api } from "@/lib/api"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { Animal, Trade } from "@/lib/types"
import { Wallet, TrendingUp, PlusCircle, Eye, Activity, DollarSign, Users, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { toast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { user } = useAuth()
  const { wallet, balance, loading: walletLoading, createWallet } = useWallet()
  const [recentAnimals, setRecentAnimals] = useState<Animal[]>([])
  const [recentTrades, setRecentTrades] = useState<Trade[]>([])
  const [stats, setStats] = useState({
    totalAnimals: 0,
    listedAnimals: 0,
    completedTrades: 0,
    totalValue: "0",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const animalsResponse = await api.getAnimals({ limit: 5 })
        setRecentAnimals(animalsResponse.data || [])

        const tradesResponse = await api.getTrades({ limit: 5 })
        setRecentTrades(tradesResponse.data || [])

        const allAnimalsResponse = await api.getAnimals({ limit: 1000 })
        const allTradesResponse = await api.getTrades({ limit: 1000 })

        const animals = allAnimalsResponse.data || []
        const trades = allTradesResponse.data || []

        const completedTrades = trades.filter((trade) => trade.status === "COMPLETED")
        const totalValue = completedTrades.reduce((sum, trade) => sum + Number.parseFloat(trade.price), 0)

        setStats({
          totalAnimals: animals.length,
          listedAnimals: animals.filter((animal) => animal.isListed).length,
          completedTrades: completedTrades.length,
          totalValue: totalValue.toFixed(2),
        })
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchDashboardData()
  }, [user])

  const handleCreateWallet = async () => {
    try { await createWallet() } catch (error) { console.error("Failed to create wallet:", error) }
  }

  /* ----------  GUARD  ---------- */
  if (!user) return <LoadingSpinner />   // on n’affiche rien tant qu’on n’a pas le user

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {user?.firstName ?? "User"}!
            </h1>
            <p className="text-muted-foreground mt-2">Here&apos;s what&apos;s happening with your animal trading portfolio</p>
          </div>

         {/* ----------  WALLET SECTION  ---------- */}
{wallet ? (
  <Card className="mb-8">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
      <Wallet className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">
        {Number.parseFloat(balance?.hbar || "0").toFixed(2)} HBAR
      </div>
      <p className="text-xs text-muted-foreground">
        {Number.parseFloat(balance?.zauToken || "0").toFixed(2)} ZAU
      </p>
    </CardContent>
  </Card>
) : !walletLoading && (
  <>
    {/*  ORIGINAL ALERT  */}
    <Alert className="mb-8">
      <Wallet className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>You need to create a wallet to start trading animals.</span>
        <Button onClick={handleCreateWallet} size="sm">
          Create Wallet
        </Button>
      </AlertDescription>
    </Alert>

    {/*  NEW: CREATE + FUND WALLET CARD  */}
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Create wallet with starting balance
        </CardTitle>
        <CardDescription>
          Get started immediately—new wallet comes with 10 ℏ pre-funded by the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          onClick={async () => {
            try {
              await api.createWalletWithBalance(10)
              toast({ title: "Wallet created & funded", description: "10 ℏ added to your new account." })
              await createWallet() // re-sync hooks
            } catch {
              toast({ variant: "destructive", title: "Creation failed" })
            }
          }}
        >
          Create Wallet with 10 HBAR
        </Button>
      </CardContent>
    </Card>
  </>
)}
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {walletLoading ? (
                  <LoadingSpinner size="sm" />
                ) : balance ? (
                  <div>
                    <div className="text-2xl font-bold">{Number.parseFloat(balance.hbar).toFixed(2)} HBAR</div>
                    <p className="text-xs text-muted-foreground">{Number.parseFloat(balance.zauToken).toFixed(2)} ZAU</p>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No wallet</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Animals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalAnimals}</div>
                <p className="text-xs text-muted-foreground">{stats.listedAnimals} listed for trade</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Trades</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedTrades}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  Trading activity
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalValue}</div>
                <p className="text-xs text-muted-foreground">From completed trades</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Animals */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Animals</CardTitle>
                  <CardDescription>Your latest registered animals</CardDescription>
                </div>
                <Button asChild size="sm">
                  <Link href="/animals/create">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Animal
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8"><LoadingSpinner /></div>
                ) : recentAnimals.length > 0 ? (
                  <div className="space-y-4">
                    {recentAnimals.slice(0, 5).map((animal) => (
                      <div key={animal.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {animal.imageUrl ? (
                            <img src={animal.imageUrl || "/placeholder.svg"} alt={animal.name} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{animal.name}</p>
                            <p className="text-sm text-muted-foreground">{animal.species} • {animal.breed || "Mixed"}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {animal.isListed && <Badge variant="secondary">Listed</Badge>}
                          {animal.tokenId && <Badge variant="outline">NFT</Badge>}
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/animals/${animal.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/animals">View All Animals</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No animals registered yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/animals/create">Register Your First Animal</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Trades */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Trades</CardTitle>
                  <CardDescription>Your latest trading activity</CardDescription>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href="/trades">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8"><LoadingSpinner /></div>
                ) : recentTrades.length > 0 ? (
                  <div className="space-y-4">
                    {recentTrades.slice(0, 5).map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{trade.animal?.name || "Unknown Animal"}</p>
                          <p className="text-sm text-muted-foreground">{trade.price} {trade.currency}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              trade.status === "COMPLETED"
                                ? "default"
                                : trade.status === "FAILED"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {trade.status}
                          </Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/trades/${trade.id}`}><Eye className="h-4 w-4" /></Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full bg-transparent" asChild>
                      <Link href="/trades">View All Trades</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No trades yet</p>
                    <Button asChild className="mt-4 bg-transparent" variant="outline">
                      <Link href="/animals">Browse Animals to Trade</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}