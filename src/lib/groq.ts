import Groq from "groq-sdk"

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
export const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"

const SYSTEM_RECIPE = `You are a professional chef and recipe developer. Given pantry items, suggest 3 creative recipes the user can make right now. Return valid JSON with a "recipes" array. Each recipe: { name, description, servings, prepTime, cookTime, category, ingredients: [{name, quantity, unit}], instructions: [string] }. Only use the listed pantry items plus common pantry staples (salt, pepper, oil, butter, flour, eggs, basic spices). Make them practical and delicious.`

const SYSTEM_SHOPPING = `You are a meal planning assistant. Given recipes and current pantry, generate a consolidated shopping list with quantities needed minus what's already in pantry. Return JSON: { "items": [{name, quantity, unit, estimatedCost}] }. estimatedCost is a reasonable US grocery estimate in USD.`

export async function suggestRecipes(pantryItems: string[], existingRecipes: string[]) {
  const userMsg = `My pantry has: ${pantryItems.join(", ")}. I already have these recipes (avoid duplicates): ${existingRecipes.join(", ") || "none"}. Suggest 3 recipes I can make.`

  const chat = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: SYSTEM_RECIPE },
      { role: "user", content: userMsg },
    ],
    temperature: 0.8,
    max_tokens: 3000,
    response_format: { type: "json_object" },
  })

  const text = chat.choices[0].message.content ?? "{}"
  try {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed.recipes) ? parsed.recipes : Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export async function generateShoppingList(
  recipes: { name: string; servings: number }[],
  pantryItems: { name: string; quantity: number; unit: string }[]
) {
  const userMsg = `Recipes to cook: ${JSON.stringify(recipes)}. Current pantry inventory: ${JSON.stringify(pantryItems)}. Generate the shopping list for what I still need to buy.`

  const chat = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: SYSTEM_SHOPPING },
      { role: "user", content: userMsg },
    ],
    temperature: 0.3,
    max_tokens: 2000,
    response_format: { type: "json_object" },
  })

  const text = chat.choices[0].message.content ?? "{}"
  try {
    return JSON.parse(text).items ?? []
  } catch {
    return []
  }
}
