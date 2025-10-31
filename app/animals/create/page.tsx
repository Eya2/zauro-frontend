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
import { ImageIcon, FileText, Sparkles, ArrowLeft, CheckCircle, Upload } from "lucide-react"
import Link from "next/link"

/* ---------- 1.  TYPES ---------- */
type Step = "details" | "images" | "documents" | "minting" | "success"
type Mode = "photo" | "manual" | null

/* ---------- 2.  CHOICE SCREEN ---------- */
function ChoiceScreen({ onChoose }: { onChoose: (m: Mode) => void }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white drop-shadow-md">Register an Animal</h1>
        <p className="text-white/80 mt-2">Pick the fastest way for you</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card
          onClick={() => onChoose("photo")}
          className="cursor-pointer bg-white/10 backdrop-blur border-white/20 p-8 hover:scale-105 transition"
        >
          <Upload className="h-12 w-12 text-white/60 mx-auto mb-4" />
          <p className="text-white font-semibold text-center">Upload Photo</p>
          <p className="text-white/60 text-sm text-center mt-1">AI will fill the details</p>
        </Card>

        <Card
          onClick={() => onChoose("manual")}
          className="cursor-pointer bg-white/10 backdrop-blur border-white/20 p-8 hover:scale-105 transition"
        >
          <FileText className="h-12 w-12 text-white/60 mx-auto mb-4" />
          <p className="text-white font-semibold text-center">Fill Form</p>
          <p className="text-white/60 text-sm text-center mt-1">Enter data manually</p>
        </Card>
      </div>
    </div>
  )
}

/* ---------- 3.  PHOTO-FIRST FLOW ---------- */
function PhotoFirst() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f?.type.startsWith("image/")) setFile(f)
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true); setError("")
    try {
      const animal = await api.createAnimal(
        {
          name: "Auto-detected",               // temp, backend/AI will update
          species: "COW",
          gender: "FEMALE",
          status: "PENDING_EXPERT_REVIEW",
        },
        file
      )
      router.push(`/animals/${animal.id}`)
    } catch (err: any) {
      setError(err.response?.data?.message || "Upload failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card className="bg-white/10 backdrop-blur border-white/20 shadow-2xl rounded-2xl">
        <CardContent className="p-8">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-white/30 rounded-xl p-12 text-center"
          >
            <ImageIcon className="h-16 w-16 text-white/60 mx-auto mb-4" />
            <p className="text-white font-medium mb-1">Drop an animal photo here</p>
            <p className="text-white/60 text-sm">AI will detect breed, age, etc.</p>

            {file && (
              <div className="mt-4">
                <p className="text-white text-sm">{file.name}</p>
                <Button onClick={handleUpload} disabled={loading} className="mt-4 bg-[#093102] text-white rounded-xl">
                  {loading ? <LoadingSpinner size="sm" /> : "Create Animal"}
                </Button>
              </div>
            )}
            {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center mt-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
      </div>
    </div>
  )
}

/* ---------- 4.  MANUAL WIZARD (your existing code, trimmed) ---------- */
function ManualWizard() {
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
    isListed: false,
    status: "PENDING_EXPERT_REVIEW" as const,
  })

  const [files, setFiles] = useState({ image: null as File | null, vetRecord: null as File | null })

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
      setError("Please fill in all required fields"); return
    }
    setError("")
    const order: Step[] = ["details", "images", "documents", "minting", "success"]
    const idx = order.indexOf(currentStep)
    if (idx < order.length - 1) {
      const next = order[idx + 1]
      if (next === "minting") handleSubmit(); else setCurrentStep(next)
    }
  }
  const handleBack = () => {
    const order: Step[] = ["details", "images", "documents", "minting", "success"]
    const idx = order.indexOf(currentStep)
    if (idx > 0) setCurrentStep(order[idx - 1])
  }

  const handleSubmit = async () => {
    setLoading(true); setError(""); setCurrentStep("minting")
    try {
      const dto = {
        name: form.name,
        species: form.species,
        gender: form.gender,
        breed: form.breed,
        age: Number(form.age),
        description: form.description || undefined,
        isListed: false,
        status: "PENDING_EXPERT_REVIEW" as const,
      }
      const animal = await api.createAnimal(dto, files.image, files.vetRecord)
      setCreated(animal); setCurrentStep("success")
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create animal"); setCurrentStep("documents")
    } finally {
      setLoading(false)
    }
  }

  /* ---------- 5.  RENDER ---------- */
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/10"
            asChild
          >
            <Link href="/animals">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Animals
            </Link>
          </Button>
        </div>
        <h1 className="text-4xl font-bold text-white drop-shadow-md">Register New Animal</h1>
        <p className="text-white/80 mt-3 text-lg">Create an NFT for your animal on the blockchain</p>
      </div>

      <Card className="mb-10 bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div className="flex justify-between text-sm text-white/80">
              <span>Step {currentStepIndex + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full bg-white/20 [&>*]:bg-[#093102]" />
            <div className="flex justify-between text-sm text-white/70">
              <span>{steps[currentStepIndex]?.title}</span>
              <span>{steps[currentStepIndex]?.description}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="mb-8 bg-red-500/20 text-red-100 border-red-400/30">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl">
        <CardContent className="p-8">
          {currentStep === "details" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-white">Animal Details</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-white">Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Enter animal name"
                    className="bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Species *</Label>
                  <Select
                    value={form.species}
                    onValueChange={(v) => setForm((p) => ({ ...p, species: v as AnimalSpecies }))}
                  >
                    <SelectTrigger className="bg-white/15 text-white border-white/20 rounded-xl">
                      <SelectValue placeholder="Select species" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                      {["COW", "SHEEP", "GOAT", "OTHER"].map((s) => (
                        <SelectItem key={s} value={s} className="text-white">
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Gender *</Label>
                  <Select
                    value={form.gender}
                    onValueChange={(v) => setForm((p) => ({ ...p, gender: v as AnimalGender }))}
                  >
                    <SelectTrigger className="bg-white/15 text-white border-white/20 rounded-xl">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Breed *</Label>
                    <Input
                      value={form.breed}
                      onChange={(e) => setForm((p) => ({ ...p, breed: e.target.value }))}
                      placeholder="e.g. Holstein"
                      className="bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white">Age (years) *</Label>
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      value={form.age}
                      onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                      placeholder="e.g. 3"
                      className="bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Describe your animal..."
                    className="bg-white/15 text-white border-white/20 placeholder:text-white/50 rounded-xl"
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === "images" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-white">Animal Photos</h2>
              <p className="text-white/70">Upload a clear photo of your animal.</p>
              <FileUpload
                type="image"
                accept="image/*"
                title="Upload Animal Photo"
                description="JPG, PNG, GIF up to 10 MB (optional)"
                files={files}
                setFiles={setFiles}
              />
            </div>
          )}

          {currentStep === "documents" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-semibold text-white">Veterinary Records</h2>
              <p className="text-white/70">Upload vet records or health certificates (optional).</p>
              <FileUpload
                type="vetRecord"
                accept=".pdf,.doc,.docx"
                title="Upload Veterinary Records"
                description="PDF or DOC up to 10 MB (optional)"
                files={files}
                setFiles={setFiles}
              />
            </div>
          )}

          {currentStep === "minting" && (
            <div className="text-center space-y-8">
              <Sparkles className="h-16 w-16 text-[#939896] animate-pulse mx-auto" />
              <h2 className="text-2xl font-semibold text-white">Creating Your NFT</h2>
              <p className="text-white/70 text-lg">Minting on Hedera blockchain – please wait...</p>
              <LoadingSpinner size="lg" className="text-white" />
            </div>
          )}

          {currentStep === "success" && (
            <div className="text-center space-y-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-semibold text-white">Animal Registered Successfully!</h2>
              <p className="text-white/70 text-lg">Your animal has been minted as an NFT.</p>
              {created && (
                <div className="bg-white/15 p-4 rounded-xl border border-white/20 text-left space-y-2 text-sm">
                  <p><span className="text-white/70">Token ID:</span> <span className="text-white">{created.tokenId}</span></p>
                  <p><span className="text-white/70">Serial:</span> <span className="text-white">{created.tokenSerialNumber}</span></p>
                  <p><span className="text-white/70">Name:</span> <span className="text-white">{created.name}</span></p>
                </div>
              )}
              <div className="flex space-x-4 justify-center">
                <Button asChild className="bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl px-8">
                  <Link href={`/animals/${created?.id}`}>View Animal</Link>
                </Button>
                <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl px-8">
                  <Link href="/animals">Back to Animals</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {currentStep !== "minting" && currentStep !== "success" && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === "details"}
            className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl px-6"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={loading}
            className="bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl px-6"
          >
            {currentStep === "documents" ? "Save" : "Next"}
          </Button>
        </div>
      )}
    </div>
  )
}

/* ---------- 6.  SHARED FILE UPLOADER COMPONENT ---------- */
function FileUpload({
  type,
  accept,
  title,
  description,
  files,
  setFiles,
}: {
  type: "image" | "vetRecord"
  accept: string
  title: string
  description: string
  files: { image: File | null; vetRecord: File | null }
  setFiles: React.Dispatch<React.SetStateAction<{ image: File | null; vetRecord: File | null }>>
}) {
  return (
    <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center bg-white/15 backdrop-blur-sm">
      <input
        type="file"
        accept={accept}
        onChange={(e) =>
          setFiles((p) => ({ ...p, [type]: e.target.files?.[0] || null }))
        }
        className="hidden"
        id={`${type}-upload`}
      />
      <label htmlFor={`${type}-upload`} className="cursor-pointer">
        <div className="space-y-3">
          {type === "image" ? (
            <ImageIcon className="h-12 w-12 text-white/50 mx-auto" />
          ) : (
            <FileText className="h-12 w-12 text-white/50 mx-auto" />
          )}
          <div>
            <p className="font-medium text-white">{title}</p>
            <p className="text-sm text-white/70">{description}</p>
          </div>
          {files[type] && (
            <div className="mt-3 p-3 bg-white/15 rounded-lg border border-white/20 text-sm">
              <p className="font-medium text-white">{files[type]!.name}</p>
              <p className="text-white/70">{(files[type]!.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          )}
        </div>
      </label>
    </div>
  )
}

/* ---------- 7.  MAIN PAGE ---------- */
export default function CreateAnimalPage() {
  const [mode, setMode] = useState<Mode>(null)

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16]">
        <Navbar />
        {mode === null && <ChoiceScreen onChoose={setMode} />}
        {mode === "photo" && <PhotoFirst />}
        {mode === "manual" && <ManualWizard />}
      </div>
    </ProtectedRoute>
  )
}