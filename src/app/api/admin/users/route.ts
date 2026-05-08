import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      isAdmin: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    total: users.length,
    pro: users.filter(u => u.subscriptionTier === "PRO").length,
    free: users.filter(u => u.subscriptionTier === "FREE").length,
    pastDue: users.filter(u => u.subscriptionStatus === "PAST_DUE").length,
    newThisWeek: users.filter(u => {
      const week = new Date()
      week.setDate(week.getDate() - 7)
      return new Date(u.createdAt) > week
    }).length,
  }

  return NextResponse.json({ users, stats })
}
