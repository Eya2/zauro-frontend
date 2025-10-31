"use client"

import { useState, useEffect, useMemo } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Users,
  PawPrint,
  TrendingUp,
  DollarSign,
  Search,
  Shield,
  AlertTriangle,
  Check,
  X,
} from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { ProtectedRoute } from "@/components/auth/protected-route"
import type { User, Animal, Trade } from "@/lib/types"

export default function AdminPage() {
  /* -------------------------------------------------
   * Data
   * -----------------------------------------------*/
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAnimals: 0,
    totalTrades: 0,
    totalRevenue: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [animals, setAnimals] = useState<Animal[]>([]) // pending-review items
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  /* -------------------------------------------------
   * Search
   * -----------------------------------------------*/
  const [searchTerm, setSearchTerm] = useState("")

  /* -------------------------------------------------
   * Review drawer
   * -----------------------------------------------*/
  const [reviewing, setReviewing] = useState<Animal | null>(null)
  const [reviewComment, setReviewComment] = useState("")

  /* -------------------------------------------------
   * Load data
   * -----------------------------------------------*/
  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      const [pendingRes, tradesRes] = await Promise.all([
        api.getPendingReview({ limit: 100 }),
        api.getTrades({ limit: 50 }),
      ])
  
      setAnimals(pendingRes.data ?? [])   // ⬅️
      setTrades(tradesRes.data ?? [])     // ⬅️
  
      setStats({
        totalUsers: 0, // todo
        totalAnimals: pendingRes.pagination.total,
        totalTrades: tradesRes.pagination.total,
        totalRevenue: (tradesRes.data ?? [])                // ⬅️
          .filter((t) => t.status === 'COMPLETED')
          .reduce((sum, t) => sum + Number(t.price), 0),
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  /* -------------------------------------------------
   * Review actions
   * -----------------------------------------------*/
  const onReview = async (approved: boolean) => {
    if (!reviewing) return
    setProcessingId(reviewing.id)
    try {
      await api.reviewAnimal(reviewing.id, { approved, comment: reviewComment.trim() || undefined })
      setAnimals((prev) => prev.filter((a) => a.id !== reviewing.id))
      setReviewing(null)
      setReviewComment("")
    } finally {
      setProcessingId(null)
    }
  }

  /* -------------------------------------------------
   * Search filter
   * -----------------------------------------------*/
  const filteredAnimals = useMemo(() => {
    if (!searchTerm) return animals
    const q = searchTerm.toLowerCase()
    return animals.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.species.toLowerCase().includes(q) ||
        (a.breed && a.breed.toLowerCase().includes(q))
    )
  }, [animals, searchTerm])

  /* -------------------------------------------------
   * Helpers
   * -----------------------------------------------*/
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING_EXPERT_REVIEW: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      EXPIRED: "bg-gray-100 text-gray-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      FAILED: "bg-red-100 text-red-800",
    }
    return map[status] || "bg-gray-100 text-gray-800"
  }

  /* -------------------------------------------------
   * Render
   * -----------------------------------------------*/
  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Coming soon</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Animals</CardTitle>
              <PawPrint className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnimals}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trades</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTrades}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue (HBAR)</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Completed trades</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="animals" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="animals">Review Animals</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          {/* ---------------------------------------------
           * Animals (pending review)
           * -------------------------------------------*/}
          <TabsContent value="animals" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Pending Review</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading && !animals.length ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-4">
                    {filteredAnimals.map((animal) => (
                      <div key={animal.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <img
                            src={animal.imageUrl || "/placeholder.svg?height=60&width=60"}
                            alt={animal.name}
                            className="w-15 h-15 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-semibold">{animal.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {animal.species} • {animal.breed}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Owner: {animal.owner?.firstName} {animal.owner?.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusBadge(animal.status)}>{animal.status}</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setReviewing(animal)}
                          >
                            Review
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Review drawer */}
            {reviewing && (
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Review: {reviewing.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Optional comment…"
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => onReview(true)}
                      disabled={!!processingId}
                    >
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onReview(false)}
                      disabled={!!processingId}
                    >
                      <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setReviewing(null)}
                      disabled={!!processingId}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ---------------------------------------------
           * Trades
           * -------------------------------------------*/}
          <TabsContent value="trades" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Trade Management</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && !trades.length ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-4">
                    {trades.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <img
                            src={trade.animal?.imageUrl || "/placeholder.svg?height=60&width=60"}
                            alt={trade.animal?.name}
                            className="w-15 h-15 rounded-lg object-cover"
                          />
                          <div>
                            <h3 className="font-semibold">{trade.animal?.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {trade.price} {trade.currency}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Seller: {trade.seller?.firstName} {trade.seller?.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusBadge(trade.status)}>{trade.status}</Badge>
                          {trade.status === "PENDING" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ---------------------------------------------
           * Users (placeholder)
           * -------------------------------------------*/}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">User Management</h3>
                  <p className="text-muted-foreground">Coming soon – awaiting admin endpoints.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}