"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 8) { toast.error("Password must be at least 8 characters"); return }
    setLoading(true)
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error ?? "Registration failed")
      setLoading(false)
      return
    }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false })
    router.push("/pantry")
  }

  return (
    <div className="px-8 py-8">
      <h2 className="font-display text-2xl font-bold text-[#2C1810] mb-1">Create your account</h2>
      <p className="text-sm text-[#8B7355] mb-6">Free forever. No credit card needed.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Your Name</Label>
          <Input id="name" placeholder="Chef's name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="chef@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Creating account..." : "Create Free Account"}
        </Button>
      </form>
      <p className="text-center text-sm text-[#8B7355] mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-[#8B4513] hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  )
}
