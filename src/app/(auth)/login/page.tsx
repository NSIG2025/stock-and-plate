"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ email: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await signIn("credentials", { ...form, redirect: false })
    setLoading(false)
    if (res?.error) {
      toast.error("Invalid email or password")
    } else {
      router.push("/pantry")
    }
  }

  return (
    <div className="px-8 py-8">
      <h2 className="font-display text-2xl font-bold text-[#2C1810] mb-1">Welcome back</h2>
      <p className="text-sm text-[#8B7355] mb-6">Sign in to your account</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="chef@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>
      </form>
      <p className="text-center text-sm text-[#8B7355] mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-[#8B4513] hover:underline font-medium">Create one free</Link>
      </p>
    </div>
  )
}
