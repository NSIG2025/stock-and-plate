import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.subscriptionTier !== "PRO") return NextResponse.json({ error: "Pro required" }, { status: 403 })
  const plates = await prisma.plate.findMany({
    where: { userId: session.user.id },
    include: { components: { include: { recipe: true, ingredient: true } } },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(plates)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (session.user.subscriptionTier !== "PRO") return NextResponse.json({ error: "Pro required" }, { status: 403 })
  const { components, ...data } = await req.json()
  const plate = await prisma.plate.create({
    data: {
      ...data,
      userId: session.user.id,
      sellPrice: data.sellPrice ? parseFloat(data.sellPrice) : null,
      components: components?.length ? {
        create: components.map((c: any) => ({
          recipeId: c.recipeId || null,
          ingredientId: c.ingredientId || null,
          quantity: parseFloat(c.quantity),
          unit: c.unit,
        })),
      } : undefined,
    },
    include: { components: { include: { recipe: true, ingredient: true } } },
  })
  return NextResponse.json(plate)
}
