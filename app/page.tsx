"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/layout/navbar"
import { Shield, Zap, Globe, TrendingUp, Users, Lock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-col items-center text-center mb-10 animate-fade-in">
            <Link href="/" className="flex flex-col items-center gap-3 group">
              <div className="w-28 h-28 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/40 scale-100 group-hover:scale-105 transition-transform shadow-lg shadow-[#0288D1]/30">
                <Image src="/logo.png" alt="Zauro" width={96} height={96} className="object-contain" priority />
              </div>
              <span className="text-white font-bold text-4xl tracking-wide drop-shadow-md">Zauro</span>
              <span className="text-xs uppercase tracking-widest text-white/70">Marketplace</span>
            </Link>
            <p className="text-white/80 mt-4 text-sm max-w-sm">
              Trading animals with trust — traceability and transparency for everyone.
            </p>
          </div>

          <Badge className="mb-6 bg-white/15 text-white border-white/20">
            🐂 Trusted Blockchain Animal Trading Platform
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-bold text-white text-balance mb-6">
            Secure Animal Trading
            <span className="block text-[#939896]">Built on Trust</span>
          </h1>

          <p className="text-xl text-white/80 text-pretty max-w-3xl mx-auto mb-8">
            Experience the future of livestock and pet trading with blockchain security, NFT ownership verification, and
            atomic swap technology. Built for farmers, breeders, and animal enthusiasts worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#093102] text-white py-2 rounded-xl hover:bg-[#093102]/90" asChild>
              <Link href="/auth/register">Start Trading Today</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              asChild
            >
              <Link href="/animals">Browse Animals</Link>
            </Button>
          </div>
        </div>

        {/* Trading Interface Preview */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#0288D1]/20 to-[#114232]/20 rounded-3xl blur-3xl" />
            <Card className="relative bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Animal List */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-white">Featured Livestock</h3>
                    <div className="space-y-3">
                      {[
                        { name: "Angus Bull", price: "2,150.00", currency: "HBAR", status: "Listed" },
                        { name: "Holstein Cow", price: "1,890.50", currency: "ZAU", status: "Trading" },
                        { name: "Thoroughbred Mare", price: "4,500.00", currency: "HBAR", status: "Listed" },
                      ].map((animal, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-white/15 rounded-lg border border-white/20"
                        >
                          <div>
                            <p className="font-medium text-sm text-white">{animal.name}</p>
                            <p className="text-xs text-white/70">{animal.status}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm text-[#939896]">{animal.price}</p>
                            <p className="text-xs text-white/70">{ animal.currency}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trading Chart Placeholder */}
                  <div className="lg:col-span-2">
                    <div className="h-64 bg-white/15 rounded-lg flex items-center justify-center border border-white/20">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-[#939896] mx-auto mb-4" />
                        <p className="text-white/80 font-medium">Real-time Market Analytics</p>
                        <p className="text-sm text-white/70 mt-1">Track prices, trends, and trading volume</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-white">Why Choose Zauro Marketplace</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Built with enterprise-grade security and blockchain technology for transparent, fraud-proof animal
              ownership and trading that farmers and breeders can trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-shadow rounded-2xl shadow-[#0288D1]/20">
              <CardHeader>
                <Shield className="w-12 h-12 text-[#939896] mb-4" />
                <CardTitle className="text-white">Blockchain Security</CardTitle>
                <CardDescription className="text-white/70">
                  Immutable ownership records and atomic swap trading prevent fraud and ensure secure transactions for
                  every animal trade.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-shadow rounded-2xl shadow-[#0288D1]/20">
              <CardHeader>
                <Zap className="w-12 h-12 text-[#939896] mb-4" />
                <CardTitle className="text-white">Lightning Fast</CardTitle>
                <CardDescription className="text-white/70">
                  Instant NFT and payment transfers with Hedera Hashgraph's high-throughput blockchain technology.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-shadow rounded-2xl shadow-[#0288D1]/20">
              <CardHeader>
                <Globe className="w-12 h-12 text-[#939896] mb-4" />
                <CardTitle className="text-white">Global Reach</CardTitle>
                <CardDescription className="text-white/70">
                  Connect with buyers and sellers worldwide with multi-currency support (HBAR and ZAU tokens).
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-shadow rounded-2xl shadow-[#0288D1]/20">
              <CardHeader>
                <Users className="w-12 h-12 text-[#939896] mb-4" />
                <CardTitle className="text-white">Trusted Community</CardTitle>
                <CardDescription className="text-white/70">
                  Join verified farmers, breeders, and traders with comprehensive user management and role-based access.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-shadow rounded-2xl shadow-[#0288D1]/20">
              <CardHeader>
                <Lock className="w-12 h-12 text-[#939896] mb-4" />
                <CardTitle className="text-white">Bank-Level Security</CardTitle>
                <CardDescription className="text-white/70">
                  Enterprise-grade encryption, secure key management, and comprehensive audit trails for compliance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-shadow rounded-2xl shadow-[#0288D1]/20">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-[#939896] mb-4" />
                <CardTitle className="text-white">Smart Valuation</CardTitle>
                <CardDescription className="text-white/70">
                  AI-powered market analysis and breed recognition for intelligent pricing and trading decisions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Join the Future?</h2>
          <p className="text-xl text-white/80 mb-8">
            Experience secure, transparent animal trading with blockchain technology and NFT ownership verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#093102] text-white py-2 rounded-xl hover:bg-[#093102]/90" asChild>
              <Link href="/auth/register">Create Your Account</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              asChild
            >
              <Link href="/animals">Explore Marketplace</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}