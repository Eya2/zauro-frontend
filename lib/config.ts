export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api/v1",
    timeout: 10000,
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "Zauro Marketplace",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
    isDev: process.env.NEXT_PUBLIC_DEV_MODE === "true",
  },
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  },
  hedera: {
    network: process.env.NEXT_PUBLIC_HEDERA_NETWORK || "testnet",
    mirrorNodeUrl: process.env.NEXT_PUBLIC_HEDERA_MIRROR_NODE_URL || "https://testnet.mirrornode.hedera.com",
  },
  email: {
    from: process.env.NEXT_PUBLIC_MAILERSEND_FROM || "noreply@yourdomain.com",
  },
  upload: {
    maxFileSize: Number.parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE || "10485760"),
    allowedTypes: (
      process.env.NEXT_PUBLIC_ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/gif,application/pdf"
    ).split(","),
  },
  otp: {
    length: 6,
    expiresInMinutes: 10,
  },
} as const

export type Config = typeof config
