import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const items = await prisma.ingredient.findMany({ where: { userId: session.user.id }, orderBy: { name: "asc" } })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const item = await prisma.ingredient.create({
    data: { ...body, userId: session.user.id, costPerUnit: parseFloat(body.costPerUnit) },
  })
  return NextResponse.json(item)
}
