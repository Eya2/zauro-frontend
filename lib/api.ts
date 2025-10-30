// api.ts – whole, corrected file
import axios, { AxiosInstance } from "axios"
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
  UpdateAnimalDto,
  ResetPasswordRequest,   // added
} from "./types"

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      timeout: config.api.timeout,
      headers: { "Content-Type": "application/json" },
    })
    console.log(">>> Axios baseURL", config.api.baseUrl)

    // Request interceptor – inject access-token
    this.client.interceptors.request.use(
      (cfg) => {
        const token = localStorage.getItem("accessToken")
        if (token) cfg.headers.Authorization = `Bearer ${token}`
        return cfg
      },
      (error) => Promise.reject(error),
    )

    // Response interceptor – auto-refresh
    this.client.interceptors.response.use(
      (res) => res,
      async (err) => {
        const original = err.config
        if (err.response?.status === 401 && !original._retry) {
          original._retry = true
          const refreshToken = localStorage.getItem("refreshToken")
          if (refreshToken) {
            try {
              const { accessToken } = await this.refreshToken(refreshToken)
              localStorage.setItem("accessToken", accessToken)
              return this.client(original)
            } catch {
              this.logout()
            }
          } else this.logout()
        }
        return Promise.reject(err)
      },
    )
  }

  private logout() {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    window.location.href = "/auth/login"
  }

  /* =========================================================
   * AUTH
   * =======================================================*/

  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await this.client.post<AuthResponse>("/auth/login", data)
    return res.data
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await this.client.post<AuthResponse>("/auth/register", data)
    return res.data
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const res = await this.client.post<{ accessToken: string }>(
      "/auth/refresh",
      {},                                                       // empty body
      { headers: { Authorization: `Bearer ${refreshToken}` } },
    )
    return res.data
  }

  async getProfile(): Promise<User> {
    const res = await this.client.get<{ data: User }>("/auth/profile")
    return res.data.data // unwrap
  }

  async requestPasswordReset(data: OtpRequest): Promise<void> {
    await this.client.post("/auth/forgot-password/request", data)
  }

  async verifyOtp(data: OtpVerification): Promise<void> {
    await this.client.post("/auth/forgot-password/verify", data)
  }

  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    await this.client.post("/auth/forgot-password/reset", data)
  }

  /* =========================================================
   * ANIMALS
   * =======================================================*/

  async getAnimals(params?: {
    page?: number
    limit?: number
    filters?: AnimalFilters
  }): Promise<PaginatedResponse<Animal>> {
    const res = await this.client.get<PaginatedResponse<Animal>>("/animals", { params })
    return res.data
  }
async findMine(params?: {
  page?: number
  limit?: number
}): Promise<PaginatedResponse<Animal>> {
  const res = await this.client.get<PaginatedResponse<Animal>>("/animals/my", {
    params,
  })
  return res.data
}
  async getAnimal(id: string): Promise<Animal> {
    const res = await this.client.get<Animal>(`/animals/${id}`)
    return res.data
  }
  
  async createAnimal(formData: FormData): Promise<Animal> {
    const res = await this.client.post<ApiResponse<Animal>>("/animals", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    return res.data.data!
  }

  /* -------------- Admin / Manager only -------------- */
  async getPendingReview(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Animal>> {
    const res = await this.client.get<PaginatedResponse<Animal>>("/animals/pending-review", { params })
    return res.data
  }

  async reviewAnimal(id: string, payload: { approved: boolean; comment?: string }): Promise<Animal> {
    const res = await this.client.put<ApiResponse<Animal>>(`/animals/${id}/review`, payload)
    return res.data.data!
  }
  /* -------------------------------------------------- */

  async mintAnimal(id: string): Promise<Animal> {
    const res = await this.client.post<ApiResponse<Animal>>(`/animals/${id}/mint`, {})
    return res.data.data!
  }

  async updateAnimal(id: string, data: Partial<UpdateAnimalDto>): Promise<Animal> {
    const res = await this.client.patch<ApiResponse<Animal>>(`/animals/${id}`, data)
    return res.data.data!
  }

  async deleteAnimal(id: string): Promise<void> {
    await this.client.delete(`/animals/${id}`)
  }


async uploadAnimalImage(id: string, file: File): Promise<{ imageUrl: string }> {
  if (!file || file.size === 0) throw new Error("Empty file");

  const form = new FormData();
  form.append("image", file); // field name MUST match backend → "image"

  const res = await this.client.post<ApiResponse<{ imageUrl: string }>>(
    `animals/${id}/upload-image`, // ← no leading slash (uses baseURL)
    form
    // DO NOT set headers: Axios will set Content-Type + boundary automatically
  );
  return res.data.data!;
}

async uploadVetRecord(id: string, file: File): Promise<{ vetRecordUrl: string }> {
  if (!file || file.size === 0) throw new Error("Empty file");

  const form = new FormData();
  form.append("vetRecord", file); // field name MUST match backend → "vetRecord"

  const res = await this.client.post<ApiResponse<{ vetRecordUrl: string }>>(
    `animals/${id}/upload-vet-record`,
    form
  );
  return res.data.data!;
}
  /* =========================================================
   * TRADES
   * =======================================================*/

  async getTrades(params?: {
    page?: number
    limit?: number
    filters?: TradeFilters
  }): Promise<PaginatedResponse<Trade>> {
    const res = await this.client.get<PaginatedResponse<Trade>>("/trades", { params })
    return res.data
  }

  async getTrade(id: string): Promise<Trade> {
    const res = await this.client.get<Trade>(`/trades/${id}`)
    return res.data
  }

  async listAnimalForTrade(data: { animalId: string; price: number; currency: "HBAR" | "ZAU" }): Promise<Trade> {
    const res = await this.client.post<Trade>("/trades/list", data)
    return res.data
  }

  async buyAnimal(tradeId: string): Promise<Trade> {
    const res = await this.client.post<ApiResponse<Trade>>(`/trades/buy/${tradeId}`)
    return res.data.data!
  }

  async executeTrade(tradeId: string): Promise<Trade> {
    const res = await this.client.post<ApiResponse<Trade>>(`/trades/execute/${tradeId}`)
    return res.data.data!
  }

  async cancelTrade(tradeId: string): Promise<Trade> {
    const res = await this.client.post<ApiResponse<Trade>>(`/trades/cancel/${tradeId}`)
    return res.data.data!
  }

  /* =========================================================
   * WALLETS
   * =======================================================*/

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
    const res = await this.client.post<{ txId: string; status: string }>("/wallets/transfer/hbar", { toAccountId, amount })
    return res.data
  }

  async fundMyAccount(amount: string, memo?: string): Promise<{ txId: string; status: string }> {
    const res = await this.client.post<{ txId: string; status: string }>("/wallets/fund/my-account", { amount, memo })
    return res.data
  }

  async fundAccount(accountId: string, amount: number, memo?: string): Promise<{ txId: string; status: string }> {
    const res = await this.client.post<{ txId: string; status: string }>("/wallets/fund/account", { accountId, amount, memo })
    return res.data
  }

  async createWalletWithBalance(initialHbar: number): Promise<Wallet> {
    const res = await this.client.post<Wallet>("/wallets/create-with-balance", { amount: initialHbar })
    return res.data
  }

  /* =========================================================
   * NOTIFICATIONS
   * =======================================================*/

  async getNotifications(params?: {
    page?: number
    limit?: number
    unreadOnly?: boolean
  }): Promise<PaginatedResponse<Notification>> {
    const res = await this.client.get<PaginatedResponse<Notification>>("/notifications", { params })
    return res.data
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.client.patch(`/notifications/${id}/read`)
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.client.patch("/notifications/read-all")
  }
}

export const api = new ApiClient()