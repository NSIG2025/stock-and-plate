"use client"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Shield, Users, Crown, TrendingUp, AlertTriangle, Trash2, ShieldCheck, ShieldOff, CrownIcon } from "lucide-react"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface User {
  id: string
  name: string | null
  email: string | null
  subscriptionTier: string
  subscriptionStatus: string
  isAdmin: boolean
  createdAt: string
}

interface Stats {
  total: number
  pro: number
  free: number
  pastDue: number
  newThisWeek: number
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-[#E8DCC8] p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[#8B7355]">{label}</p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className="font-display text-3xl font-bold text-[#2C1810]">{value}</p>
    </div>
  )
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return }
    if (status === "authenticated" && !session?.user?.isAdmin) { router.push("/pantry"); return }
    if (status === "authenticated" && session?.user?.isAdmin) fetchUsers()
  }, [status, session])

  async function fetchUsers() {
    const res = await fetch("/api/admin/users")
    const data = await res.json()
    setUsers(data.users)
    setStats(data.stats)
    setLoading(false)
  }

  async function togglePro(user: User) {
    setActionLoading(user.id + "-tier")
    const newTier = user.subscriptionTier === "PRO" ? "FREE" : "PRO"
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionTier: newTier }),
    })
    if (res.ok) {
      toast.success(`${user.email} ${newTier === "PRO" ? "upgraded to Pro" : "downgraded to Free"}`)
      fetchUsers()
    } else toast.error("Failed to update")
    setActionLoading(null)
  }

  async function toggleAdmin(user: User) {
    setActionLoading(user.id + "-admin")
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAdmin: !user.isAdmin }),
    })
    if (res.ok) {
      toast.success(`${user.email} ${!user.isAdmin ? "granted admin" : "admin removed"}`)
      fetchUsers()
    } else {
      const d = await res.json()
      toast.error(d.error || "Failed to update")
    }
    setActionLoading(null)
  }

  async function deleteUser(user: User) {
    if (!confirm(`Delete ${user.email}? This cannot be undone.`)) return
    setActionLoading(user.id + "-delete")
    const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" })
    if (res.ok) {
      toast.success(`${user.email} deleted`)
      fetchUsers()
    } else {
      const d = await res.json()
      toast.error(d.error || "Failed to delete")
    }
    setActionLoading(null)
  }

  const filtered = users.filter(u =>
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-6 h-6 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#2C1810] flex items-center justify-center">
          <Shield size={18} className="text-[#D4A853]" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-[#2C1810]">Admin</h1>
          <p className="text-xs text-[#8B7355] font-mono uppercase tracking-widest">System Management</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Users" value={stats.total} icon={Users} color="bg-[#F5F0E8] text-[#2C1810]" />
          <StatCard label="Pro" value={stats.pro} icon={Crown} color="bg-[#D4A853]/15 text-[#D4A853]" />
          <StatCard label="Free" value={stats.free} icon={Users} color="bg-[#4A6741]/10 text-[#4A6741]" />
          <StatCard label="Past Due" value={stats.pastDue} icon={AlertTriangle} color="bg-red-50 text-red-500" />
          <StatCard label="New This Week" value={stats.newThisWeek} icon={TrendingUp} color="bg-[#8B4513]/10 text-[#8B4513]" />
        </div>
      )}

      {/* User Table */}
      <div className="bg-white rounded-xl border border-[#E8DCC8] overflow-hidden">
        <div className="p-4 border-b border-[#E8DCC8] flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-semibold text-[#2C1810]">Users</h2>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-[#E8DCC8] rounded-lg px-3 py-1.5 text-sm text-[#2C1810] placeholder:text-[#8B7355]/50 focus:outline-none focus:ring-2 focus:ring-[#D4A853]/30 w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E8DCC8] bg-[#F5F0E8]/50">
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B7355]">User</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B7355]">Tier</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B7355]">Status</th>
                <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B7355]">Joined</th>
                <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B7355]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-[#E8DCC8]/50 hover:bg-[#F5F0E8]/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#2C1810] flex items-center justify-center text-[#D4A853] text-xs font-bold shrink-0">
                        {(user.name || user.email || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-[#2C1810]">{user.name || "—"}</p>
                        <p className="text-[#8B7355] text-xs">{user.email}</p>
                      </div>
                      {user.isAdmin && (
                        <span className="bg-[#2C1810] text-[#D4A853] text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded">Admin</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                      user.subscriptionTier === "PRO"
                        ? "bg-[#D4A853]/15 text-[#8B6914]"
                        : "bg-[#E8DCC8] text-[#8B7355]"
                    }`}>
                      {user.subscriptionTier === "PRO" && <Crown size={10} />}
                      {user.subscriptionTier}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      user.subscriptionStatus === "ACTIVE" ? "bg-green-50 text-green-700" :
                      user.subscriptionStatus === "PAST_DUE" ? "bg-red-50 text-red-600" :
                      user.subscriptionStatus === "TRIALING" ? "bg-blue-50 text-blue-600" :
                      "bg-[#E8DCC8] text-[#8B7355]"
                    }`}>
                      {user.subscriptionStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#8B7355] text-xs">{formatDate(new Date(user.createdAt))}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => togglePro(user)}
                        disabled={actionLoading === user.id + "-tier"}
                        title={user.subscriptionTier === "PRO" ? "Downgrade to Free" : "Upgrade to Pro"}
                        className="w-7 h-7 rounded-lg hover:bg-[#D4A853]/10 flex items-center justify-center text-[#8B7355] hover:text-[#D4A853] transition-colors disabled:opacity-40"
                      >
                        <CrownIcon size={14} />
                      </button>
                      <button
                        onClick={() => toggleAdmin(user)}
                        disabled={actionLoading === user.id + "-admin"}
                        title={user.isAdmin ? "Remove Admin" : "Grant Admin"}
                        className="w-7 h-7 rounded-lg hover:bg-[#2C1810]/10 flex items-center justify-center text-[#8B7355] hover:text-[#2C1810] transition-colors disabled:opacity-40"
                      >
                        {user.isAdmin ? <ShieldOff size={14} /> : <ShieldCheck size={14} />}
                      </button>
                      <button
                        onClick={() => deleteUser(user)}
                        disabled={actionLoading === user.id + "-delete" || user.id === session?.user?.id}
                        title="Delete user"
                        className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-[#8B7355] hover:text-red-500 transition-colors disabled:opacity-30"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-[#8B7355] text-sm">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
