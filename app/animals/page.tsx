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
import { ListAnimalModal } from "@/components/modals/list-animal-modal"
import type { Animal, AnimalSpecies, AnimalFilters, AnimalGender } from "@/lib/types"
import { Search, Filter, PlusCircle, Eye, Heart, Calendar, Coins, TrendingUp } from "lucide-react"
import Link from "next/link"

export default function AnimalsPage() {
  const { user } = useAuth()
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState<AnimalFilters>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState<"all" | "my-animals" | "listed">("all")
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [isListModalOpen, setIsListModalOpen] = useState(false)

  const speciesOptions: AnimalSpecies[] = [
    "COW","SHEEP","GOAT","OTHER"
  ]

  useEffect(() => { fetchAnimals() }, [currentPage, filters, searchTerm, viewMode])

  const fetchAnimals = async () => {
    try {
      setLoading(true)
      const base = { page: currentPage, limit: 12 }
      const res =
        viewMode === "my-animals"
          ? await api.findMine(base)
          : await api.getAnimals({ ...base, filters })
      setAnimals(res.data || [])
      setTotalPages(res.pagination?.totalPages || 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (k: keyof AnimalFilters, v: any) => {
    setFilters((p) => ({ ...p, [k]: v }))
    setCurrentPage(1)
  }
  const clearFilters = () => {
    setFilters({})
    setSearchTerm("")
    setCurrentPage(1)
  }
  const handleListForTrade = (a: Animal) => {
    setSelectedAnimal(a)
    setIsListModalOpen(true)
  }
  const handleListSuccess = () => fetchAnimals()

  const AnimalCard = ({ animal }: { animal: Animal }) => {
    const isOwner = user?.id === animal.ownerId
    const canList = isOwner && !animal.isListed
    return (
      <Card className="nft-card overflow-hidden">
        <div className="aspect-square relative overflow-hidden">
          <img
            src={animal.imageUrl || "/placeholder.svg?height=300&width=300&query=cute animal"}
            alt={animal.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex space-x-1">
            {animal.tokenId && (
              <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">NFT</Badge>
            )}
            {animal.isListed && (
              <Badge variant="default" className="bg-green-500/90 text-white">Listed</Badge>
            )}
          </div>
          <div className="absolute top-2 left-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-white/80 hover:bg-white">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg truncate">{animal.name}</h3>
            {animal.aiPredictionValue && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Coins className="h-3 w-3 mr-1" />
                {animal.aiPredictionValue}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="text-xs">{animal.species}</Badge>
            {animal.breed && <span>• {animal.breed}</span>}
            {animal.age && <span>• {animal.age}y</span>}
          </div>
          {animal.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{animal.description}</p>
          )}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(animal.createdAt).toLocaleDateString()}
            </div>
            <div className="flex space-x-2">
              {canList && (
                <Button size="sm" onClick={() => handleListForTrade(animal)}>
                  <TrendingUp className="h-3 w-3 mr-1" />
                  List
                </Button>
              )}
              <Button asChild size="sm" variant="outline">
                <Link href={`/animals/${animal.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Animals</h1>
              <p className="text-muted-foreground mt-2">Discover and manage blockchain-verified animals</p>
            </div>
            <Button asChild>
              <Link href="/animals/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                Register Animal
              </Link>
            </Button>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                  <TabsList>
                    <TabsTrigger value="all">All Animals</TabsTrigger>
                    <TabsTrigger value="my-animals">My Animals</TabsTrigger>
                    <TabsTrigger value="listed">Listed for Trade</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search animals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Species filter – no empty-string item */}
                  <Select
                    value={filters.species ?? "ALL"}
                    onValueChange={(v) => handleFilterChange("species", v === "ALL" ? undefined : (v as AnimalSpecies))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Species" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Species</SelectItem>
                      {speciesOptions.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Gender filter – no empty-string item */}
                  <Select
                    value={filters.gender ?? "ALL"}
                    onValueChange={(v) => handleFilterChange("gender", v === "ALL" ? undefined : (v as AnimalGender))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Genders</SelectItem>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
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

          {loading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : animals.length ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {animals.map((a) => (
                  <AnimalCard key={a.id} animal={a} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
                <Search className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No animals found</h3>
              <p className="text-muted-foreground mb-6">
                {searchTerm || Object.keys(filters).length
                  ? "Try adjusting your search or filters"
                  : "Be the first to register an animal"}
              </p>
              <Button asChild>
                <Link href="/animals/create">Register Your First Animal</Link>
              </Button>
            </div>
          )}

          {selectedAnimal && (
            <ListAnimalModal
              animal={selectedAnimal}
              isOpen={isListModalOpen}
              onClose={() => {
                setIsListModalOpen(false)
                setSelectedAnimal(null)
              }}
              onSuccess={handleListSuccess}
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}