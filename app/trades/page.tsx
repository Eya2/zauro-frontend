"use client"

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Trade, TradeStatus, TradeFilters } from "@/lib/types"
import {
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Coins,
} from "lucide-react"
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

  // Fetch trades whenever page, filters, search, or view changes
  useEffect(() => {
    fetchTrades()
  }, [currentPage, filters, searchTerm, viewMode])

  
  const fetchTrades = async () => {
    try {
      setLoading(true);
  
      /* 1.  Only these three keys are legal on the query string */
      const base: any = {
        page: currentPage,
        limit: 12,
        ...(filters.status?.length && { status: filters.status.join(',') }),
      };
  
      /* 2.  Grab one page (or many pages until we have enough) */
      const res = await api.getTrades(base);
      let rows = res.data ?? [];
  
      /* 3.  CLIENT-SIDE filtering ----------------------------------*/
      if (user?.id) {
        if (viewMode === 'buying') rows = rows.filter((t) => t.buyerId === user.id);
        if (viewMode === 'selling') rows = rows.filter((t) => t.sellerId === user.id);
        if (viewMode === 'my-trades')
          rows = rows.filter((t) => t.buyerId === user.id || t.sellerId === user.id);
      }
  
      if (searchTerm)
        rows = rows.filter((t) =>
          t.animal?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
  
      if (filters.currency?.length)
        rows = rows.filter((t) => filters.currency!.includes(t.currency));
  
      if (filters.minPrice != null)
        rows = rows.filter((t) => Number(t.price) >= Number(filters.minPrice));
      if (filters.maxPrice != null)
        rows = rows.filter((t) => Number(t.price) <= Number(filters.maxPrice));
  
      /* 4.  Sort newest first */
      rows.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  
      /* 5.  Manual pagination (we only got one server page) --------*/
      const start = (currentPage - 1) * 12;
      const paginated = rows.slice(start, start + 12);
  
      setTrades(paginated);
      setTotalPages(Math.ceil(rows.length / 12));
    } catch (err) {
      console.error('Failed to fetch trades:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback((key: keyof TradeFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }))
    setCurrentPage(1)
  }, [])

  const clearFilters = () => {
    setFilters({})
    setSearchTerm("")
    setCurrentPage(1)
  }

  const getStatusIcon = (status: TradeStatus) => {
    switch (status) {
      case "PENDING": return <Clock className="h-4 w-4" />
      case "LISTED": return <TrendingUp className="h-4 w-4" />
      case "IN_PROGRESS": return <AlertCircle className="h-4 w-4" />
      case "COMPLETED": return <CheckCircle className="h-4 w-4" />
      case "CANCELLED":
      case "FAILED":
        return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: TradeStatus) => {
    return statusOptions.find((o) => o.value === status)?.color || "bg-gray-500"
  }

  const TradeCard = ({ trade }: { trade: Trade }) => (
    <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl hover:shadow-[#0288D1]/30 transition-shadow">
      <CardContent className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center overflow-hidden">
              <img
                src={trade.animal?.imageUrl || "/placeholder.svg?height=60&width=60&query=cute animal"}
                alt={trade.animal?.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{trade.animal?.name || "Unknown Animal"}</h3>
              <p className="text-sm text-white/70">
                {trade.animal?.species} {trade.animal?.breed && `• ${trade.animal.breed}`}
              </p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`${getStatusColor(trade.status)} text-white flex items-center gap-1 px-3 py-1`}
          >
            {getStatusIcon(trade.status)}
            <span className="font-medium">{trade.status.replace("_", " ")}</span>
          </Badge>
        </div>

        {/* Price & Date */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-white/80" />
            <span className="text-xl font-bold">
              {trade.price} <span className="text-sm font-normal">{trade.currency}</span>
            </span>
          </div>
          <span className="text-sm text-white/70">
            {new Date(trade.createdAt).toLocaleDateString()}
          </span>
        </div>

        {/* Participants */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-white/60">Seller</p>
            <p className="font-medium text-white">
              {trade.seller ? `${trade.seller.firstName} ${trade.seller.lastName}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-white/60">Buyer</p>
            <p className="font-medium text-white">
              {trade.buyer ? `${trade.buyer.firstName} ${trade.buyer.lastName}` : "Not assigned"}
            </p>
          </div>
        </div>

        {/* Transaction Hash */}
        {trade.transactionHash && (
          <div className="text-xs">
            <p className="text-white/60">Tx Hash</p>
            <p className="font-mono text-white/90 truncate">{trade.transactionHash}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
          >
            <Link href={`/trades/${trade.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View
            </Link>
          </Button>
          {trade.status === "LISTED" && user?.id !== trade.sellerId && (
            <Button asChild size="sm" className="flex-1 bg-[#093102] text-white hover:bg-[#0A3D04]">
              <Link href={`/animals/${trade.animalId}/buy`}>Buy Now</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16] p-4">
        <Navbar />

        <main className="max-w-7xl mx-auto mt-8">
          {/* Page Header */}
          <div className="text-center mb-10 animate-fade-in">
            <h1 className="text-4xl font-bold text-white drop-shadow-md tracking-wide">Trading</h1>
            <p className="text-white/80 mt-3 text-sm max-w-2xl mx-auto">
              Browse and manage animal trades on the blockchain — secure, transparent, and immutable.
            </p>
          </div>

          {/* Filters Card */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl mb-8">
            <CardHeader>
              <CardTitle className="text-white text-xl">Filters & Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Tabs */}
              <Tabs value={viewMode} onValueChange={(v) => { setViewMode(v as any); setCurrentPage(1) }}>
                <TabsList className="grid grid-cols-4 w-full bg-white/15 border border-white/20">
                  <TabsTrigger value="all" className="data-[state=active]:bg-[#093102] data-[state=active]:text-white text-white/80">
                    All Trades
                  </TabsTrigger>
                  <TabsTrigger value="my-trades" className="data-[state=active]:bg-[#093102] data-[state=active]:text-white text-white/80">
                    My Trades
                  </TabsTrigger>
                  <TabsTrigger value="buying" className="data-[state=active]:bg-[#093102] data-[state=active]:text-white text-white/80">
                    Buying
                  </TabsTrigger>
                  <TabsTrigger value="selling" className="data-[state=active]:bg-[#093102] data-[state=active]:text-white text-white/80">
                    Selling
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Search + Filters Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    placeholder="Search trades..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                    className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50"
                  />
                </div>

               {/* Status filter */}
<Select
  value={filters.status?.[0] || "ALL"}
  onValueChange={(v) =>
    handleFilterChange("status", v === "ALL" ? undefined : [v as TradeStatus])
  }
>
  <SelectTrigger className="bg-white/15 text-white border-white/20">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
    <SelectItem value="ALL">All Status</SelectItem>
    {statusOptions.map((s) => (
      <SelectItem key={s.value} value={s.value}>
        {s.label}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

{/* Currency filter */}
<Select
  value={filters.currency?.[0] || "ALL"}
  onValueChange={(v) =>
    handleFilterChange("currency", v === "ALL" ? undefined : [v as "HBAR" | "ZAU"])
  }
>
  <SelectTrigger className="bg-white/15 text-white border-white/20">
    <SelectValue placeholder="Currency" />
  </SelectTrigger>
  <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
    <SelectItem value="ALL">All Currencies</SelectItem>
    <SelectItem value="HBAR">HBAR</SelectItem>
    <SelectItem value="ZAU">ZAU Token</SelectItem>
  </SelectContent>
</Select>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size="lg" className="text-white" />
            </div>
          ) : trades.length > 0 ? (
            <>
              {/* Trades Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {trades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-3 text-white">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="bg-white/10 border-white/30 hover:bg-white/20"
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="bg-white/10 border-white/30 hover:bg-white/20"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30">
                <TrendingUp className="h-14 w-14 text-white/70" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No trades found</h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                {searchTerm || Object.keys(filters).length > 0
                  ? "Try adjusting your search or filters."
                  : "No trades have been created yet."}
              </p>
              <Button asChild className="bg-[#093102] text-white hover:bg-[#0A3D04]">
                <Link href="/animals">Browse Animals to Trade</Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}