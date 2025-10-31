"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    country: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined,
        country: formData.country || undefined,
      });

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0288D1] via-[#114232] to-[#0A1E16] p-4">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center text-center mb-10 animate-fade-in">
          <Link href="/" className="flex flex-col items-center gap-3 group">
            <div className="w-28 h-28 rounded-full bg-white/40 flex items-center justify-center backdrop-blur-md border border-white/40 scale-100 group-hover:scale-105 transition-transform shadow-lg shadow-[#0288D1]/30">
              <Image src="/logo.png" alt="Zauro" width={96} height={96} className="object-contain" />
            </div>
            <span className="text-white font-bold text-4xl tracking-wide drop-shadow-md">Zauro</span>
            <span className="text-xs uppercase tracking-widest text-white/70">Marketplace</span>
          </Link>
          <p className="text-white/80 mt-4 text-sm max-w-sm">
            Join the trusted blockchain animal trading platform
          </p>
        </div>

        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl shadow-[#0288D1]/20">
          <CardHeader>
            <CardTitle className="text-center text-white text-2xl">Create Account</CardTitle>
            <CardDescription className="text-center text-white/70 text-sm">
              Sign up and start your journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-red-500/20 text-red-100 border-red-400/30">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* First & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                {[{ id: "firstName", placeholder: "First name" }, { id: "lastName", placeholder: "Last name" }].map(field => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id} className="text-white capitalize">
                      {field.id.replace(/([A-Z])/g, " $1")}
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                      <Input
                        id={field.id}
                        name={field.id}
                        type="text"
                        placeholder={field.placeholder}
                        value={formData[field.id as keyof typeof formData]}
                        onChange={handleChange}
                        className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">Phone (Optional)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+216 55 555 555"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50"
                  />
                </div>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country" className="text-white">Country Code (Optional)</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                  <Input
                    id="country"
                    name="country"
                    type="text"
                    placeholder="TN"
                    value={formData.country}
                    onChange={handleChange}
                    className="pl-10 bg-white/15 text-white border-white/20 placeholder:text-white/50"
                    maxLength={2}
                  />
                </div>
              </div>

              {/* Password */}
              {[
                { id: "password", label: "Password", show: showPassword, toggle: setShowPassword },
                { id: "confirmPassword", label: "Confirm Password", show: showConfirmPassword, toggle: setShowConfirmPassword }
              ].map(({ id, label, show, toggle }) => (
                <div className="space-y-2" key={id}>
                  <Label htmlFor={id} className="text-white">{label}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                    <Input
                      id={id}
                      name={id}
                      type={show ? "text" : "password"}
                      placeholder={label}
                      value={formData[id as keyof typeof formData]}
                      onChange={handleChange}
                      className="pl-10 pr-10 bg-white/15 text-white border-white/20 placeholder:text-white/50"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-2 text-white/60 hover:text-white"
                      onClick={() => toggle(s => !s)}
                    >
                      {show ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                </div>
              ))}

              {/* Submit button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#093102] text-white py-2 rounded-xl"
              >
                {loading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <p className="text-center text-sm mt-6 text-white/80">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-[#939896] hover:underline font-semibold">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
