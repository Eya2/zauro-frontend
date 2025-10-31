"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { useWallet } from "@/hooks/use-wallet"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import type { Animal, Trade } from "@/lib/types"
import {
  ArrowLeft,
  ShoppingCart,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Info,
  User,
  Calendar,
  Heart,
  Star,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function BuyAnimalPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { balance, loading: walletLoading } = useWallet()
  const { toast } = useToast()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [activeTrade, setActiveTrade] = useState<Trade | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)
  const [error, setError] = useState("")

  const animalId = params.id as string

  useEffect(() => {
    if (animalId) {
      fetchAnimalAndTrade()
    }
  }, [animalId])

  const fetchAnimalAndTrade = async () => {
    try {
      setLoading(true)
      const [animalData, tradesData] = await Promise.all([
        api.getAnimal(animalId),
        api.getTrades(),
      ])

      setAnimal(animalData)

      const trade = tradesData.data?.find(
        (t) => t.animalId === animalId && t.status === "LISTED"
      )
      setActiveTrade(trade ?? null)

      if (!trade) {
        setError("This animal is not currently available for purchase.")
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load animal details")
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!activeTrade || !user) return

    setPurchasing(true)
    try {
      await api.buyAnimal(activeTrade.id)
      toast({
        title: "Purchase initiated",
        description: "Your purchase has been initiated successfully. You'll be redirected to the trade details.",
      })
      router.push(`/trades/${activeTrade.id}`)
    } catch (err: any) {
      toast({
        title: "Purchase failed",
        description: err.response?.data?.message || "Failed to initiate purchase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setPurchasing(false)
    }
  }

  const canAfford = () => {
    if (!balance || !activeTrade) return false

    const price = Number.parseFloat(activeTrade.price)
    if (activeTrade.currency === "HBAR") {
      return Number.parseFloat(balance.hbar) >= price
    } else {
      return Number.parseFloat(balance.zauToken) >= price
    }
  }

  const isOwnAnimal = user && animal && animal.ownerId === user.id

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

  if (error || !animal) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16]">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Alert className="bg-red-500/20 text-red-100 border-red-400/30">
              <AlertTriangle className="h-4 w-4 text-red-100" />
              <AlertDescription>{error || "Animal not found"}</AlertDescription>
            </Alert>
            <Button
              asChild
              className="mt-6 bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl px-6"
            >
              <Link href="/animals">
                <ArrowLeft className="h-4 w-4 mr-2 text-white/50" />
                Back to Animals
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
              className="text-white/60 hover:text-white hover:bg-white/10"
              asChild
            >
              <Link href={`/animals/${animalId}`}>
                <ArrowLeft className="h-4 w-4 mr-2 text-white/50" />
                Back to Animal Details
              </Link>
            </Button>
            {activeTrade && (
              <Badge className="bg-green-500/90 text-white">Available for Purchase</Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Animal Information */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Heart className="h-5 w-5 text-[#939896]" />
                    <span>Animal Details</span>
                  </CardTitle>
                  <CardDescription className="text-white/70">Complete information about your potential new companion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                    <div className="relative w-full md:w-48 h-48 rounded-xl overflow-hidden group">
                      <Image
                        src={animal.imageUrl || "/placeholder.svg?height=200&width=200&query=cute animal"}
                        alt={animal.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {animal.tokenId && (
                        <Badge className="absolute top-2 right-2 bg-[#093102] text-white">NFT</Badge>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{animal.name}</h3>
                        <div className="flex items-center space-x-4 text-white/70 mt-2">
                          <span className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-[#939896]" />
                            <span>{animal.species}</span>
                          </span>
                          {animal.breed && (
                            <span className="flex items-center space-x-1">
                              <span>•</span>
                              <span>{animal.breed}</span>
                            </span>
                          )}
                          {animal.age && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-[#939896]" />
                              <span>{animal.age} years old</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {animal.description && (
                        <div>
                          <h4 className="font-medium text-white mb-2">Description</h4>
                          <p className="text-white/70">{animal.description}</p>
                        </div>
                      )}

                      {animal.aiPredictionValue && (
                        <div className="p-3 bg-white/15 rounded-xl border border-white/20">
                          <div className="flex items-center space-x-2 mb-1">
                            <Info className="h-4 w-4 text-[#939896]" />
                            <span className="text-sm font-medium text-white">AI Market Value</span>
                          </div>
                          <p className="text-lg font-bold text-white">
                            {animal.aiPredictionValue} HBAR
                          </p>
                          <p className="text-xs text-white/70">
                            Based on market analysis and animal characteristics
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Owner Information */}
              {animal.owner && (
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <User className="h-5 w-5 text-[#939896]" />
                      <span>Current Owner</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-[#093102] rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {animal.owner.firstName[0]}
                          {animal.owner.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {animal.owner.firstName} {animal.owner.lastName}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Purchase Warnings */}
              {!activeTrade && (
                <Alert className="bg-white/15 text-white border-white/20">
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <AlertDescription>
                    This animal is not currently listed for sale. Please check back later or contact the owner.
                  </AlertDescription>
                </Alert>
              )}

              {isOwnAnimal && (
                <Alert className="bg-white/15 text-white border-white/20">
                  <Info className="h-4 w-4 text-[#939896]" />
                  <AlertDescription>
                    You already own this animal. You cannot purchase your own animals.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Purchase Card */}
              {activeTrade && !isOwnAnimal && (
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      <ShoppingCart className="h-5 w-5 text-[#939896]" />
                      <span>Purchase Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-white">
                        {activeTrade.price} {activeTrade.currency}
                      </p>
                      <p className="text-sm text-white/70">Purchase Price</p>
                    </div>

                    <Separator className="bg-white/20" />

                    {/* Wallet Balance */}
                    {!walletLoading && balance && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-white">Your Balance</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-white/15 rounded-xl border border-white/20">
                            <p className="font-medium text-white">{Number.parseFloat(balance.hbar).toFixed(2)} HBAR</p>
                          </div>
                          <div className="p-2 bg-white/15 rounded-xl border border-white/20">
                            <p className="font-medium text-white">{Number.parseFloat(balance.zauToken).toFixed(2)} ZAU</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Purchase Button */}
                    <div className="space-y-3">
                      {!canAfford() && (
                        <Alert className="bg-red-500/20 text-red-100 border-red-400/30">
                          <AlertTriangle className="h-4 w-4 text-red-100" />
                          <AlertDescription>
                            Insufficient balance. You need {activeTrade.price} {activeTrade.currency} to purchase this animal.
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        onClick={handlePurchase}
                        disabled={purchasing || !canAfford() || walletLoading}
                        className="w-full bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl"
                        size="lg"
                      >
                        {purchasing ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2 text-white" />
                            Processing Purchase...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2 text-white/50" />
                            Buy Now for {activeTrade.price} {activeTrade.currency}
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-white/70 text-center">
                        By purchasing, you agree to our terms of service and the blockchain transaction will be processed.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transaction Info */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Wallet className="h-5 w-5 text-[#939896]" />
                    <span>Transaction Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/70">Network</span>
                    <span className="text-white">Hedera Testnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Transaction Type</span>
                    <span className="text-white">Atomic Swap</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">NFT Transfer</span>
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-white">Included</span>
                    </span>
                  </div>
                  <Separator className="bg-white/20" />
                  <div className="flex justify-between font-medium">
                    <span className="text-white/70">Estimated Gas Fee</span>
                    <span className="text-white">~0.001 HBAR</span>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Notice */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-400">
                    <AlertTriangle className="h-5 w-5 text-orange-400" />
                    <span>Important Notice</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="text-white/70">• All transactions are final and cannot be reversed</p>
                  <p className="text-white/70">• Ensure you have sufficient balance for the purchase</p>
                  <p className="text-white/70">• The NFT will be transferred to your wallet upon completion</p>
                  <p className="text-white/70">• Contact support if you encounter any issues</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}