// types/user.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'HR_MANAGER' | 'EMPLOYEE_TRADER';
  isVerified: boolean;
  country?: string;   // from RegisterDto
  did?: string;       // from AuthResponseDto
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User        // ← already matches AuthResponseDto
}

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
  country?: string
}

export interface OtpRequest {          // ForgotPasswordRequestDto
  email?: string
  phone?: string
}

export interface OtpVerification {     // VerifyOtpDto
  code: string
  email?: string
  phone?: string
}

export interface ResetPasswordRequest { // ResetPasswordDto
  code: string
  newPassword: string
  email?: string
  phone?: string
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

// types/animal.ts  

export type AnimalSpecies =  'COW' | 'SHEEP' | 'GOAT' |'OTHER';
export type AnimalGender  = 'MALE' | 'FEMALE';
export interface Animal {
  id: string;
  name: string;
  species: AnimalSpecies;
  gender: AnimalGender;
  breed?: string;
  age?: number;
  description?: string;
  tokenId?: string | null;
  tokenSerialNumber?: string | null;
  imageUrl?: string | null;
  vetRecordUrl?: string | null;
  aiPredictionValue?: number | null;
  ownerId: string;
  isListed: boolean;
  status: "PENDING_EXPERT_REVIEW" | "EXPERT_APPROVED" | "EXPERT_REJECTED" | "EXPIRED";
  expertReviewedBy?: string | null;
  expertReviewComment?: string | null;
  expertReviewDate?: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// optional helper for filters
export interface AnimalFilters {
  species?: AnimalSpecies;
  gender?: AnimalGender;
  minAge?: number;
  maxAge?: number;
}

// DTOs that match backend exactly
export interface CreateAnimalDto {
  name: string;
  species: AnimalSpecies;
  gender: AnimalGender;
  breed?: string;
  age?: number;
  description?: string;
  aiPredictionValue?: number;
  status?: "PENDING_EXPERT_REVIEW" | "EXPERT_APPROVED" | "EXPERT_REJECTED" | "EXPIRED";
  isListed?: boolean;
}

// types/animal.ts  (or types/index.ts if you re-export everything from there)
export interface UpdateAnimalDto extends Partial<CreateAnimalDto> {}
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
  //type: "PASSWORD_RESET" | "EMAIL_VERIFICATION" | "PHONE_VERIFICATION"
}

export interface OtpVerification {
  code: string
  email?: string
  phone?: string
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
