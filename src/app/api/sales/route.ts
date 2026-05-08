import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.subscriptionTier !== "PRO") return NextResponse.json({ error: "Pro required" }, { status: 403 })
  const sales = await prisma.sale.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { plate: true } } },
    orderBy: { date: "desc" },
  })
  return NextResponse.json(sales)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.subscriptionTier !== "PRO") return NextResponse.json({ error: "Pro required" }, { status: 403 })
  const { items, ...data } = await req.json()
  const sale = await prisma.sale.create({
    data: {
      ...data,
      userId: session.user.id,
      totalAmount: parseFloat(data.totalAmount),
      date: data.date ? new Date(data.date) : new Date(),
      items: items?.length ? {
        create: items.map((i: any) => ({
          plateId: i.plateId || null,
          name: i.name,
          quantity: parseInt(i.quantity) || 1,
          price: parseFloat(i.price),
        })),
      } : undefined,
    },
    include: { items: true },
  })
  return NextResponse.json(sale)
}
