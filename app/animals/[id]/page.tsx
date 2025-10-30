"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
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
import { useToast } from "@/hooks/use-toast"

/* ---------- shadcn Dialog & form ---------- */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

/* ---------- types ---------- */
import type { Animal, UpdateAnimalDto } from "@/lib/types"

/* ---------- icons ---------- */
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
import { FileUploader } from "./FileUploader"

export default function AnimalDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const animalId = params.id as string

  /* ---------- data ---------- */
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  /* ---------- edit modal ---------- */
  const [editOpen, setEditOpen] = useState(false)
  const [editData, setEditData] = useState<UpdateAnimalDto>({})
  const [saving, setSaving] = useState(false)

  /* ---------- delete modal ---------- */
  const [delOpen, setDelOpen] = useState(false)

  /* ---------- fetch ---------- */
  useEffect(() => {
    if (animalId) fetchAnimal()
  }, [animalId])

  const fetchAnimal = async () => {
    try {
      setLoading(true)
      const res = await api.getAnimal(animalId)
      setAnimal(res)
    } catch (err: any) {
      setError(err.message || "Failed to load animal details")
    } finally {
      setLoading(false)
    }
  }

  /* ---------- pré-remplissage ---------- */
  useEffect(() => {
    if (!animal) return
    setEditData({
      name: animal.name,
      species: animal.species,
      gender: animal.gender,
      breed: animal.breed ?? undefined,
      age: animal.age ?? undefined,
      description: animal.description ?? undefined,
      aiPredictionValue: animal.aiPredictionValue ?? undefined,
    })
  }, [animal])

  /* ---------- save ---------- */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!animal) return
    setSaving(true)
    try {
      const updated = await api.updateAnimal(animal.id, editData)
      setAnimal(updated)
      toast({ title: "Saved", description: "Animal updated successfully." })
      setEditOpen(false)
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.response?.data?.message || "Could not update animal.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  /* ---------- delete ---------- */
  const handleDelete = async () => {
    setDelOpen(false)
    if (!animal) return
    try {
      await api.deleteAnimal(animal.id)
      toast({ title: "Deleted", description: "Animal removed." })
      router.push("/animals")
    } catch (err: any) {
      toast({
        title: "Delete failed",
        description: err.response?.data?.message || "Could not delete animal.",
        variant: "destructive",
      })
    }
  }

  /* ---------- utils ---------- */
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: `${label} copied to clipboard.` })
  }

  const isOwner = user && animal && user.id === animal.ownerId

  /* ---------- loading / error ---------- */
  if (loading)
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

  if (error || !animal)
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Alert variant="destructive">
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

  /* ---------- render ---------- */
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* header */}
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
                  <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setDelOpen(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* main */}
            <div className="lg:col-span-2 space-y-6">
              {/* image */}
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

              {/* details */}
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{animal.name}</CardTitle>
                      <CardDescription className="text-lg mt-1">
                        {animal.species} {animal.breed && `• ${animal.breed}`} {animal.age && `• ${animal.age} years old`}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">AI Predicted Value</p>
                      <p className="text-xl font-bold flex items-center">
                        <Coins className="h-5 w-5 mr-1" />
                        {animal.aiPredictionValue != null
                          ? Number(animal.aiPredictionValue).toFixed(0)
                          : "—"}{" "}
                        HBAR
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {animal.description && (
                    <div>
                      <h3 className="font-medium mb-2">Description</h3>
                      <p className="text-muted-foreground leading-relaxed">{animal.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* tabs */}
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

            {/* sidebar */}
            <div className="space-y-6">
              {/* trading */}
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

              {/* owner */}
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
                      <p className="text-sm text-muted-foreground">{animal.owner?.email || "No contact info"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        {/* ---------- EDIT MODAL ---------- */}
<Dialog open={editOpen} onOpenChange={setEditOpen}>
  <DialogContent className="sm:max-w-2xl">
    <DialogHeader>
      <DialogTitle>Edit animal</DialogTitle>
      <DialogDescription>Modify the information below and save.</DialogDescription>
    </DialogHeader>

    <form onSubmit={handleSave} className="grid gap-4 py-2">
      {/* ------- basic fields (unchanged) ------- */}
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label>Name</Label>
          <Input
            value={editData.name || ""}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            required
          />
        </div>

        <div>
          <Label>Species</Label>
          <Select
            value={editData.species || ""}
            onValueChange={(v) => setEditData({ ...editData, species: v as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pick a species" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COW">Cow</SelectItem>
              <SelectItem value="SHEEP">Sheep</SelectItem>
              <SelectItem value="GOAT">Goat</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Gender</Label>
          <Select
            value={editData.gender || ""}
            onValueChange={(v) => setEditData({ ...editData, gender: v as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pick a gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MALE">Male</SelectItem>
              <SelectItem value="FEMALE">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Breed</Label>
          <Input
            value={editData.breed || ""}
            onChange={(e) => setEditData({ ...editData, breed: e.target.value })}
          />
        </div>

        <div>
          <Label>Age (years)</Label>
          <Input
            type="number"
            value={editData.age || ""}
            onChange={(e) => setEditData({ ...editData, age: Number(e.target.value) })}
          />
        </div>

        <div className="col-span-2">
          <Label>Description</Label>
          <Textarea
            value={editData.description || ""}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows={3}
          />
        </div>

        <div className="col-span-2">
          <Label>AI Predicted Value (HBAR)</Label>
          <Input
            type="number"
            step="0.01"
            value={editData.aiPredictionValue || ""}
            onChange={(e) => setEditData({ ...editData, aiPredictionValue: Number(e.target.value) })}
          />
        </div>
      </div>

      {/* ------- NEW : IMAGE UPLOAD ------- */}
      <div className="col-span-2">
        <Label>Animal Image</Label>
        <FileUploader
          accept="image/*"
          onUpload={async (file) => {
            const { imageUrl } = await api.uploadAnimalImage(animal!.id, file)
            setAnimal((prev) => (prev ? { ...prev, imageUrl } : prev))
            toast({ title: "Image uploaded", description: "Animal picture updated." })
          }}
        />
      </div>

      {/* ------- NEW : VET RECORD UPLOAD ------- */}
      <div className="col-span-2">
        <Label>Veterinary Record</Label>
        <FileUploader
          accept=".pdf,.doc,.docx"
          onUpload={async (file) => {
            const { vetRecordUrl } = await api.uploadVetRecord(animal!.id, file)
            setAnimal((prev) => (prev ? { ...prev, vetRecordUrl } : prev))
            toast({ title: "Record uploaded", description: "Vet record updated." })
          }}
        />
      </div>

      <DialogFooter className="gap-2">
        <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <LoadingSpinner className="mr-2 h-4 w-4" />}
          Save
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>

        {/* ---------- DELETE CONFIRMATION MODAL ---------- */}
        <Dialog open={delOpen} onOpenChange={setDelOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to permanently delete <strong>{animal.name}</strong>?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDelOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}