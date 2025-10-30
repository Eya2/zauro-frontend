"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Progress } from "@/components/ui/progress"
import type { AnimalSpecies, AnimalGender } from "@/lib/types"
import { ImageIcon, FileText, Sparkles, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

type Step = "details" | "images" | "documents" | "minting" | "success"

export default function CreateAnimalPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("details")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [created, setCreated] = useState<any>(null)

  const [form, setForm] = useState({
    name: "",
    species: "" as AnimalSpecies,
    gender: "" as AnimalGender,
    breed: "",
    age: "",
    description: "",
  })

  const [files, setFiles] = useState({
    image: null as File | null,
    vetRecord: null as File | null,
  })

  const speciesOptions: { value: AnimalSpecies; label: string }[] = [
   
    { value: "COW", label: "Cow" },
    { value: "SHEEP", label: "Sheep" },
    { value: "GOAT", label: "Goat" },
    { value: "OTHER", label: "Other" },
  ]

  const steps = [
    { id: "details", title: "Animal Details", description: "Basic information" },
    { id: "images", title: "Photos", description: "Upload photos (optional)" },
    { id: "documents", title: "Documents", description: "Vet records (optional)" },
    { id: "minting", title: "NFT Minting", description: "Creating blockchain NFT" },
    { id: "success", title: "Complete", description: "Animal registered" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep === "details" && !(form.name && form.species && form.gender && form.breed && form.age)) {
      setError("Please fill in all required fields")
      return
    }
    setError("")
    const order: Step[] = ["details", "images", "documents", "minting", "success"]
    const idx = order.indexOf(currentStep)
    if (idx < order.length - 1) {
      const next = order[idx + 1]
      if (next === "minting") handleSubmit()
      else setCurrentStep(next)
    }
  }
  const handleBack = () => {
    const order: Step[] = ["details", "images", "documents", "minting", "success"]
    const idx = order.indexOf(currentStep)
    if (idx > 0) setCurrentStep(order[idx - 1])
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    setCurrentStep("minting")
    try {
      const data = new FormData()
      data.append("name", form.name)
      data.append("species", form.species)
      data.append("gender", form.gender)
      data.append("breed", form.breed)
      data.append("age", form.age)
      if (form.description) data.append("description", form.description)
      if (files.image) data.append("image", files.image)
      if (files.vetRecord) data.append("vetRecord", files.vetRecord)

      const animal = await api.createAnimal(data)
      setCreated(animal)
      setCurrentStep("success")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create animal")
      setCurrentStep("documents")
    } finally {
      setLoading(false)
    }
  }

  const FileUpload = ({
    type,
    accept,
    title,
    description,
  }: {
    type: "image" | "vetRecord"
    accept: string
    title: string
    description: string
  }) => (
    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
      <input
        type="file"
        accept={accept}
        onChange={(e) => setFiles((p) => ({ ...p, [type]: e.target.files?.[0] || null }))}
        className="hidden"
        id={`${type}-upload`}
      />
      <label htmlFor={`${type}-upload`} className="cursor-pointer">
        <div className="space-y-2">
          {type === "image" ? (
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
          ) : (
            <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
          )}
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {files[type] && (
            <div className="mt-2 p-2 bg-muted rounded text-sm">
              <p className="font-medium">{files[type]!.name}</p>
              <p className="text-muted-foreground">{(files[type]!.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
      </label>
    </div>
  )

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/animals">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Animals
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Register New Animal</h1>
            <p className="text-muted-foreground mt-2">Create an NFT for your animal on the blockchain</p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Step {currentStepIndex + 1} of {steps.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="w-full" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{steps[currentStepIndex]?.title}</span>
                  <span>{steps[currentStepIndex]?.description}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardContent className="p-6">
              {currentStep === "details" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Animal Details</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        name="name"
                        value={form.name}
                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                        placeholder="Enter animal name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Species *</Label>
                      <Select value={form.species} onValueChange={(v) => setForm((p) => ({ ...p, species: v as AnimalSpecies }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select species" />
                        </SelectTrigger>
                        <SelectContent>
                          {speciesOptions.map((o) => (
                            <SelectItem key={o.value} value={o.value}>
                              {o.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Gender *</Label>
                      <Select value={form.gender} onValueChange={(v) => setForm((p) => ({ ...p, gender: v as AnimalGender }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Breed *</Label>
                        <Input
                          name="breed"
                          value={form.breed}
                          onChange={(e) => setForm((p) => ({ ...p, breed: e.target.value }))}
                          placeholder="e.g. Holstein"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Age (years) *</Label>
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          value={form.age}
                          onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                          placeholder="e.g. 3"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                        placeholder="Describe your animal..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "images" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Animal Photos</h2>
                  <p className="text-muted-foreground mb-6">Upload a clear photo of your animal.</p>
                  <FileUpload
                    type="image"
                    accept="image/*"
                    title="Upload Animal Photo"
                    description="JPG, PNG, GIF up to 10 MB (optional)"
                  />
                </div>
              )}

              {currentStep === "documents" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold mb-4">Veterinary Records</h2>
                  <p className="text-muted-foreground mb-6">Upload vet records or health certificates (optional).</p>
                  <FileUpload
                    type="vetRecord"
                    accept=".pdf,.doc,.docx"
                    title="Upload Veterinary Records"
                    description="PDF or DOC up to 10 MB (optional)"
                  />
                </div>
              )}

              {currentStep === "minting" && (
                <div className="text-center space-y-6">
                  <Sparkles className="h-12 w-12 text-primary animate-pulse mx-auto" />
                  <h2 className="text-xl font-semibold">Creating Your NFT</h2>
                  <p className="text-muted-foreground">Minting on Hedera blockchain – please wait...</p>
                  <LoadingSpinner size="lg" />
                </div>
              )}

              {currentStep === "success" && (
                <div className="text-center space-y-6">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                  <h2 className="text-xl font-semibold">Animal Registered Successfully!</h2>
                  <p className="text-muted-foreground">Your animal has been minted as an NFT.</p>
                  {created && (
                    <div className="bg-muted p-4 rounded-lg text-left space-y-1 text-sm">
                      <p><span className="text-muted-foreground">Token ID:</span> {created.tokenId}</p>
                      <p><span className="text-muted-foreground">Serial:</span> {created.tokenSerialNumber}</p>
                      <p><span className="text-muted-foreground">Name:</span> {created.name}</p>
                    </div>
                  )}
                  <div className="flex space-x-4 justify-center">
                    <Button asChild>
                      <Link href={`/animals/${created?.id}`}>View Animal</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/animals">Back to Animals</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {currentStep !== "minting" && currentStep !== "success" && (
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack} disabled={currentStep === "details"}>
                Back
              </Button>
              <Button onClick={handleNext} disabled={loading}>
                {currentStep === "documents" ? "Create NFT" : "Next"}
              </Button>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}