"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Trade, TradeStatus, TradeFilters } from "@/lib/types"
import { Search, Filter, Eye, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Coins } from "lucide-react"
import Link from "next/link"

export default function TradesPage() {
  const { user } = useAuth()
  const [trades, setTrades] = useState<Trade[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<TradeFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<"all" | "my-trades" | "buying" | "selling">("all")

  const statusOptions: { value: TradeStatus; label: string; color: string }[] = [
    { value: "PENDING", label: "Pending", color: "bg-yellow-500" },
    { value: "LISTED", label: "Listed", color: "bg-blue-500" },
    { value: "IN_PROGRESS", label: "In Progress", color: "bg-orange-500" },
    { value: "COMPLETED", label: "Completed", color: "bg-green-500" },
    { value: "CANCELLED", label: "Cancelled", color: "bg-gray-500" },
    { value: "FAILED", label: "Failed", color: "bg-red-500" },
  ]

  useEffect(() => {
    fetchTrades()
  }, [currentPage, filters, searchTerm, viewMode])

  const fetchTrades = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit: 12,
        filters: {
          ...filters,
          ...(viewMode === "buying" && { buyerId: user?.id }),
          ...(viewMode === "selling" && { sellerId: user?.id }),
        },
      }

      const response = await api.getTrades(params)
      setTrades(response.data || [])
      setTotalPages(response.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Failed to fetch trades:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof TradeFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm("")
    setCurrentPage(1)
  }

  const getStatusIcon = (status: TradeStatus) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />
      case "LISTED":
        return <TrendingUp className="h-4 w-4" />
      case "IN_PROGRESS":
        return <AlertCircle className="h-4 w-4" />
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />
      case "CANCELLED":
      case "FAILED":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: TradeStatus) => {
    const statusOption = statusOptions.find((option) => option.value === status)
    return statusOption?.color || "bg-gray-500"
  }

  const TradeCard = ({ trade }: { trade: Trade }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={trade.animal?.imageUrl || "/placeholder.svg?height=60&width=60&query=cute animal"}
                alt={trade.animal?.name || "Animal"}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div>
                <h3 className="font-semibold">{trade.animal?.name || "Unknown Animal"}</h3>
                <p className="text-sm text-muted-foreground">
                  {trade.animal?.species} {trade.animal?.breed && `• ${trade.animal.breed}`}
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`${getStatusColor(trade.status)} text-white flex items-center space-x-1`}
            >
              {getStatusIcon(trade.status)}
              <span>{trade.status}</span>
            </Badge>
          </div>

          {/* Price and Currency */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold">
                {trade.price} {trade.currency}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">{new Date(trade.createdAt).toLocaleDateString()}</div>
          </div>

          {/* Participants */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Seller</p>
              <p className="font-medium">
                {trade.seller ? `${trade.seller.firstName} ${trade.seller.lastName}` : "Unknown"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Buyer</p>
              <p className="font-medium">
                {trade.buyer ? `${trade.buyer.firstName} ${trade.buyer.lastName}` : "Not assigned"}
              </p>
            </div>
          </div>

          {/* Transaction Hash */}
          {trade.transactionHash && (
            <div className="text-sm">
              <p className="text-muted-foreground">Transaction Hash</p>
              <p className="font-mono text-xs truncate">{trade.transactionHash}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-2 pt-2">
            <Button asChild size="sm" variant="outline" className="flex-1 bg-transparent">
              <Link href={`/trades/${trade.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
            {trade.status === "LISTED" && user?.id !== trade.sellerId && (
              <Button asChild size="sm" className="flex-1">
                <Link href={`/animals/${trade.id}/buy`}>Buy Now</Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Trading</h1>
            <p className="text-muted-foreground mt-2">Browse and manage animal trades on the blockchain</p>
          </div>

          {/* Filters and Search */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* View Mode Tabs */}
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                  <TabsList>
                    <TabsTrigger value="all">All Trades</TabsTrigger>
                    <TabsTrigger value="my-trades">My Trades</TabsTrigger>
                    <TabsTrigger value="buying">Buying</TabsTrigger>
                    <TabsTrigger value="selling">Selling</TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Search and Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search trades..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select
                    value={filters.status?.[0] || ""}
                    onValueChange={(value) => handleFilterChange("status", value ? [value as TradeStatus] : undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.currency?.[0] || ""}
                    onValueChange={(value) =>
                      handleFilterChange("currency", value ? [value as "HBAR" | "ZAU"] : undefined)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Currencies</SelectItem>
                      <SelectItem value="HBAR">HBAR</SelectItem>
                      <SelectItem value="ZAU">ZAU Token</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={clearFilters} className="bg-transparent">
                      <Filter className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trades Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : trades.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {trades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No trades found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || Object.keys(filters).length > 0
                  ? "Try adjusting your search or filters"
                  : "No trades have been created yet"}
              </p>
              <Button asChild>
                <Link href="/animals">Browse Animals to Trade</Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
