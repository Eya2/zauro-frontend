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
import Image from "next/image"

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAnimals: 0,
    totalTrades: 0,
    totalRevenue: 0,
  })
  const [users, setUsers] = useState<User[]>([])
  const [animals, setAnimals] = useState<Animal[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState("")
  const [reviewing, setReviewing] = useState<Animal | null>(null)
  const [reviewComment, setReviewComment] = useState("")

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

      setAnimals(pendingRes.data ?? [])
      setTrades(tradesRes.data ?? [])

      const completedRevenue = (tradesRes.data ?? [])
        .filter((t) => t.status === "COMPLETED")
        .reduce((sum, t) => sum + Number(t.price), 0)

      setStats({
        totalUsers: 0,
        totalAnimals: pendingRes.pagination?.total || 0,
        totalTrades: tradesRes.pagination?.total || 0,
        totalRevenue: completedRevenue,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

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

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      PENDING_EXPERT_REVIEW: "bg-yellow-500",
      APPROVED: "bg-green-500",
      REJECTED: "bg-red-500",
      EXPIRED: "bg-gray-500",
      PENDING: "bg-yellow-500",
      COMPLETED: "bg-green-500",
      CANCELLED: "bg-red-500",
      FAILED: "bg-red-500",
    }
    return `${map[status] || "bg-gray-500"} text-white`
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16] p-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center gap-4 mb-10 text-center justify-center animate-fade-in">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/30">
              <Shield className="h-9 w-9 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-md tracking-wide">Admin Dashboard</h1>
              <p className="text-white/70 text-sm mt-1">Manage animals, trades, and platform health</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { label: "Total Users", value: stats.totalUsers.toLocaleString(), icon: Users, note: "Coming soon" },
              { label: "Pending Animals", value: stats.totalAnimals, icon: PawPrint, note: "Awaiting review" },
              { label: "Total Trades", value: stats.totalTrades, icon: TrendingUp, note: "All time" },
              { label: "Revenue (HBAR)", value: stats.totalRevenue.toFixed(2), icon: DollarSign, note: "Completed trades" },
            ].map((stat, i) => (
              <Card key={i} className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl hover:shadow-[#0288D1]/30 transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-sm font-medium text-white/80">{stat.label}</CardTitle>
                  <stat.icon className="h-5 w-5 text-white/60" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                  <p className="text-xs text-white/60 mt-1">{stat.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="animals" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/15 border border-white/20 backdrop-blur-md rounded-xl mb-8">
              <TabsTrigger value="animals" className="data-[state=active]:bg-[#093102] data-[state=active]:text-white text-white/80 rounded-xl">
                Review Animals
              </TabsTrigger>
              <TabsTrigger value="trades" className="data-[state=active]:bg-[#093102] data-[state=active]:text-white text-white/80 rounded-xl">
                Trades
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-[#093102] data-[state=active]:text-white text-white/80 rounded-xl">
                Users
              </TabsTrigger>
            </TabsList>

            {/* Animals Tab */}
            <TabsContent value="animals" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-xl">Pending Review</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                      <Input
                        placeholder="Search animals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50 w-72"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading && !animals.length ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner size="lg" className="text-white" />
                    </div>
                  ) : filteredAnimals.length === 0 ? (
                    <p className="text-center text-white/70 py-8">No animals pending review.</p>
                  ) : (
                    <div className="space-y-4">
                      {filteredAnimals.map((animal) => (
                        <div
                          key={animal.id}
                          className="flex items-center justify-between p-5 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center overflow-hidden">
                              <Image
                                src={animal.imageUrl || "/placeholder.svg?height=60&width=60"}
                                alt={animal.name}
                                width={60}
                                height={60}
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg">{animal.name}</h3>
                              <p className="text-sm text-white/70">
                                {animal.species} {animal.breed && `• ${animal.breed}`}
                              </p>
                              <p className="text-xs text-white/60">
                                Owner: {animal.owner?.firstName} {animal.owner?.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`${statusBadge(animal.status)} px-3 py-1`}>
                              {animal.status.replace(/_/g, " ")}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setReviewing(animal)}
                              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
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

              {/* Review Drawer */}
              {reviewing && (
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Review: {reviewing.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <Textarea
                      placeholder="Optional comment for the owner..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="bg-white/15 text-white border-white/20 placeholder:text-white/50 min-h-24"
                    />
                    <div className="flex gap-3">
                      <Button
                        onClick={() => onReview(true)}
                        disabled={!!processingId}
                        className="flex-1 bg-[#093102] text-white hover:bg-[#0A3D04] rounded-xl"
                      >
                        {processingId === reviewing.id ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => onReview(false)}
                        disabled={!!processingId}
                        variant="destructive"
                        className="flex-1 bg-red-600 text-white hover:bg-red-700 rounded-xl"
                      >
                        {processingId === reviewing.id ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          setReviewing(null)
                          setReviewComment("")
                        }}
                        disabled={!!processingId}
                        variant="ghost"
                        className="flex-1 text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Trades Tab */}
            <TabsContent value="trades" className="space-y-6">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Trade Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading && !trades.length ? (
                    <div className="flex justify-center py-12">
                      <LoadingSpinner size="lg" className="text-white" />
                    </div>
                  ) : trades.length === 0 ? (
                    <p className="text-center text-white/70 py-8">No trades found.</p>
                  ) : (
                    <div className="space-y-4">
                      {trades.map((trade) => (
                        <div
                          key={trade.id}
                          className="flex items-center justify-between p-5 bg-white/5 border border-white/20 rounded-xl hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center overflow-hidden">
                              <Image
                                src={trade.animal?.imageUrl || "/placeholder.svg?height=60&width=60"}
                                alt={trade.animal?.name ?? "Animal image"}
                                width={60}
                                height={60}
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <h3 className="font-bold text-white text-lg">{trade.animal?.name}</h3>
                              <p className="text-sm text-white/70">
                                {trade.price} {trade.currency}
                              </p>
                              <p className="text-xs text-white/60">
                                Seller: {trade.seller?.firstName} {trade.seller?.lastName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`${statusBadge(trade.status)} px-3 py-1`}>
                              {trade.status.replace(/_/g, " ")}
                            </Badge>
                            {trade.status === "PENDING" && (
                              <AlertTriangle className="h-5 w-5 text-yellow-400" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab (Placeholder) */}
            <TabsContent value="users">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30">
                      <Users className="h-12 w-12 text-white/70" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Coming Soon</h3>
                    <p className="text-white/70 max-w-md mx-auto">
                      User management features are under development. Admin endpoints will be added soon.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  )
}