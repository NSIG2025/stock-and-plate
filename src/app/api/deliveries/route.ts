import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.subscriptionTier !== "PRO") return NextResponse.json({ error: "Pro required" }, { status: 403 })
  const deliveries = await prisma.delivery.findMany({
    where: { userId: session.user.id },
    include: { supplier: true, items: true },
    orderBy: { date: "desc" },
  })
  return NextResponse.json(deliveries)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.subscriptionTier !== "PRO") return NextResponse.json({ error: "Pro required" }, { status: 403 })
  const { items, ...data } = await req.json()
  const delivery = await prisma.delivery.create({
    data: {
      ...data,
      userId: session.user.id,
      totalCost: parseFloat(data.totalCost),
      date: data.date ? new Date(data.date) : new Date(),
      items: items?.length ? {
        create: items.map((i: any) => ({
          name: i.name,
          quantity: parseFloat(i.quantity),
          unit: i.unit,
          unitCost: parseFloat(i.unitCost),
          totalCost: parseFloat(i.totalCost),
        })),
      } : undefined,
    },
    include: { items: true, supplier: true },
  })
  return NextResponse.json(delivery)
}
