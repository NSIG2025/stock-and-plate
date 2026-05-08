import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return null
  return session
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  // Prevent removing your own admin status
  if (id === session.user.id && body.isAdmin === false) {
    return NextResponse.json({ error: "Cannot remove your own admin status" }, { status: 400 })
  }

  const data: Record<string, unknown> = {}
  if (body.isAdmin !== undefined) data.isAdmin = body.isAdmin
  if (body.subscriptionTier !== undefined) {
    data.subscriptionTier = body.subscriptionTier
    data.subscriptionStatus = body.subscriptionTier === "PRO" ? "ACTIVE" : "CANCELLED"
  }

  const user = await prisma.user.update({ where: { id }, data, select: { id: true, email: true, subscriptionTier: true, isAdmin: true } })
  return NextResponse.json(user)
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { id } = await params

  if (id === session.user.id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
  }

  await prisma.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
