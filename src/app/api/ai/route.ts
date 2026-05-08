import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { suggestRecipes, generateShoppingList } from "@/lib/groq"

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { action } = body

  if (action === "suggest") {
    const { diet } = body

    const pantry = await prisma.pantryItem.findMany({ where: { userId: session.user.id } })

    if (pantry.length === 0) {
      return NextResponse.json({ recipes: [], empty: true })
    }

    const recipes = await prisma.recipe.findMany({ where: { userId: session.user.id }, select: { name: true } })
    const pantryNames = pantry.map((p) => p.name + " (" + p.quantity + " " + p.unit + ")")
    const recipeNames = recipes.map((r) => r.name)
    const suggestions = await suggestRecipes(pantryNames, recipeNames, diet)
    return NextResponse.json({ recipes: suggestions })
  }

  if (action === "shopping") {
    const { recipeIds } = body
    const pantry = await prisma.pantryItem.findMany({ where: { userId: session.user.id } })
    const selectedRecipes = recipeIds?.length
      ? await prisma.recipe.findMany({ where: { id: { in: recipeIds }, userId: session.user.id }, select: { name: true, servings: true } })
      : []
    const pantryData = pantry.map((p) => ({ name: p.name, quantity: Number(p.quantity), unit: p.unit }))
    const items = await generateShoppingList(selectedRecipes, pantryData)
    return NextResponse.json({ items })
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
