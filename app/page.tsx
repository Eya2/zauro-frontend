import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Navbar } from "@/components/layout/navbar"
import { Shield, Zap, Globe, TrendingUp, Users, Lock } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background rustic-texture">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 mb-6 logo-container">
              <Image src="/logo.png" alt="Zauro Marketplace" fill className="object-contain" priority />
            </div>
          </div>

          <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary border-primary/20">
            🐂 Trusted Blockchain Animal Trading Platform
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-bold text-balance mb-6">
            Secure Animal Trading
            <span className="block text-primary">Built on Trust</span>
          </h1>

          <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto mb-8">
            Experience the future of livestock and pet trading with blockchain security, NFT ownership verification, and
            atomic swap technology. Built for farmers, breeders, and animal enthusiasts worldwide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
              <Link href="/auth/register">Start Trading Today</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/5 bg-transparent" asChild>
              <Link href="/animals">Browse Animals</Link>
            </Button>
          </div>
        </div>

        {/* Trading Interface Preview */}
        <div className="max-w-6xl mx-auto mt-16">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl" />
            <Card className="relative agricultural-card border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Animal List */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-foreground">Featured Livestock</h3>
                    <div className="space-y-3">
                      {[
                        { name: "Angus Bull", price: "2,150.00", currency: "HBAR", status: "Listed" },
                        { name: "Holstein Cow", price: "1,890.50", currency: "ZAU", status: "Trading" },
                        { name: "Thoroughbred Mare", price: "4,500.00", currency: "HBAR", status: "Listed" },
                      ].map((animal, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-primary/10"
                        >
                          <div>
                            <p className="font-medium text-sm text-foreground">{animal.name}</p>
                            <p className="text-xs text-muted-foreground">{animal.status}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-sm text-primary">{animal.price}</p>
                            <p className="text-xs text-muted-foreground">{animal.currency}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trading Chart Placeholder */}
                  <div className="lg:col-span-2">
                    <div className="h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center border border-primary/10">
                      <div className="text-center">
                        <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">Real-time Market Analytics</p>
                        <p className="text-sm text-muted-foreground mt-1">Track prices, trends, and trading volume</p>
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
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Why Choose Zauro Marketplace</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built with enterprise-grade security and blockchain technology for transparent, fraud-proof animal
              ownership and trading that farmers and breeders can trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="agricultural-card border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-foreground">Blockchain Security</CardTitle>
                <CardDescription>
                  Immutable ownership records and atomic swap trading prevent fraud and ensure secure transactions for
                  every animal trade.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="agricultural-card border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-foreground">Lightning Fast</CardTitle>
                <CardDescription>
                  Instant NFT and payment transfers with Hedera Hashgraph's high-throughput blockchain technology.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="agricultural-card border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Globe className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-foreground">Global Reach</CardTitle>
                <CardDescription>
                  Connect with buyers and sellers worldwide with multi-currency support (HBAR and ZAU tokens).
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="agricultural-card border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-foreground">Trusted Community</CardTitle>
                <CardDescription>
                  Join verified farmers, breeders, and traders with comprehensive user management and role-based access.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="agricultural-card border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Lock className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-foreground">Bank-Level Security</CardTitle>
                <CardDescription>
                  Enterprise-grade encryption, secure key management, and comprehensive audit trails for compliance.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="agricultural-card border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <TrendingUp className="w-12 h-12 text-primary mb-4" />
                <CardTitle className="text-foreground">Smart Valuation</CardTitle>
                <CardDescription>
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
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Join the Future?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Experience secure, transparent animal trading with blockchain technology and NFT ownership verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90" asChild>
              <Link href="/auth/register">Create Your Account</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/5 bg-transparent" asChild>
              <Link href="/animals">Explore Marketplace</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
