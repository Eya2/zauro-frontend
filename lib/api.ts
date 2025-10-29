import axios, { type AxiosInstance } from "axios"
import { config } from "./config"
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Animal,
  Trade,
  Wallet,
  WalletBalance,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  OtpRequest,
  OtpVerification,
  AnimalFilters,
  TradeFilters,
  Notification,
} from "./types"

class ApiClient {
  private client: AxiosInstance
  

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: {
        "Content-Type": "application/json",
      },
    })
    console.log(">>> Axios baseURL", config.api.baseUrl) // ← ajoute cette ligne


    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("accessToken")
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error),
    )

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = localStorage.getItem("refreshToken")
            if (refreshToken) {
              const response = await this.client.post("/auth/refresh", {
                refreshToken,
              })

              const { accessToken } = response.data.data
              localStorage.setItem("accessToken", accessToken)

              return this.client(originalRequest)
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            window.location.href = "/auth/login"
          }
        }

        return Promise.reject(error)
      },
    )
  }

  // Auth endpoints
async login(data: LoginRequest): Promise<AuthResponse> {
  const res = await this.client.post<AuthResponse>("/auth/login", data)
  return res.data
}

async register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await this.client.post<AuthResponse>("/auth/register", data)
  return res.data
}

async refreshToken(_refreshToken: string): Promise<{ accessToken: string }> {
  const res = await this.client.post<{ accessToken: string }>("/auth/refresh", {})
  return res.data
}

async getProfile(): Promise<User> {
  const res = await this.client.get<User>("/auth/profile")
  return res.data
}

async requestPasswordReset(data: OtpRequest): Promise<void> {
  await this.client.post("/auth/forgot-password/request", data)
}

async verifyOtp(data: OtpVerification): Promise<void> {
  await this.client.post("/auth/forgot-password/verify", data)
}

async resetPassword(data: { code: string; newPassword: string; email?: string; phone?: string }): Promise<void> {
  await this.client.post("/auth/forgot-password/reset", data)
}

  // Animals endpoints
  async getAnimals(params?: {
    page?: number
    limit?: number
    filters?: AnimalFilters
  }): Promise<PaginatedResponse<Animal>> {
    const response = await this.client.get<PaginatedResponse<Animal>>("/animals", { params })
    return response.data
  }

  async getAnimal(id: string): Promise<Animal> {
  const response = await this.client.get<Animal>(`/animals/${id}`)
  return response.data         
}
async getMyAnimals(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Animal>> {
  const res = await this.client.get<PaginatedResponse<Animal>>("/animals/mine", { params });
  return res.data; 
}
  async createAnimal(data: FormData): Promise<Animal> {
    const response = await this.client.post<ApiResponse<Animal>>("/animals", data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return response.data.data!
  }

  async updateAnimal(id: string, data: Partial<Animal>): Promise<Animal> {
    const response = await this.client.patch<ApiResponse<Animal>>(`/animals/${id}`, data)
    return response.data.data!
  }

  async deleteAnimal(id: string): Promise<void> {
    await this.client.delete(`/animals/${id}`)
  }

  async uploadAnimalImage(id: string, file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData()
    formData.append("image", file)
    const response = await this.client.post<ApiResponse<{ imageUrl: string }>>(
      `/animals/${id}/upload-image`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    )
    return response.data.data!
  }

  async uploadVetRecord(id: string, file: File): Promise<{ vetRecordUrl: string }> {
    const formData = new FormData()
    formData.append("vetRecord", file)
    const response = await this.client.post<ApiResponse<{ vetRecordUrl: string }>>(
      `/animals/${id}/upload-vet-record`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    )
    return response.data.data!
  }

  // Trades endpoints
  async getTrades(params?: {
    page?: number
    limit?: number
    filters?: TradeFilters
  }): Promise<PaginatedResponse<Trade>> {
    const response = await this.client.get<PaginatedResponse<Trade>>("/trades", { params })
    return response.data
  }

  async getTrade(id: string): Promise<Trade> {
    const res = await this.client.get<Trade>(`/trades/${id}`)
    return res.data         
  }

  async listAnimalForTrade(data: {
    animalId: string
    price: number        
    currency: "HBAR" | "ZAU"
  }): Promise<Trade> {
    const res = await this.client.post<Trade>("/trades/list", data)
    return res.data
  }

  async buyAnimal(tradeId: string): Promise<Trade> {
    const response = await this.client.post<ApiResponse<Trade>>(`/trades/buy/${tradeId}`)
    return response.data.data!
  }

  async executeTrade(tradeId: string): Promise<Trade> {
    const response = await this.client.post<ApiResponse<Trade>>(`/trades/execute/${tradeId}`)
    return response.data.data!
  }

  async cancelTrade(tradeId: string): Promise<Trade> {
    const response = await this.client.post<ApiResponse<Trade>>(`/trades/cancel/${tradeId}`)
    return response.data.data!
  }

// Wallet endpoints
async createWallet(): Promise<Wallet> {
  const res = await this.client.post<Wallet>("/wallets/create", {})
  return res.data
}

async getMyWallet(): Promise<Wallet> {
  const res = await this.client.get<Wallet>("/wallets/my-wallet")
  return res.data
}

async getWalletBalance(walletId?: string): Promise<WalletBalance> {
  const endpoint = walletId ? `/wallets/${walletId}/balance` : "/wallets/my-wallet/balance"
  const res = await this.client.get<WalletBalance>(endpoint)
  return res.data
}

async transferHbar(toAccountId: string, amount: string): Promise<{ txId: string; status: string }> {
  const res = await this.client.post<{ txId: string; status: string }>(
    '/wallets/transfer/hbar',
    { toAccountId, amount } // amount is already a string here
  )
  return res.data
}

/** Fund the authenticated user’s own wallet with HBAR from the operator */
async fundMyAccount(amount: string, memo?: string): Promise<{ txId: string; status: string }> {
  const res = await this.client.post<{ txId: string; status: string }>(
    '/wallets/fund/my-account',
    { amount, memo }
  )
  return res.data
}
/** Fund ANY Hedera account with HBAR from the operator (admin-like) */
async fundAccount(accountId: string, amount: number, memo?: string): Promise<{ txId: string; status: string }> {
  const res = await this.client.post<{ txId: string; status: string }>(
    '/wallets/fund/account',
    { accountId, amount, memo }
  )
  return res.data
}

/** Create a wallet and immediately fund it with the supplied HBAR amount */
async createWalletWithBalance(initialHbar: number): Promise<Wallet> {
  const res = await this.client.post<Wallet>(
    '/wallets/create-with-balance',
    { amount: initialHbar }
  )
  return res.data
}
  // Notifications endpoints
  async getNotifications(params?: {
    page?: number
    limit?: number
    unreadOnly?: boolean
  }): Promise<PaginatedResponse<Notification>> {
    const response = await this.client.get<PaginatedResponse<Notification>>("/notifications", { params })
    return response.data
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.client.patch(`/notifications/${id}/read`)
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.client.patch("/notifications/read-all")
  }
}

export const api = new ApiClient()
