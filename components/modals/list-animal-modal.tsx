"use client"

import type React from "react"
import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useToast } from "@/hooks/use-toast"
import type { Animal } from "@/lib/types"
import { TrendingUp, Coins } from "lucide-react"

interface ListAnimalModalProps {
  animal: Animal
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ListAnimalModal({ animal, isOpen, onClose, onSuccess }: ListAnimalModalProps) {
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState<"HBAR" | "ZAU">("HBAR")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!price || Number.parseFloat(price) <= 0) {
      toast({
        title: "Invalid Price",
        description: "Please enter a valid price greater than 0",
        variant: "destructive",
        className: "bg-red-500/20 text-red-100 border-red-400/30",
      })
      return
    }

    try {
      setLoading(true)
      await api.listAnimalForTrade({
        animalId: animal.id,
        price: Number(price),
        currency: currency,
      })

      toast({
        title: "Animal Listed Successfully",
        description: `${animal.name} has been listed for trade at ${price} ${currency}`,
        className: "bg-green-500/20 text-green-100 border-green-400/30",
      })

      onSuccess()
      onClose()
      setPrice("")
      setCurrency("HBAR")
    } catch (error: any) {
      console.error("Failed to list animal:", error)
      toast({
        title: "Failed to List Animal",
        description: error.response?.data?.message || "An error occurred while listing the animal",
        variant: "destructive",
        className: "bg-red-500/20 text-red-100 border-red-400/30",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
      setPrice("")
      setCurrency("HBAR")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-white">
            <TrendingUp className="h-5 w-5 text-[#939896]" />
            <span>List Animal for Trade</span>
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Set a price to list {animal.name} on the marketplace
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Animal Preview */}
          <div className="flex items-center space-x-3 p-3 bg-white/15 rounded-lg border border-white/20">
            <img
              src={animal.imageUrl || "/placeholder.svg?height=50&width=50&query=cute animal"}
              alt={animal.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-medium text-white">{animal.name}</h4>
              <p className="text-sm text-white/70">
                {animal.species} {animal.breed && `• ${animal.breed}`}
              </p>
            </div>
          </div>

          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-white">Price *</Label>
            <div className="relative">
              <Coins className="absolute left-3 top-3 h-4 w-4 text-white/50" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-white">Currency *</Label>
            <Select value={currency} onValueChange={(value: "HBAR" | "ZAU") => setCurrency(value)} disabled={loading}>
              <SelectTrigger className="bg-white/15 text-white border-white/20">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-white/10 backdrop-blur-xl border-white/20 text-white">
                <SelectItem value="HBAR">HBAR (Hedera)</SelectItem>
                <SelectItem value="ZAU">ZAU Token</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AI Prediction Value (if available) */}
          {animal.aiPredictionValue && (
            <div className="p-3 bg-white/15 rounded-lg border border-white/20">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-[#0288D1] rounded-full"></div>
                <span className="text-white/80">
                  AI Predicted Value: {Number(animal.aiPredictionValue).toFixed(0)} HBAR
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            { animal.status === "EXPERT_APPROVED" ? (
            <Button
              type="submit"
              className="bg-[#093102] text-white rounded-xl hover:bg-[#093102]/90"
              disabled={loading || !price}
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Listing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2 text-white/60" />
                  List for Trade
                </>
              )}
            </Button>) : (
              <Button
              type="button"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              disabled={loading}
            >
              Pending Approval 
            </Button>)}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}