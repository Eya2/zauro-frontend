"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-shadow rounded-2xl shadow-[#0288D1]/20 overflow-hidden group">
        <div className="aspect-square relative overflow-hidden bg-white/5">
          <img
            src={animal.imageUrl || "/placeholder.svg?height=300&width=300&query=cute animal"}
            alt={animal.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 flex space-x-1">
            {animal.tokenId && (
              <Badge className="bg-[#939896]/90 text-white">NFT</Badge>
            )}
            {animal.isListed && (
              <Badge className="bg-green-500/90 text-white">Listed</Badge>
            )}
          </div>
          <div className="absolute top-3 left-3">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white hover:text-white border-white/20">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-white truncate">{animal.name}</h3>
            {animal.aiPredictionValue && (
              <div className="flex items-center text-sm text-[#939896]">
                <Coins className="h-4 w-4 mr-1" />
                {Number(animal.aiPredictionValue).toFixed(0)}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-white/70">
            <Badge className="bg-white/15 text-white border-white/20 text-xs">{animal.species}</Badge>
            {animal.breed && <span>• {animal.breed}</span>}
            {animal.age && <span>• {animal.age}y</span>}
          </div>
          {animal.description && (
            <p className="text-sm text-white/70 line-clamp-2">{animal.description}</p>
          )}
          <div className="flex items-center justify-between pt-3">
            <div className="flex items-center text-xs text-white/60">
              <Calendar className="h-3 w-3 mr-1" />
              {new Date(animal.createdAt).toLocaleDateString()}
            </div>
            <div className="flex space-x-2">
              {canList && (
                <Button 
                  size="sm" 
                  onClick={() => handleListForTrade(animal)}
                  className="bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl px-3"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  List
                </Button>
              )}
              <Button 
                asChild 
                size="sm" 
                className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl px-3"
              >
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
      <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16]">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12 text-center sm:text-left">
            <div className="sm:w-1/2">
              <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-md">
                Animal Marketplace
              </h1>
              <p className="text-white/80 text-lg max-w-md">
                Discover and manage blockchain-verified animals for trading
              </p>
            </div>
            <Button 
              asChild
              size="lg"
              className="bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl px-8 py-3 mt-6 sm:mt-0 w-full sm:w-auto shadow-lg shadow-[#0288D1]/20"
            >
              <Link href="/animals/create">
                <PlusCircle className="h-5 w-5 mr-2" />
                Register Animal
              </Link>
            </Button>
          </div>

          {/* Filters Card */}
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20 mb-10">
            <CardContent className="p-8">
              <div className="space-y-6">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                  <TabsList className="grid w-full grid-cols-3 bg-white/15 border-white/20 rounded-xl p-1">
                    <TabsTrigger 
                      value="all" 
                      className="text-white/80 data-[state=active]:bg-[#093102] data-[state=active]:text-white rounded-lg"
                    >
                      All Animals
                    </TabsTrigger>
                    <TabsTrigger 
                      value="my-animals" 
                      className="text-white/80 data-[state=active]:bg-[#093102] data-[state=active]:text-white rounded-lg"
                    >
                      My Animals
                    </TabsTrigger>
                    <TabsTrigger 
                      value="listed" 
                      className="text-white/80 data-[state=active]:bg-[#093102] data-[state=active]:text-white rounded-lg"
                    >
                      Listed for Trade
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      placeholder="Search animals..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                    />
                  </div>

                  {/* Species filter */}
                  <Select
                    value={filters.species ?? "ALL"}
                    onValueChange={(v) => handleFilterChange("species", v === "ALL" ? undefined : (v as AnimalSpecies))}
                  >
                    <SelectTrigger className="bg-white/15 text-white border-white/20 rounded-xl">
                      <SelectValue placeholder="Species" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white w-[180px]">
                      <SelectItem value="ALL">All Species</SelectItem>
                      {speciesOptions.map((s) => (
                        <SelectItem key={s} value={s} className="text-white">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Gender filter */}
                  <Select
                    value={filters.gender ?? "ALL"}
                    onValueChange={(v) => handleFilterChange("gender", v === "ALL" ? undefined : (v as AnimalGender))}
                  >
                    <SelectTrigger className="bg-white/15 text-white border-white/20 rounded-xl">
                      <SelectValue placeholder="Gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white w-[180px]">
                      <SelectItem value="ALL">All Genders</SelectItem>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={clearFilters} 
                      className="bg-transparent border-white/20 text-white hover:bg-white/10 rounded-xl px-4"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : animals.length ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
                {animals.map((a) => (
                  <AnimalCard key={a.id} animal={a} />
                ))}
              </div>

              {totalPages > 1 && (
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg rounded-2xl shadow-[#0288D1]/20">
                  <CardContent className="p-8 flex items-center justify-center space-x-4">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl px-6"
                    >
                      Previous
                    </Button>
                    <span className="text-lg font-medium text-white">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl px-6"
                    >
                      Next
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20 max-w-2xl mx-auto">
              <CardContent className="p-12 text-center space-y-6">
                <div className="w-28 h-28 bg-white/15 rounded-2xl flex items-center justify-center mx-auto border border-white/20">
                  <Search className="h-12 w-12 text-white/50" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">No animals found</h3>
                  <p className="text-white/70 text-lg">
                    {searchTerm || Object.keys(filters).length
                      ? "Try adjusting your search or filters"
                      : "Be the first to register an animal"}
                  </p>
                </div>
                <Button 
                  asChild
                  className="bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl px-8 py-3 shadow-lg shadow-[#0288D1]/20"
                >
                  <Link href="/animals/create">Register Your First Animal</Link>
                </Button>
              </CardContent>
            </Card>
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