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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Animal } from "@/lib/types"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Share2,
  Heart,
  FileText,
  Coins,
  ShoppingCart,
  Eye,
  Copy,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function AnimalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const animalId = params.id as string

  useEffect(() => {
    if (animalId) {
      fetchAnimal()
    }
  }, [animalId])

  const fetchAnimal = async () => {
    try {
      setLoading(true)
      const res = await api.getAnimal(animalId)
      console.log('>>> getAnimal raw response', res) // ← ajoute ça
      if (!res || typeof res !== 'object') {
        throw new Error('Empty response from server')
      }
      
      setAnimal(res)
    } catch (err: any) {
      console.error('>>> getAnimal catch', err) // ← et ça
      setError(err.message || 'Failed to load animal details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!animal || !window.confirm("Are you sure you want to delete this animal? This action cannot be undone.")) {
      return
    }

    try {
      await api.deleteAnimal(animal.id)
      toast({
        title: "Animal deleted",
        description: "The animal has been successfully deleted.",
      })
      router.push("/animals")
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.response?.data?.message || "Failed to delete animal.",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    })
  }

  const isOwner = user && animal && user.id === animal.ownerId

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
              <AlertDescription>{error || "Animal not found or access denied"}</AlertDescription>
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
              <Link href="/animals">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Animals
              </Link>
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Favorite
              </Button>
              {isOwner && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/animals/${animal.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Animal Image */}
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <img
                      src={animal.imageUrl || "/placeholder.svg?height=400&width=600&query=cute animal"}
                      alt={animal.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 flex space-x-2">
                      {animal.tokenId && (
                        <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                          NFT
                        </Badge>
                      )}
                      {animal.isListed && (
                        <Badge variant="default" className="bg-green-500/90 text-white">
                          Listed for Trade
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Animal Details */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{animal.name}</CardTitle>
                      <CardDescription className="text-lg mt-1">
                        {animal.species} {animal.breed && `• ${animal.breed}`}{" "}
                        {animal.age && `• ${animal.age} years old`}
                      </CardDescription>
                    </div>
                    {animal.aiPredictionValue && (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">AI Predicted Value</p>
                        <p className="text-xl font-bold flex items-center">
                          <Coins className="h-5 w-5 mr-1" />
                          {Number.parseFloat(animal.aiPredictionValue).toFixed(0)} HBAR
                        </p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {animal.description && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Description</h3>
                        <p className="text-muted-foreground leading-relaxed">{animal.description}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
                  <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Species</p>
                          <p className="font-medium">{animal.species}</p>
                        </div>
                        {animal.breed && (
                          <div>
                            <p className="text-sm text-muted-foreground">Breed</p>
                            <p className="font-medium">{animal.breed}</p>
                          </div>
                        )}
                        {animal.age && (
                          <div>
                            <p className="text-sm text-muted-foreground">Age</p>
                            <p className="font-medium">{animal.age} years</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-muted-foreground">Registered</p>
                          <p className="font-medium">{new Date(animal.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Owner</p>
                          <p className="font-medium">
                            {animal.owner ? `${animal.owner.firstName} ${animal.owner.lastName}` : "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={animal.isListed ? "default" : "secondary"}>
                            {animal.isListed ? "Listed for Trade" : "Not Listed"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="blockchain" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>NFT Information</CardTitle>
                      <CardDescription>Blockchain details for this animal NFT</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {animal.tokenId ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">Token ID</p>
                              <p className="text-sm text-muted-foreground font-mono">{animal.tokenId}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(animal.tokenId!, "Token ID")}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          {animal.tokenSerialNumber && (
                            <div className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">Serial Number</p>
                                <p className="text-sm text-muted-foreground">{animal.tokenSerialNumber}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(animal.tokenSerialNumber!, "Serial Number")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <Button variant="outline" className="w-full bg-transparent">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View on Hedera Explorer
                          </Button>
                        </div>
                      ) : (
                        <Alert>
                          <AlertDescription>This animal has not been minted as an NFT yet.</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Documents</CardTitle>
                      <CardDescription>Veterinary records and other documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {animal.vetRecordUrl ? (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Veterinary Records</p>
                              <p className="text-sm text-muted-foreground">Health certificates and medical history</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={animal.vetRecordUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <Alert>
                          <AlertDescription>No documents have been uploaded for this animal.</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Trading Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Trading</CardTitle>
                  <CardDescription>Buy or sell this animal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {animal.isListed ? (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">Available for Trade</p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">Listed</p>
                      </div>
                      {!isOwner && (
  <Button asChild className="w-full">
    <Link href={`/animals/${animal.id}/buy`}>
      <ShoppingCart className="h-4 w-4 mr-2" />
      Buy Now
    </Link>
  </Button>
)}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Alert>
                        <AlertDescription>This animal is not currently listed for trade.</AlertDescription>
                      </Alert>
                      {isOwner && (
                        <Button variant="outline" className="w-full bg-transparent">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          List for Trade
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Owner Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Owner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-primary-foreground font-medium">{animal.owner?.firstName?.[0] || "U"}</span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {animal.owner ? `${animal.owner.firstName} ${animal.owner.lastName}` : "Unknown Owner"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Member since {animal.owner ? new Date(animal.owner.createdAt).getFullYear() : "N/A"}
                      </p>
                    </div>
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
