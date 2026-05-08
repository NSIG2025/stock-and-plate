import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const items = await prisma.recipe.findMany({
    where: { userId: session.user.id },
    include: { ingredients: { include: { ingredient: true } } },
    orderBy: { name: "asc" },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = await req.json()
  const { ingredients, ...recipeData } = body
  const recipe = await prisma.recipe.create({
    data: {
      ...recipeData,
      userId: session.user.id,
      servings: parseInt(recipeData.servings) || 1,
      prepTime: recipeData.prepTime ? parseInt(recipeData.prepTime) : null,
      cookTime: recipeData.cookTime ? parseInt(recipeData.cookTime) : null,
      ingredients: ingredients?.length ? {
        create: ingredients.map((i: { ingredientId: string; quantity: number; unit?: string }) => ({
          ingredientId: i.ingredientId,
          quantity: parseFloat(String(i.quantity)),
          unit: i.unit,
        })),
      } : undefined,
    },
    include: { ingredients: { include: { ingredient: true } } },
  })
  return NextResponse.json(recipe)
}
