import Groq from "groq-sdk"

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
export const GROQ_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"

const DIET_INSTRUCTIONS: Record<string, string> = {
  carnivore: "DIETARY FILTER — CARNIVORE: Recipes must use ONLY animal products. Permitted: meat, poultry, fish, seafood, eggs, dairy (butter, cheese, cream, milk). No plant foods of any kind — no vegetables, fruits, grains, legumes, nuts, seeds, or plant-based oils.",

  keto: "DIETARY FILTER — KETO: Recipes must be very low carbohydrate (under 20g net carbs total). Permitted: meat, fish, eggs, full-fat dairy, non-starchy vegetables (leafy greens, broccoli, cauliflower, zucchini, peppers), nuts, seeds, animal fats, butter, olive oil, coconut oil. Forbidden: grains, bread, pasta, rice, legumes, starchy vegetables (potatoes, corn), most fruits, sugar, honey, maple syrup.",

  vegan: "DIETARY FILTER — VEGAN: Recipes must contain zero animal products. No meat, poultry, fish, seafood, eggs, dairy, honey, gelatin, or any other animal-derived ingredient.",

  wfpb: "DIETARY FILTER — WHOLE FOOD PLANT BASED (WFPB): Recipes must use only whole, minimally processed plant foods. No animal products of any kind. No refined oils (not even olive oil — use water sautéing or whole food fat sources like avocado, nuts, seeds). No added sugar, no white flour, no processed foods. Focus on whole grains, legumes, vegetables, fruits, nuts, and seeds in their natural form.",

  vegetarian: "DIETARY FILTER — VEGETARIAN: Recipes must not contain meat, poultry, fish, or seafood. Eggs and dairy are permitted.",

  paleo: "DIETARY FILTER — PALEO: Recipes must follow ancestral eating principles. Permitted: meat, fish, seafood, eggs, vegetables, fruits, nuts (not peanuts), seeds, natural fats (lard, tallow, coconut oil, olive oil, avocado oil). Forbidden: all grains (wheat, oats, rice, corn), all legumes (beans, peanuts, soy), dairy, refined sugar, processed foods, seed oils (canola, vegetable, sunflower, soybean).",

  whole30: "DIETARY FILTER — WHOLE 30: Strictly follow Whole30 rules. Permitted: meat, fish, seafood, eggs, vegetables, most fruits, nuts (not peanuts or cashews), seeds, natural fats (olive oil, coconut oil, ghee, lard, tallow), black coffee, herbal tea. Absolutely forbidden: grains of any kind, legumes (including soy, peanuts), dairy (including butter — ghee only), alcohol, added sugar in any form (including honey, maple syrup, coconut sugar, agave, stevia, date sugar), carrageenan, MSG, sulfites, baked goods or treats made with compliant ingredients (no paleo pancakes, no compliant desserts).",

  heritage: `DIETARY FILTER — HERITAGE (1850–1910 PRE-INDUSTRIAL): You are cooking as a skilled homesteader or farmhouse cook between 1850 and 1910, before processed food and commercial convenience products existed. Apply ALL of the following rules strictly:

FATS & OILS: Only animal fats are permitted — lard, tallow, bacon grease, and butter. Absolutely no seed oils or vegetable oils of any kind (no canola, vegetable shortening, corn oil, sunflower, safflower, soybean, or any modern cooking oil). Olive oil is acceptable only if the pantry lists it (it existed but was rare in American households of this era).

DAIRY: Dairy is permitted but should be treated as raw or minimally processed — fresh milk, cream, butter, cultured buttermilk, farmhouse cheese, clabber. No ultra-pasteurized or highly processed dairy products.

SWEETENERS: Sugar is available but was expensive and used sparingly. Preferred sweeteners: raw honey, fruit (fresh, dried, or preserved), unsulfured molasses, and real maple syrup — used only in amounts appropriate to the era (modestly, not freely). Absolutely no refined white sugar as a primary ingredient, no powdered sugar, no corn syrup, no artificial sweeteners of any kind.

SCRATCH COOKING ONLY: Everything must be made from scratch. No store-bought bread (must be baked from grain or sourdough starter), no commercial pasta (must be hand-rolled), no canned goods unless the pantry lists home-canned items, no store-bought condiments (ketchup, mayonnaise, etc. — make from scratch or omit), no bouillon cubes or commercial stock (use bones and water).

SOURDOUGH: If a recipe calls for leavened bread, sourdough starter must be made from scratch first (wild-caught yeast). Baking soda and baking powder are acceptable (both existed in this era). Commercial yeast packets are not appropriate to this period.

PERMITTED FOODS: All meats (especially heritage breeds, organ meats, whole animal use), poultry, eggs, fresh and saltwater fish, root vegetables, seasonal vegetables, dried beans and legumes, whole grains (wheat berries, cornmeal, oats, rye), dried and fresh herbs, salt-cured and smoked meats, fermented foods (naturally fermented, not vinegar-shortcut), bone broth, rendered fats, raw dairy.

FORBIDDEN FOODS: All processed or packaged foods, seed oils, margarine, commercial bread or baked goods, canned goods (unless home-canned), refined white flour as a primary ingredient (whole grain flour preferred), commercial condiments, bouillon, instant anything, modern convenience foods.

COOKING METHODS: Cast iron, Dutch oven, open hearth or wood-fired stove, slow braising, roasting on a spit, smoking, salt-curing, natural fermentation, root cellaring. Recipes should reflect long, unhurried cooking where appropriate.

SPIRIT: These are practical, nourishing, whole-food recipes that a skilled 19th-century American homestead cook would be proud of — nothing fussy or modern, nothing that requires electricity beyond a wood-fired stove.`
}

const BASE_SYSTEM_RECIPE = "You are a professional chef and recipe developer. The user will give you a list of ingredients currently in their pantry. You MUST suggest ONLY recipes that can be made using EXCLUSIVELY the ingredients listed — do not add, assume, or substitute any ingredients not on the list. The only exceptions are water and salt (if salt is not listed, you may assume a cook has it). If a recipe would require any ingredient not on the provided list, do not suggest it. Return valid JSON with a \"recipes\" array. Each recipe must include: { name, description, servings, prepTime, cookTime, category, ingredients: [{name, quantity, unit}], instructions: [string], nutrition: { calories, protein, carbs, fat, fiber, sugar, sodium, saturatedFat, cholesterol, potassium } }. The nutrition object contains PER-SERVING estimated values: calories (kcal, number), protein (grams, number), carbs (grams, number), fat (grams, number), fiber (grams, number), sugar (grams, number), sodium (milligrams, number), saturatedFat (grams, number), cholesterol (milligrams, number), potassium (milligrams, number). Be as accurate as possible with nutrition estimates based on the ingredients and quantities used. Suggest exactly 3 recipes. Make them practical and delicious."

const SYSTEM_SHOPPING = "You are a meal planning assistant. Given recipes and current pantry, generate a consolidated shopping list with quantities needed minus what's already in pantry. Return JSON: { \"items\": [{name, quantity, unit, estimatedCost}] }. estimatedCost is a reasonable US grocery estimate in USD."

export async function suggestRecipes(pantryItems: string[], existingRecipes: string[], diet?: string) {
  if (pantryItems.length === 0) return []

  const dietInstruction = diet && DIET_INSTRUCTIONS[diet] ? "\n\n" + DIET_INSTRUCTIONS[diet] : ""
  const systemPrompt = BASE_SYSTEM_RECIPE + dietInstruction

  const dietLabel = diet && DIET_INSTRUCTIONS[diet] ? " The user follows a " + diet + " diet — apply the dietary filter rules above strictly." : ""
  const userMsg = "My pantry contains ONLY these ingredients: " + pantryItems.join(", ") + ". I already have these recipes saved (avoid duplicating them): " + (existingRecipes.join(", ") || "none") + ". Suggest 3 recipes I can make using ONLY these pantry ingredients." + dietLabel

  const chat = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMsg },
    ],
    temperature: 0.7,
    max_tokens: 3500,
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
  const userMsg = "Recipes to cook: " + JSON.stringify(recipes) + ". Current pantry inventory: " + JSON.stringify(pantryItems) + ". Generate the shopping list for what I still need to buy."

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
