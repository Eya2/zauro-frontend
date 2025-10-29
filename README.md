# Zauro Marketplace Frontend

A modern, blockchain-based animal trading marketplace built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Authentication System**: Secure login, registration, and password reset with OTP support
- **Animal Management**: Register, list, and manage animals with NFT minting capabilities
- **Trading System**: Buy, sell, and trade animals with atomic swap execution on Hedera Hashgraph
- **Wallet Integration**: Hedera wallet management with HBAR and ZAU token support
- **Real-time Notifications**: Stay updated on trades, payments, and platform activities
- **Admin Dashboard**: Comprehensive admin tools for platform management
- **Responsive Design**: Mobile-first design with modern UI components

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Context + SWR
- **Authentication**: JWT with refresh tokens
- **Blockchain**: Hedera Hashgraph integration
- **File Uploads**: Multi-format support with validation

## Getting Started

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd zauro-marketplace-frontend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Update the environment variables in `.env.local`:
   - `NEXT_PUBLIC_API_URL`: Backend API URL
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
   - `NEXT_PUBLIC_HEDERA_NETWORK`: Hedera network (testnet/mainnet)
   - `NEXT_PUBLIC_HEDERA_MIRROR_NODE_URL`: Hedera mirror node URL

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3002](http://localhost:3002)

## Project Structure

\`\`\`
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── animals/           # Animal management
│   ├── trades/            # Trading system
│   ├── notifications/     # Notifications
│   ├── admin/             # Admin dashboard
│   └── profile/           # User profile
├── components/            # Reusable components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   └── ui/                # UI components (shadcn/ui)
├── lib/                   # Utilities and configurations
│   ├── api.ts             # API client
│   ├── auth-context.tsx   # Authentication context
│   ├── types.ts           # TypeScript types
│   └── config.ts          # App configuration
└── hooks/                 # Custom React hooks
\`\`\`

## API Integration

The frontend integrates with the Zauro Marketplace Backend through a comprehensive API client that handles:

- Authentication and authorization
- Animal CRUD operations with file uploads
- Trading system with blockchain integration
- Wallet management and balance tracking
- Real-time notifications
- Admin operations

## Key Features

### Authentication
- Email/password login and registration
- Multi-factor authentication with OTP
- Password reset via email or SMS
- JWT token management with automatic refresh

### Animal Management
- Register animals with detailed information
- Upload images and veterinary records
- NFT minting on Hedera Hashgraph
- Search and filter capabilities

### Trading System
- List animals for sale
- Browse available animals
- Execute trades with atomic swaps
- Real-time trade status updates

### Wallet Integration
- Hedera wallet creation and management
- HBAR and ZAU token balance tracking
- Transaction history
- Secure key management

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_HEDERA_NETWORK` | Hedera network (testnet/mainnet) | Yes |
| `NEXT_PUBLIC_HEDERA_MIRROR_NODE_URL` | Hedera mirror node URL | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | No |
| `NEXT_PUBLIC_APP_URL` | Frontend application URL | No |
| `NEXT_PUBLIC_MAX_FILE_SIZE` | Maximum file upload size in bytes | No |
| `NEXT_PUBLIC_ALLOWED_FILE_TYPES` | Comma-separated allowed file types | No |
| `NEXT_PUBLIC_MAILERSEND_FROM` | Default sender email for contact forms | No |
| `NEXT_PUBLIC_DEV_MODE` | Enable development mode features | No |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
