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
  MapPin,
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
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !animal) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error || "Animal not found"}</AlertDescription>
            </Alert>
            <Button asChild className="mt-4">
              <Link href="/animals">
                <ArrowLeft className="h-4 w-4 mr-2" />
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
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" asChild>
              <Link href={`/animals/${animalId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Animal Details
              </Link>
            </Button>
            {activeTrade && (
              <Badge variant="secondary" className="bg-green-500 text-white">
                Available for Purchase
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Animal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Heart className="h-5 w-5 text-primary" />
                    <span>Animal Details</span>
                  </CardTitle>
                  <CardDescription>Complete information about your potential new companion</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                    <div className="relative w-full md:w-48 h-48 rounded-lg overflow-hidden">
                      <Image
                        src={animal.imageUrl || "/placeholder.svg?height=200&width=200&query=cute animal"}
                        alt={animal.name}
                        fill
                        className="object-cover"
                      />
                      {animal.tokenId && (
                        <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">NFT</Badge>
                      )}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground">{animal.name}</h3>
                        <div className="flex items-center space-x-4 text-muted-foreground mt-2">
                          <span className="flex items-center space-x-1">
                            <Star className="h-4 w-4" />
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
                              <Calendar className="h-4 w-4" />
                              <span>{animal.age} years old</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {animal.description && (
                        <div>
                          <h4 className="font-medium text-foreground mb-2">Description</h4>
                          <p className="text-muted-foreground">{animal.description}</p>
                        </div>
                      )}

                      {animal.aiPredictionValue && (
                        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                          <div className="flex items-center space-x-2 mb-1">
                            <Info className="h-4 w-4 text-primary" />
                            <span className="text-sm font-medium text-primary">AI Market Value</span>
                          </div>
                          <p className="text-lg font-bold text-primary">
                            {animal.aiPredictionValue} {animal.aiPredictionValue|| "HBAR"}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>Current Owner</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-primary-foreground font-medium">
                          {animal.owner.firstName[0]}
                          {animal.owner.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {animal.owner.firstName} {animal.owner.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Member since {new Date(animal.owner.createdAt).getFullYear()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Purchase Warnings */}
              {!activeTrade && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This animal is not currently listed for sale. Please check back later or contact the owner.
                  </AlertDescription>
                </Alert>
              )}

              {isOwnAnimal && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    You already own this animal. You cannot purchase your own animals.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Purchase Card */}
              {activeTrade && !isOwnAnimal && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <ShoppingCart className="h-5 w-5" />
                      <span>Purchase Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-foreground">
                        {activeTrade.price} {activeTrade.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">Purchase Price</p>
                    </div>

                    <Separator />

                    {/* Wallet Balance */}
                    {!walletLoading && balance && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Your Balance</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="p-2 bg-muted rounded">
                            <p className="font-medium">{Number.parseFloat(balance.hbar).toFixed(2)} HBAR</p>
                          </div>
                          <div className="p-2 bg-muted rounded">
                            <p className="font-medium">{Number.parseFloat(balance.zauToken).toFixed(2)} ZAU</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Purchase Button */}
                    <div className="space-y-3">
                      {!canAfford() && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            Insufficient balance. You need {activeTrade.price} {activeTrade.currency} to purchase this
                            animal.
                          </AlertDescription>
                        </Alert>
                      )}

                      <Button
                        onClick={handlePurchase}
                        disabled={purchasing || !canAfford() || walletLoading}
                        className="w-full"
                        size="lg"
                      >
                        {purchasing ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Processing Purchase...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Buy Now for {activeTrade.price} {activeTrade.currency}
                          </>
                        )}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        By purchasing, you agree to our terms of service and the blockchain transaction will be
                        processed.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transaction Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wallet className="h-5 w-5" />
                    <span>Transaction Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Network</span>
                    <span>Hedera Testnet</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction Type</span>
                    <span>Atomic Swap</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">NFT Transfer</span>
                    <span className="flex items-center space-x-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span>Included</span>
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Estimated Gas Fee</span>
                    <span>~0.001 HBAR</span>
                  </div>
                </CardContent>
              </Card>

              {/* Safety Notice */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-600">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Important Notice</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="text-muted-foreground">• All transactions are final and cannot be reversed</p>
                  <p className="text-muted-foreground">• Ensure you have sufficient balance for the purchase</p>
                  <p className="text-muted-foreground">• The NFT will be transferred to your wallet upon completion</p>
                  <p className="text-muted-foreground">• Contact support if you encounter any issues</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}