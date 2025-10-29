// User Types
export interface User {
  id: string
  email: string
  phone?: string
  firstName: string
  lastName: string
  role: "ADMIN" | "HR_MANAGER" | "EMPLOYEE_TRADER"
  isActive: boolean
  isVerified: boolean
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

// Wallet Types
export interface Wallet {
  id: string
  userId: string
  hederaAccountId: string
  publicKey: string
  createdAt: string
  updatedAt: string
}

export interface WalletBalance {
  hbar: string
  zauToken: string
}

// Animal Types
export type AnimalSpecies = "DOG" | "CAT" | "BIRD" | "FISH" | "REPTILE" | "OTHER"

export interface Animal {
  status(status: any): string | undefined
  id: string
  name: string
  species: AnimalSpecies
  breed?: string
  age?: number
  description?: string
  tokenId?: string
  tokenSerialNumber?: string
  imageUrl?: string
  vetRecordUrl?: string
  aiPredictionValue?: string
  ownerId: string
  isListed: boolean
  createdAt: string
  updatedAt: string
  owner?: User
}

// Trade Types
export type TradeStatus = "PENDING" | "LISTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "FAILED"

export interface Trade {
  id: string
  animalId: string
  sellerId: string
  buyerId?: string
  price: string
  currency: "HBAR" | "ZAU"
  status: TradeStatus
  contractAddress?: string
  transactionHash?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  animal?: Animal
  seller?: User
  buyer?: User
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  timestamp: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  total: number
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Auth Types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

// OTP Types
export interface OtpRequest {
  email?: string
  phone?: string
  type: "PASSWORD_RESET" | "EMAIL_VERIFICATION" | "PHONE_VERIFICATION"
}

export interface OtpVerification {
  code: string
  email?: string
  phone?: string
}

// Filter Types
export interface AnimalFilters {
  species?: AnimalSpecies[]
  minAge?: number
  maxAge?: number
  breed?: string
  isListed?: boolean
  search?: string
}

export interface TradeFilters {
  status?: TradeStatus[]
  currency?: ("HBAR" | "ZAU")[]
  minPrice?: string
  maxPrice?: string
  sellerId?: string
  buyerId?: string
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR"
  isRead: boolean
  createdAt: string
}
