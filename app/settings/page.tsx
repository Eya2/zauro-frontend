"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Bell, Moon, Globe, Shield, Database, Smartphone, Mail } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    darkMode: false,
    language: "en",
    currency: "HBAR",
    autoRefresh: true,
    soundEffects: true,
  })

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16]">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-3xl font-bold text-white flex items-center space-x-2">
              <Settings className="h-8 w-8 text-[#939896]" />
              <span>Settings</span>
            </h1>
            <p className="text-white/70 mt-2">Customize your Zauro marketplace experience</p>
          </div>

          <div className="space-y-8">
            {/* Notifications */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Bell className="h-5 w-5 text-[#939896]" />
                  <span>Notifications</span>
                </CardTitle>
                <CardDescription className="text-white/70">Manage how you receive updates about your trades and animals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-white flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-white/50" />
                      <span>Email Notifications</span>
                    </Label>
                    <p className="text-sm text-white/70">
                      Receive trade updates and important announcements via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                    className="data-[state=unchecked]:bg-white/15 data-[state=checked]:bg-[#093102]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-white flex items-center space-x-2">
                      <Smartphone className="h-4 w-4 text-white/50" />
                      <span>SMS Notifications</span>
                    </Label>
                    <p className="text-sm text-white/70">
                      Get instant SMS alerts for time-sensitive trade updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => handleSettingChange("smsNotifications", checked)}
                    className="data-[state=unchecked]:bg-white/15 data-[state=checked]:bg-[#093102]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-white flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-white/50" />
                      <span>Push Notifications</span>
                    </Label>
                    <p className="text-sm text-white/70">Browser notifications for real-time updates</p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                    className="data-[state=unchecked]:bg-white/15 data-[state=checked]:bg-[#093102]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Moon className="h-5 w-5 text-[#939896]" />
                  <span>Appearance</span>
                </CardTitle>
                <CardDescription className="text-white/70">Customize the look and feel of your dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-white">Dark Mode</Label>
                    <p className="text-sm text-white/70">
                      Switch to dark theme for better viewing in low light
                    </p>
                  </div>
                  <Switch
                    checked={settings.darkMode}
                    onCheckedChange={(checked) => handleSettingChange("darkMode", checked)}
                    className="data-[state=unchecked]:bg-white/15 data-[state=checked]:bg-[#093102]"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-white">Sound Effects</Label>
                    <p className="text-sm text-white/70">Play sounds for trade notifications and actions</p>
                  </div>
                  <Switch
                    checked={settings.soundEffects}
                    onCheckedChange={(checked) => handleSettingChange("soundEffects", checked)}
                    className="data-[state=unchecked]:bg-white/15 data-[state=checked]:bg-[#093102]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Globe className="h-5 w-5 text-[#939896]" />
                  <span>Preferences</span>
                </CardTitle>
                <CardDescription className="text-white/70">Set your language, currency, and regional preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white">Language</Label>
                    <Select value={settings.language} onValueChange={(value) => handleSettingChange("language", value)}>
                      <SelectTrigger className="bg-white/15 text-white border-white/20 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/10 border-white/20 text-white">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Default Currency</Label>
                    <Select value={settings.currency} onValueChange={(value) => handleSettingChange("currency", value)}>
                      <SelectTrigger className="bg-white/15 text-white border-white/20 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white/10 border-white/20 text-white">
                        <SelectItem value="HBAR">HBAR</SelectItem>
                        <SelectItem value="ZAU">ZAU Token</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base text-white">Auto-refresh Data</Label>
                    <p className="text-sm text-white/70">Automatically refresh balances and trade data</p>
                  </div>
                  <Switch
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) => handleSettingChange("autoRefresh", checked)}
                    className="data-[state=unchecked]:bg-white/15 data-[state=checked]:bg-[#093102]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy & Security */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Shield className="h-5 w-5 text-[#939896]" />
                  <span>Privacy & Security</span>
                </CardTitle>
                <CardDescription className="text-white/70">Manage your privacy settings and security preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Two-Factor Authentication</p>
                    <p className="text-sm text-white/70">Add an extra layer of security to your account</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="border-white/20 text-white/80 bg-transparent">Not Enabled</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                    >
                      Enable
                    </Button>
                  </div>
                </div>

                <Separator className="bg-white/20" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Data Export</p>
                    <p className="text-sm text-white/70">Download your account data and trading history</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
                  >
                    <Database className="h-4 w-4 mr-2 text-white/50" />
                    Export Data
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Account Deletion</p>
                    <p className="text-sm text-white/70">
                      Permanently delete your account and all associated data
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-500/90 text-white hover:bg-red-500/80 rounded-xl"
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Save Changes */}
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent rounded-xl"
              >
                Reset to Defaults
              </Button>
              <Button className="bg-[#093102] text-white hover:bg-[#093102]/90 rounded-xl">
                Save Changes
              </Button>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}