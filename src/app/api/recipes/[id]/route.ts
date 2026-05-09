import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const recipe = await prisma.recipe.findFirst({
    where: { id, userId: session.user.id },
    include: { ingredients: { include: { ingredient: true } } },
  })
  if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(recipe)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await prisma.recipe.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const { ingredients, ...recipeData } = body
  const recipe = await prisma.recipe.update({
    where: { id },
    data: {
      ...recipeData,
      servings: recipeData.servings ? parseInt(recipeData.servings) : undefined,
    },
  })
  return NextResponse.json(recipe)
}
