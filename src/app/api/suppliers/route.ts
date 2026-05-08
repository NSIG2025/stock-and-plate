import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.subscriptionTier !== "PRO") return NextResponse.json({ error: "Pro required" }, { status: 403 })
  const suppliers = await prisma.supplier.findMany({ where: { userId: session.user.id }, orderBy: { name: "asc" } })
  return NextResponse.json(suppliers)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.subscriptionTier !== "PRO") return NextResponse.json({ error: "Pro required" }, { status: 403 })
  const body = await req.json()
  const supplier = await prisma.supplier.create({ data: { ...body, userId: session.user.id } })
  return NextResponse.json(supplier)
}
