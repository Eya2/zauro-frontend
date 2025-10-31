"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import type { Trade } from "@/lib/types"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Coins,
  User,
  ExternalLink,
  Copy,
  ShoppingCart,
  Ban,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"

export default function TradeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [trade, setTrade] = useState<Trade | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState("")

  const tradeId = params.id as string

  useEffect(() => {
    if (tradeId) {
      fetchTrade()
    }
  }, [tradeId])

  const fetchTrade = async () => {
    try {
      setLoading(true)
      const tradeData = await api.getTrade(tradeId)
      setTrade(tradeData)
    } catch (err: any) {
      console.error('>>> getTrade error', err)
      setError(err.response?.data?.message || err.message || "Failed to load trade details")
    } finally {
      setLoading(false)
    }
  }

  const handleBuyAnimal = async () => {
    if (!trade) return

    setActionLoading(true)
    try {
      await api.buyAnimal(trade.id)
      toast({
        title: "Purchase initiated",
        description: "Your purchase has been initiated. The trade is now in progress.",
      })
      await fetchTrade() // Refresh trade data
    } catch (err: any) {
      toast({
        title: "Purchase failed",
        description: err.response?.data?.message || "Failed to initiate purchase.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleExecuteTrade = async () => {
    if (!trade) return

    setActionLoading(true)
    try {
      await api.executeTrade(trade.id)
      toast({
        title: "Trade executed",
        description: "The atomic swap has been executed successfully.",
      })
      await fetchTrade() // Refresh trade data
    } catch (err: any) {
      toast({
        title: "Execution failed",
        description: err.response?.data?.message || "Failed to execute trade.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelTrade = async () => {
    if (!trade || !window.confirm("Are you sure you want to cancel this trade?")) return

    setActionLoading(true)
    try {
      await api.cancelTrade(trade.id)
      toast({
        title: "Trade cancelled",
        description: "The trade has been cancelled successfully.",
      })
      await fetchTrade() // Refresh trade data
    } catch (err: any) {
      toast({
        title: "Cancellation failed",
        description: err.response?.data?.message || "Failed to cancel trade.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-white/50" />
      case "LISTED":
        return <TrendingUp className="h-5 w-5 text-white/50" />
      case "IN_PROGRESS":
        return <AlertCircle className="h-5 w-5 text-white/50" />
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-white/50" />
      case "CANCELLED":
      case "FAILED":
        return <XCircle className="h-5 w-5 text-white/50" />
      default:
        return <Clock className="h-5 w-5 text-white/50" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-500/90"
      case "LISTED":
        return "bg-blue-500/90"
      case "IN_PROGRESS":
        return "bg-orange-500/90"
      case "COMPLETED":
        return "bg-green-500/90"
      case "CANCELLED":
        return "bg-gray-500/90"
      case "FAILED":
        return "bg-red-500/90"
      default:
        return "bg-gray-500/90"
    }
  }

  const isSeller = user && trade && user.id === trade.sellerId
  const isBuyer = user && trade && user.id === trade.buyerId
  const canBuy = user && trade && trade.status === "LISTED" && user.id !== trade.sellerId
  const canExecute = trade && trade.status === "IN_PROGRESS" && (isSeller || isBuyer)
  const canCancel = trade && (trade.status === "LISTED" || trade.status === "PENDING") && isSeller

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16]">
          <Navbar />
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" className="text-white" />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !trade) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16]">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Alert className="bg-red-500/20 text-red-100 border-red-400/30">
              <AlertDescription>{error || "Trade not found"}</AlertDescription>
            </Alert>
            <Button
              asChild
              className="mt-4 bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl"
            >
              <Link href="/trades">
                <ArrowLeft className="h-4 w-4 mr-2 text-white/50" />
                Back to Trades
              </Link>
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16]">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <Button
              variant="ghost"
              asChild
              className="text-white/80 hover:bg-white/10 hover:text-white rounded-xl"
            >
              <Link href="/trades">
                <ArrowLeft className="h-4 w-4 mr-2 text-white/50" />
                Back to Trades
              </Link>
            </Button>
            <Badge
              variant="secondary"
              className={`${getStatusColor(trade.status)} text-white flex items-center space-x-2 px-3 py-1 rounded-xl`}
            >
              {getStatusIcon(trade.status)}
              <span>{trade.status}</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Animal Information */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardHeader>
                  <CardTitle className="text-white">Animal Details</CardTitle>
                  <CardDescription className="text-white/70">Information about the animal being traded</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start space-x-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden group">
                      <Image
                        src={trade.animal?.imageUrl || "/placeholder.svg?height=120&width=120&query=cute animal"}
                        alt={trade.animal?.name || "Animal"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-semibold text-white">{trade.animal?.name || "Unknown Animal"}</h3>
                      <div className="flex items-center space-x-4 text-sm text-white/70">
                        <span>{trade.animal?.species}</span>
                        {trade.animal?.breed && <span>• {trade.animal.breed}</span>}
                        {trade.animal?.age && <span>• {trade.animal.age} years old</span>}
                      </div>
                      {trade.animal?.description && <p className="text-white/70">{trade.animal.description}</p>}
                      <div className="flex items-center space-x-2">
                        {trade.animal?.tokenId && (
                          <Badge className="bg-[#093102] text-white">
                            NFT: {trade.animal.tokenId}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trade Timeline */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardHeader>
                  <CardTitle className="text-white">Trade Timeline</CardTitle>
                  <CardDescription className="text-white/70">Track the progress of this trade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500/90 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">Trade Created</p>
                        <p className="text-sm text-white/70">{new Date(trade.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    {trade.status !== "PENDING" && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500/90 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Listed for Trade</p>
                          <p className="text-sm text-white/70">Animal available for purchase</p>
                        </div>
                      </div>
                    )}

                    {trade.status === "IN_PROGRESS" && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-500/90 rounded-full flex items-center justify-center">
                          <AlertCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Purchase Initiated</p>
                          <p className="text-sm text-white/70">Buyer committed to purchase</p>
                        </div>
                      </div>
                    )}

                    {trade.status === "COMPLETED" && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500/90 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Trade Completed</p>
                          <p className="text-sm text-white/70">
                            {trade.completedAt ? new Date(trade.completedAt).toLocaleString() : "Recently completed"}
                          </p>
                        </div>
                      </div>
                    )}

                    {(trade.status === "CANCELLED" || trade.status === "FAILED") && (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-red-500/90 rounded-full flex items-center justify-center">
                          <XCircle className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Trade {trade.status}</p>
                          <p className="text-sm text-white/70">{new Date(trade.updatedAt).toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain Information */}
              {trade.transactionHash && (
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                  <CardHeader>
                    <CardTitle className="text-white">Blockchain Transaction</CardTitle>
                    <CardDescription className="text-white/70">On-chain transaction details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border border-white/20 rounded-xl bg-white/15">
                        <div>
                          <p className="font-medium text-white">Transaction Hash</p>
                          <p className="text-sm text-white/80 font-mono truncate">{trade.transactionHash}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(trade.transactionHash!, "Transaction Hash")}
                            className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                          >
                            <Copy className="h-4 w-4 text-white/50" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                          >
                            <a
                              href={`https://hashscan.io/testnet/transaction/${trade.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4 text-white/50" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Price Information */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Coins className="h-5 w-5 text-[#939896]" />
                    <span>Price</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">
                      {trade.price} {trade.currency}
                    </p>
                    <p className="text-sm text-white/70 mt-1">Trading Price</p>
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardHeader>
                  <CardTitle className="text-white">Participants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-[#939896]" />
                      <span className="text-sm font-medium text-white">Seller</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-[#093102] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {trade.seller?.firstName?.[0] || "S"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {trade.seller ? `${trade.seller.firstName} ${trade.seller.lastName}` : "Unknown"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-white/20" />

                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-[#939896]" />
                      <span className="text-sm font-medium text-white">Buyer</span>
                    </div>
                    {trade.buyer ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-[#093102] rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font medium">
                            {trade.buyer.firstName?.[0] || "B"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-white">{`${trade.buyer.firstName} ${trade.buyer.lastName}`}</p>
                          <p className="text-xs text-white/70">
                            {trade.buyer.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-white/70">No buyer assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardHeader>
                  <CardTitle className="text-white">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {canBuy && (
                    <Button
                      onClick={handleBuyAnimal}
                      disabled={actionLoading}
                      className="w-full bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl"
                    >
                      {actionLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2 text-white" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2 text-white/50" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  )}

                  {canExecute && (
                    <Button
                      onClick={handleExecuteTrade}
                      disabled={actionLoading}
                      className="w-full bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl"
                    >
                      {actionLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2 text-white" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-white/50" />
                          Execute Trade
                        </>
                      )}
                    </Button>
                  )}

                  {canCancel && (
                    <Button
                      onClick={handleCancelTrade}
                      disabled={actionLoading}
                      className="w-full bg-red-500/90 text-white hover:bg-red-500/80 rounded-xl"
                    >
                      {actionLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2 text-white" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <Ban className="h-4 w-4 mr-2 text-white/50" />
                          Cancel Trade
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                  >
                    <Link href={`/animals/${trade.animalId}`}>
                      <ArrowLeft className="h-4 w-4 mr-2 text-white/50" />
                      View Animal
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Trade Information */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardHeader>
                  <CardTitle className="text-white">Trade Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Trade ID</span>
                    <span className="font-mono text-white/80">{trade.id.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Created</span>
                    <span className="text-white/80">{new Date(trade.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Last Updated</span>
                    <span className="text-white/80">{new Date(trade.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {trade.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-white/70">Completed</span>
                      <span className="text-white/80">{new Date(trade.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <Separator className="bg-white/20" />
                  <div className="flex justify-between">
                    <span className="text-white/70">Animal ID</span>
                    <span className="font-mono text-white/80">{trade.animalId.slice(0, 8)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Currency</span>
                    <span className="text-white/80 uppercase">{trade.currency}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}