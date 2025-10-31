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
    if (tradeId) fetchTrade()
  }, [tradeId])

  const fetchTrade = async () => {
    try {
      setLoading(true)
      const tradeData = await api.getTrade(tradeId)
      setTrade(tradeData)
    } catch (err: any) {
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
      toast({ title: "Purchase initiated", description: "The trade is now in progress." })
      await fetchTrade()
    } catch (err: any) {
      toast({ title: "Purchase failed", description: err.response?.data?.message || "Failed to initiate purchase.", variant: "destructive" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleExecuteTrade = async () => {
    if (!trade) return
    setActionLoading(true)
    try {
      await api.executeTrade(trade.id)
      toast({ title: "Trade executed", description: "The atomic swap has been executed successfully." })
      await fetchTrade()
    } catch (err: any) {
      toast({ title: "Execution failed", description: err.response?.data?.message || "Failed to execute trade.", variant: "destructive" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelTrade = async () => {
    if (!trade || !window.confirm("Are you sure you want to cancel this trade?")) return
    setActionLoading(true)
    try {
      await api.cancelTrade(trade.id)
      toast({ title: "Trade cancelled", description: "The trade has been cancelled successfully." })
      await fetchTrade()
    } catch (err: any) {
      toast({ title: "Cancellation failed", description: err.response?.data?.message || "Failed to cancel trade.", variant: "destructive" })
    } finally {
      setActionLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!", description: `${label} copied to clipboard.` })
  }

  const getStatusIcon = (status: string) => {
    const icons: Record<string, JSX.Element> = {
      PENDING: <Clock className="h-5 w-5" />,
      LISTED: <TrendingUp className="h-5 w-5" />,
      IN_PROGRESS: <AlertCircle className="h-5 w-5" />,
      COMPLETED: <CheckCircle className="h-5 w-5" />,
      CANCELLED: <XCircle className="h-5 w-5" />,
      FAILED: <XCircle className="h-5 w-5" />,
    }
    return icons[status] || <Clock className="h-5 w-5" />
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-500",
      LISTED: "bg-blue-500",
      IN_PROGRESS: "bg-orange-500",
      COMPLETED: "bg-green-500",
      CANCELLED: "bg-gray-500",
      FAILED: "bg-red-500",
    }
    return colors[status] || "bg-gray-500"
  }

  const isSeller = user && trade && user.id === trade.sellerId
  const isBuyer = user && trade && user.id === trade.buyerId
  const canBuy = user && trade && trade.status === "LISTED" && user.id !== trade.sellerId
  const canExecute = trade && trade.status === "IN_PROGRESS" && (isSeller || isBuyer)
  const canCancel = trade && (trade.status === "LISTED" || trade.status === "PENDING") && isSeller

  // Loading State
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16] p-4">
          <Navbar />
          <div className="flex justify-center items-center py-32">
            <LoadingSpinner size="lg" className="text-white" />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Error State
  if (error || !trade) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16] p-4">
          <Navbar />
          <main className="max-w-4xl mx-auto py-12">
            <Alert className="bg-red-500/20 text-red-100 border-red-400/30 mb-6">
              <AlertDescription>{error || "Trade not found"}</AlertDescription>
            </Alert>
            <Button asChild className="bg-[#093102] text-white hover:bg-[#0A3D04] rounded-xl">
              <Link href="/trades">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trades
              </Link>
            </Button>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16] p-4">
        <Navbar />

        <main className="max-w-6xl mx-auto py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <Button
              variant="ghost"
              asChild
              className="text-white/80 hover:bg-white/10 hover:text-white rounded-xl"
            >
              <Link href="/trades">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Trades
              </Link>
            </Button>
            <Badge
              className={`${getStatusColor(trade.status)} text-white flex items-center gap-2 px-4 py-1.5 rounded-xl font-medium`}
            >
              {getStatusIcon(trade.status)}
              <span>{trade.status.replace("_", " ")}</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Animal Card */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Animal Details</CardTitle>
                  <CardDescription className="text-white/70">Information about the animal being traded</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-5">
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden group">
                      <Image
                        src={trade.animal?.imageUrl || "/placeholder.svg?height=120&width=120&query=cute animal"}
                        alt={trade.animal?.name || "Animal"}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 space-y-3">
                      <h3 className="text-2xl font-bold text-white">{trade.animal?.name}</h3>
                      <p className="text-white/70">
                        {trade.animal?.species} {trade.animal?.breed && `• ${trade.animal.breed}`}
                        {trade.animal?.age && ` • ${trade.animal.age} years old`}
                      </p>
                      {trade.animal?.description && (
                        <p className="text-white/70 text-sm leading-relaxed">{trade.animal.description}</p>
                      )}
                      {trade.animal?.tokenId && (
                        <Badge className="bg-[#093102] text-white text-xs">
                          NFT #{trade.animal.tokenId}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Timeline */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Trade Timeline</CardTitle>
                  <CardDescription className="text-white/70">Track the progress of this trade</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-5">
                    {[
                      { label: "Trade Created", date: trade.createdAt, icon: CheckCircle, color: "bg-green-500" },
                      trade.status !== "PENDING" && { label: "Listed for Trade", desc: "Animal available for purchase", icon: TrendingUp, color: "bg-blue-500" },
                      trade.status === "IN_PROGRESS" && { label: "Purchase Initiated", desc: "Buyer committed to purchase", icon: AlertCircle, color: "bg-orange-500" },
                      trade.status === "COMPLETED" && { label: "Trade Completed", date: trade.completedAt || trade.updatedAt, icon: CheckCircle, color: "bg-green-500" },
                      (trade.status === "CANCELLED" || trade.status === "FAILED") && { label: `Trade ${trade.status}`, date: trade.updatedAt, icon: XCircle, color: "bg-red-500" },
                    ].filter(Boolean).map((step: any, i) => (
                      <div key={i} className="flex gap-4">
                        <div className={`w-10 h-10 ${step.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <step.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{step.label}</p>
                          {step.desc && <p className="text-sm text-white/70">{step.desc}</p>}
                          {step.date && <p className="text-xs text-white/60">{new Date(step.date).toLocaleString()}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain Info */}
              {trade.transactionHash && (
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-white text-xl">Blockchain Transaction</CardTitle>
                    <CardDescription className="text-white/70">On-chain transaction details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-white/10 border border-white/20 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white/70">Transaction Hash</p>
                        <p className="font-mono text-sm text-white/90 truncate max-w-xs">{trade.transactionHash}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(trade.transactionHash!, "Tx Hash")}
                          className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="text-white/60 hover:text-white hover:bg-white/10 rounded-xl"
                        >
                          <a
                            href={`https://hashscan.io/testnet/transaction/${trade.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">

              {/* Price */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Coins className="h-5 w-5 text-[#939896]" />
                    Price
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-6">
                  <p className="text-4xl font-bold text-white">{trade.price}</p>
                  <p className="text-lg text-white/80">{trade.currency}</p>
                </CardContent>
              </Card>

              {/* Participants */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Participants</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <p className="text-white/60 text-sm mb-2">Seller</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#093102] rounded-full flex items-center justify-center text-white font-bold">
                        {trade.seller?.firstName?.[0] || "S"}
                      </div>
                      <p className="font-medium text-white">
                        {trade.seller ? `${trade.seller.firstName} ${trade.seller.lastName}` : "—"}
                      </p>
                    </div>
                  </div>
                  <Separator className="bg-white/20" />
                  <div>
                    <p className="text-white/60 text-sm mb-2">Buyer</p>
                    {trade.buyer ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#093102] rounded-full flex items-center justify-center text-white font-bold">
                          {trade.buyer.firstName?.[0] || "B"}
                        </div>
                        <p className="font-medium text-white">
                          {`${trade.buyer.firstName} ${trade.buyer.lastName}`}
                        </p>
                      </div>
                    ) : (
                      <p className="text-white/70 italic">No buyer assigned</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {canBuy && (
                    <Button
                      onClick={handleBuyAnimal}
                      disabled={actionLoading}
                      className="w-full bg-[#093102] text-white hover:bg-[#0A3D04] rounded-xl"
                    >
                      {actionLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Buy Now
                        </>
                      )}
                    </Button>
                  )}

                  {canExecute && (
                    <Button
                      onClick={handleExecuteTrade}
                      disabled={actionLoading}
                      className="w-full bg-[#093102] text-white hover:bg-[#0A3D04] rounded-xl"
                    >
                      {actionLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Execute Trade
                        </>
                      )}
                    </Button>
                  )}

                  {canCancel && (
                    <Button
                      onClick={handleCancelTrade}
                      disabled={actionLoading}
                      className="w-full bg-red-600 text-white hover:bg-red-700 rounded-xl"
                    >
                      {actionLoading ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <Ban className="h-4 w-4 mr-2" />
                          Cancel Trade
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent rounded-xl"
                  >
                    <Link href={`/animals/${trade.animalId}`}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      View Animal
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Trade Info */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white">Trade Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Trade ID</span>
                    <span className="font-mono text-white/90">{trade.id.slice(0, 10)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Created</span>
                    <span className="text-white/90">{new Date(trade.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Last Updated</span>
                    <span className="text-white/90">{new Date(trade.updatedAt).toLocaleDateString()}</span>
                  </div>
                  {trade.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Completed</span>
                      <span className="text-white/90">{new Date(trade.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                  <Separator className="bg-white/20" />
                  <div className="flex justify-between">
                    <span className="text-white/60">Animal ID</span>
                    <span className="font-mono text-white/90">{trade.animalId.slice(0, 10)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Currency</span>
                    <span className="text-white/90 uppercase font-medium">{trade.currency}</span>
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