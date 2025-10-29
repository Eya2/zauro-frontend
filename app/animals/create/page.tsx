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
import type { AnimalSpecies } from "@/lib/types"
import { ImageIcon, FileText, Sparkles, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"

type Step = "details" | "images" | "documents" | "minting" | "success"

export default function CreateAnimalPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("details")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [createdAnimal, setCreatedAnimal] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: "",
    species: "" as AnimalSpecies,
    breed: "",
    age: "",
    description: "",
  })

  const [files, setFiles] = useState({
    image: null as File | null,
    vetRecord: null as File | null,
  })

  const speciesOptions: { value: AnimalSpecies; label: string }[] = [
    { value: "DOG", label: "Dog" },
    { value: "CAT", label: "Cat" },
    { value: "BIRD", label: "Bird" },
    { value: "FISH", label: "Fish" },
    { value: "REPTILE", label: "Reptile" },
    { value: "OTHER", label: "Other" },
  ]

  const steps = [
    { id: "details", title: "Animal Details", description: "Basic information about your animal" },
    { id: "images", title: "Photos", description: "Upload animal photos (optional)" },
    { id: "documents", title: "Documents", description: "Veterinary records (optional)" },
    { id: "minting", title: "NFT Minting", description: "Creating blockchain NFT" },
    { id: "success", title: "Complete", description: "Animal registered successfully" },
  ]

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep)
  const progress = ((currentStepIndex + 1) / steps.length) * 100

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSpeciesChange = (value: AnimalSpecies) => {
    setFormData((prev) => ({
      ...prev,
      species: value,
    }))
  }

  const handleFileChange = (type: "image" | "vetRecord", file: File | null) => {
    setFiles((prev) => ({
      ...prev,
      [type]: file,
    }))
  }

  const validateStep = (step: Step): boolean => {
    switch (step) {
      case "details":
        // REQUIS : name, species, breed, age
        return !!(formData.name && formData.species && formData.breed && formData.age)
      case "images":
      case "documents":
        return true // optional
      default:
        return true
    }
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) {
      setError("Please fill in all required fields")
      return
    }
    setError("")
    const stepOrder: Step[] = ["details", "images", "documents", "minting", "success"]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1]
      if (nextStep === "minting") {
        handleSubmit()
      } else {
        setCurrentStep(nextStep)
      }
    }
  }

  const handleBack = () => {
    const stepOrder: Step[] = ["details", "images", "documents", "minting", "success"]
    const currentIndex = stepOrder.indexOf(currentStep)
    if (currentIndex > 0) setCurrentStep(stepOrder[currentIndex - 1])
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    setCurrentStep("minting")

    try {
      const submitData = new FormData()
      submitData.append("name", formData.name)
      submitData.append("species", formData.species)
      submitData.append("breed", formData.breed)
      submitData.append("age", formData.age)
      if (formData.description) submitData.append("description", formData.description)

      // ✅ fichiers vraiment optionnels
      if (files.image) submitData.append("image", files.image)
      if (files.vetRecord) submitData.append("vetRecord", files.vetRecord)

      const animal = await api.createAnimal(submitData)
      setCreatedAnimal(animal)
      setCurrentStep("success")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create animal. Please try again.")
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
        onChange={(e) => handleFileChange(type, e.target.files?.[0] || null)}
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
          {/* Header */}
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

          {/* Progress */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>
                    Step {currentStepIndex + 1} of {steps.length}
                  </span>
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

          {/* Step Content */}
          <Card>
            <CardContent className="p-6">
              {currentStep === "details" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Animal Details</h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Animal Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter animal name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="species">
                          Species <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formData.species} onValueChange={handleSpeciesChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select species" />
                          </SelectTrigger>
                          <SelectContent>
                            {speciesOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="breed">
                            Breed <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="breed"
                            name="breed"
                            value={formData.breed}
                            onChange={handleInputChange}
                            placeholder="e.g., Golden Retriever"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="age">
                            Age (years) <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="age"
                            name="age"
                            type="number"
                            value={formData.age}
                            onChange={handleInputChange}
                            placeholder="e.g., 3"
                            min="0"
                            max="50"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Describe your animal's personality, health, and any special characteristics..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === "images" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Animal Photos</h2>
                    <p className="text-muted-foreground mb-6">
                      Upload a clear photo of your animal. This will be used for the NFT image.
                    </p>
                    <FileUpload
                      type="image"
                      accept="image/*"
                      title="Upload Animal Photo"
                      description="JPG, PNG, or GIF up to 10 MB (optional)"
                    />
                  </div>
                </div>
              )}

              {currentStep === "documents" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Veterinary Records</h2>
                    <p className="text-muted-foreground mb-6">
                      Upload veterinary records, health certificates, or other relevant documents (optional).
                    </p>
                    <FileUpload
                      type="vetRecord"
                      accept=".pdf,.doc,.docx"
                      title="Upload Veterinary Records"
                      description="PDF or DOC files up to 10 MB (optional)"
                    />
                  </div>
                </div>
              )}

              {currentStep === "minting" && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Creating Your NFT</h2>
                    <p className="text-muted-foreground">
                      We're minting your animal as an NFT on the Hedera blockchain. This may take a few moments...
                    </p>
                  </div>
                  <LoadingSpinner size="lg" />
                </div>
              )}

              {currentStep === "success" && (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Animal Registered Successfully!</h2>
                    <p className="text-muted-foreground">
                      Your animal has been registered and minted as an NFT on the blockchain.
                    </p>
                  </div>
                  {createdAnimal && (
                    <div className="bg-muted p-4 rounded-lg text-left">
                      <h3 className="font-medium mb-2">NFT Details:</h3>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Token ID:</span> {createdAnimal.tokenId}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Serial Number:</span>{" "}
                          {createdAnimal.tokenSerialNumber}
                        </p>
                        <p>
                          <span className="text-muted-foreground">Name:</span> {createdAnimal.name}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex space-x-4 justify-center">
                    <Button asChild>
                      <Link href={`/animals/${createdAnimal?.id}`}>View Animal</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/animals">Back to Animals</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
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