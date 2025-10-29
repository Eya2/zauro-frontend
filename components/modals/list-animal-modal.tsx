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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span>List Animal for Trade</span>
          </DialogTitle>
          <DialogDescription>Set a price to list {animal.name} on the marketplace</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Animal Preview */}
          <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
            <img
              src={animal.imageUrl || "/placeholder.svg?height=50&width=50&query=cute animal"}
              alt={animal.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-medium">{animal.name}</h4>
              <p className="text-sm text-muted-foreground">
                {animal.species} {animal.breed && `• ${animal.breed}`}
              </p>
            </div>
          </div>

          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <div className="relative">
              <Coins className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Currency Selection */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select value={currency} onValueChange={(value: "HBAR" | "ZAU") => setCurrency(value)} disabled={loading}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HBAR">HBAR (Hedera)</SelectItem>
                <SelectItem value="ZAU">ZAU Token</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* AI Prediction Value (if available) */}
          {animal.aiPredictionValue && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-blue-700 dark:text-blue-300">
                  AI Predicted Value: {Number.parseFloat(animal.aiPredictionValue).toFixed(0)} HBAR
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !price}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Listing...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  List for Trade
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
