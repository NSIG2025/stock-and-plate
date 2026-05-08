import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const lists = await prisma.shoppingList.findMany({
    where: { userId: session.user.id },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json(lists)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name, items } = await req.json()
  const list = await prisma.shoppingList.create({
    data: {
      name,
      userId: session.user.id,
      items: items?.length ? {
        create: items.map((i: { name: string; quantity: number; unit: string; estimatedCost?: number }) => ({
          name: i.name,
          quantity: parseFloat(String(i.quantity)),
          unit: i.unit,
          estimatedCost: i.estimatedCost ?? null,
        })),
      } : undefined,
    },
    include: { items: true },
  })
  return NextResponse.json(list)
}
