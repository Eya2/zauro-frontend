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
import type { Animal, UpdateAnimalDto } from "@/lib/types"
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

  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [editData, setEditData] = useState<UpdateAnimalDto>({})
  const [saving, setSaving] = useState(false)
  const [delOpen, setDelOpen] = useState(false)

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
      status : "PENDING_EXPERT_REVIEW" , 
      isListed : false 
    })
  }, [animal])

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: `${label} copied to clipboard.` })
  }

  const isOwner = user && animal && user.id === animal.ownerId

  if (loading)
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

  if (error || !animal)
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16]">
          <Navbar />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <Alert className="bg-red-500/20 text-red-100 border-red-400/30">
              <AlertDescription>{error || "Animal not found"}</AlertDescription>
            </Alert>
            <Button
              asChild
              className="mt-6 bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl px-6"
            >
              <Link href="/animals">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Animals
              </Link>
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16]">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* header */}
          <div className="flex items-center justify-between mb-12">
            <Button
              variant="ghost"
              className="text-white/60 hover:text-white hover:bg-white/10"
              asChild
            >
              <Link href="/animals">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Animals
              </Link>
            </Button>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
              >
                <Share2 className="h-4 w-4 mr-2 text-white/50" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
              >
                <Heart className="h-4 w-4 mr-2 text-white/50" />
                Favorite
              </Button>
              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditOpen(true)}
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                  >
                    <Edit className="h-4 w-4 mr-2 text-white/50" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDelOpen(true)}
                    className="bg-red-500/90 text-white hover:bg-red-500/80 rounded-xl"
                  >
                    <Trash2 className="h-4 w-4 mr-2 text-white/50" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* main */}
            <div className="lg:col-span-2 space-y-8">
              {/* image */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                    <img
                      src={animal.imageUrl || "/placeholder.svg?height=400&width=600&query=cute animal"}
                      alt={animal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 flex space-x-2">
                      {animal.tokenId && (
                        <Badge className="bg-[#939896]/90 text-white">NFT</Badge>
                      )}
                      {animal.isListed && (
                        <Badge className="bg-green-500/90 text-white">Listed for Trade</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* details */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl font-bold text-white">{animal.name}</CardTitle>
                      <CardDescription className="text-lg text-white/70 mt-2">
                        {animal.species} {animal.breed && `• ${animal.breed}`} {animal.age && `• ${animal.age} years old`}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white/70">AI Predicted Value</p>
                      <p className="text-xl font-bold flex items-center text-white">
                        <Coins className="h-5 w-5 mr-1 text-[#939896]" />
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
                      <h3 className="font-medium text-white mb-3">Description</h3>
                      <p className="text-white/70 leading-relaxed">{animal.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* tabs */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-white/15 border-white/20 rounded-xl p-1">
                  <TabsTrigger
                    value="details"
                    className="text-white/80 data-[state=active]:bg-[#093102] data-[state=active]:text-white rounded-lg"
                  >
                    Details
                  </TabsTrigger>
                  <TabsTrigger
                    value="blockchain"
                    className="text-white/80 data-[state=active]:bg-[#093102] data-[state=active]:text-white rounded-lg"
                  >
                    Blockchain
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="text-white/80 data-[state=active]:bg-[#093102] data-[state=active]:text-white rounded-lg"
                  >
                    Documents
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                    <CardContent className="p-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-white/70">Species</p>
                          <p className="font-medium text-white">{animal.species}</p>
                        </div>
                        {animal.breed && (
                          <div>
                            <p className="text-sm text-white/70">Breed</p>
                            <p className="font-medium text-white">{animal.breed}</p>
                          </div>
                        )}
                        {animal.gender && (
                          <div>
                            <p className="text-sm text-white/70">Gender</p>
                            <p className="font-medium text-white">{animal.gender}</p>
                          </div>
                        )}
                        {animal.age && (
                          <div>
                            <p className="text-sm text-white/70">Age</p>
                            <p className="font-medium text-white">{animal.age} years</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm text-white/70">Registered</p>
                          <p className="font-medium text-white">{new Date(animal.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-white/70">Owner</p>
                          <p className="font-medium text-white">
                            {animal.owner ? `${animal.owner.firstName} ${animal.owner.lastName}` : "Unknown"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-white/70">Status</p>
                          <Badge className={animal.isListed ? "bg-green-500/90 text-white" : "bg-white/15 text-white border-white/20"}>
                            {animal.isListed ? "Listed for Trade" : "Not Listed"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="blockchain" className="space-y-4">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                    <CardHeader>
                      <CardTitle className="text-white">NFT Information</CardTitle>
                      <CardDescription className="text-white/70">Blockchain details for this animal NFT</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {animal.tokenId ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 border border-white/20 rounded-xl bg-white/15">
                            <div>
                              <p className="font-medium text-white">Token ID</p>
                              <p className="text-sm text-white/70 font-mono">{animal.tokenId}</p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(animal.tokenId!, "Token ID")}
                              className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                            >
                              <Copy className="h-4 w-4 text-white/50" />
                            </Button>
                          </div>
                          {animal.tokenSerialNumber && (
                            <div className="flex items-center justify-between p-3 border border-white/20 rounded-xl bg-white/15">
                              <div>
                                <p className="font-medium text-white">Serial Number</p>
                                <p className="text-sm text-white/70">{animal.tokenSerialNumber}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(animal.tokenSerialNumber!, "Serial Number")}
                                className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                              >
                                <Copy className="h-4 w-4 text-white/50" />
                              </Button>
                            </div>
                          )}
                          <Button
                            variant="outline"
                            className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                          >
                            <ExternalLink className="h-4 w-4 mr-2 text-white/50" />
                            View on Hedera Explorer
                          </Button>
                        </div>
                      ) : (
                        <Alert className="bg-white/15 text-white border-white/20">
                          <AlertDescription>This animal has not been minted as an NFT yet.</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                    <CardHeader>
                      <CardTitle className="text-white">Documents</CardTitle>
                      <CardDescription className="text-white/70">Veterinary records and other documents</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {animal.vetRecordUrl ? (
                        <div className="flex items-center justify-between p-3 border border-white/20 rounded-xl bg-white/15">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-8 w-8 text-white/50" />
                            <div>
                              <p className="font-medium text-white">Veterinary Records</p>
                              <p className="text-sm text-white/70">Health certificates and medical history</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                          >
                            <a href={animal.vetRecordUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4 mr-2 text-white/50" />
                              View
                            </a>
                          </Button>
                        </div>
                      ) : (
                        <Alert className="bg-white/15 text-white border-white/20">
                          <AlertDescription>No documents have been uploaded for this animal.</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* sidebar */}
            <div className="space-y-8">
              {/* trading */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardHeader>
                  <CardTitle className="text-white">Trading</CardTitle>
                  <CardDescription className="text-white/70">Buy or sell this animal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {animal.isListed ? (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                        <p className="text-sm text-green-400">Available for Trade</p>
                        <p className="text-2xl font-bold text-green-300">Listed</p>
                      </div>
                      {!isOwner && (
                        <Button
                          asChild
                          className="w-full bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl"
                        >
                          <Link href={`/animals/${animal.id}/buy`}>
                            <ShoppingCart className="h-4 w-4 mr-2 text-white/50" />
                            Buy Now
                          </Link>
                        </Button>
                      )}
                    </div>
                  ) : 
                   animal!.status ==="EXPERT_APPROVED" ? (
                    <div className="space-y-4">
                      <Alert className="bg-white/15 text-white border-white/20">
                        <AlertDescription>This animal is not currently listed for trade.</AlertDescription>
                      </Alert>
                      {isOwner && (
                        <Button
                          variant="outline"
                          className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2 text-white/50" />
                          List for Trade
                        </Button>
                      )}
                    </div>) : (
                     <Alert className="bg-red-500/20 text-white border-red-400/30">
                     <AlertDescription className="text-white">
                       This animal cannot be listed for trade until it is expert approved.
                     </AlertDescription>
                   </Alert>
                   )}
                  
                </CardContent>
              </Card>

              {/* owner */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
                <CardHeader>
                  <CardTitle className="text-white">Owner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#093102] rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">{animal.owner?.firstName?.[0] || "U"}</span>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {animal.owner ? `${animal.owner.firstName} ${animal.owner.lastName}` : "Unknown Owner"}
                      </p>
                      <p className="text-sm text-white/70">{animal.owner?.email || "No contact info"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Edit Modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-2xl bg-white/10 backdrop-blur-xl border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Animal</DialogTitle>
              <DialogDescription className="text-white/70">Modify the information below and save.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label className="text-white">Name</Label>
                  <Input
                    value={editData.name || ""}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    required
                    className="bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Species</Label>
                  <Select
                    value={editData.species || ""}
                    onValueChange={(v) => setEditData({ ...editData, species: v as any })}
                  >
                    <SelectTrigger className="bg-white/15 text-white border-white/20 rounded-xl">
                      <SelectValue placeholder="Pick a species" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white w-[180px]">
                      <SelectItem value="COW">Cow</SelectItem>
                      <SelectItem value="SHEEP">Sheep</SelectItem>
                      <SelectItem value="GOAT">Goat</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Gender</Label>
                  <Select
                    value={editData.gender || ""}
                    onValueChange={(v) => setEditData({ ...editData, gender: v as any })}
                  >
                    <SelectTrigger className="bg-white/15 text-white border-white/20 rounded-xl">
                      <SelectValue placeholder="Pick a gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white w-[180px]">
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Breed</Label>
                  <Input
                    value={editData.breed || ""}
                    onChange={(e) => setEditData({ ...editData, breed: e.target.value })}
                    className="bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">Age (years)</Label>
                  <Input
                    type="number"
                    value={editData.age || ""}
                    onChange={(e) => setEditData({ ...editData, age: Number(e.target.value) })}
                    className="bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={editData.description || ""}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    rows={3}
                    className="bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-white">AI Predicted Value (HBAR)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editData.aiPredictionValue || ""}
                    onChange={(e) => setEditData({ ...editData, aiPredictionValue: Number(e.target.value) })}
                    className="bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-white">Animal Image</Label>
                  <FileUploader
                    accept="image/*"
                    onUpload={async (file) => {
                      const { imageUrl } = await api.uploadAnimalImage(animal!.id, file)
                      setAnimal((prev) => (prev ? { ...prev, imageUrl } : prev))
                      toast({ title: "Image uploaded", description: "Animal picture updated." })
                    }}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label className="text-white">Veterinary Record</Label>
                  <FileUploader
                    accept=".pdf,.doc,.docx"
                    onUpload={async (file) => {
                      const { vetRecordUrl } = await api.uploadVetRecord(animal!.id, file)
                      setAnimal((prev) => (prev ? { ...prev, vetRecordUrl } : prev))
                      toast({ title: "Record uploaded", description: "Vet record updated." })
                    }}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl"
                >
                  {saving && <LoadingSpinner className="mr-2 h-4 w-4" />}
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={delOpen} onOpenChange={setDelOpen}>
          <DialogContent className="sm:max-w-md bg-white/10 backdrop-blur-xl border-white/20 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-white/70">
                Are you sure you want to permanently delete <strong>{animal.name}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setDelOpen(false)}
                className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-500/90 text-white hover:bg-red-500/80 rounded-xl"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  )
}