"use client"
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  Sparkles, Clock, Users, ChefHat, Package, Leaf, Flame, Wheat,
  Drumstick, FlameKindling, Crown, Plus, Minus, ChevronDown, ChevronUp, Activity,
} from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdSlot } from "@/components/layout/ad-slot"
import { cn } from "@/lib/utils"

const DIETS = [
  { id: "",           label: "No Restriction", icon: ChefHat,       color: "bg-[#E8DCC8] text-[#2C1810] border-[#D4A853]",    desc: "No dietary rules applied. The AI will suggest whatever makes the best use of your pantry." },
  { id: "carnivore",  label: "Carnivore",      icon: Drumstick,     color: "bg-red-50 text-red-800 border-red-300",            desc: "Animal products only — meat, poultry, fish, eggs, and dairy. Zero plant foods." },
  { id: "keto",       label: "Keto",           icon: Flame,         color: "bg-orange-50 text-orange-800 border-orange-300",   desc: "Very low carb, high fat. Under 20g net carbs. No grains, legumes, starchy veg, or sugar." },
  { id: "paleo",      label: "Paleo",          icon: FlameKindling, color: "bg-amber-50 text-amber-800 border-amber-300",      desc: "Ancestral eating. Meat, fish, eggs, vegetables, fruits, nuts. No grains, dairy, legumes, or processed food." },
  { id: "whole30",    label: "Whole 30",       icon: Leaf,          color: "bg-lime-50 text-lime-800 border-lime-300",         desc: "Strict 30-day reset. No grains, legumes, dairy, sugar, alcohol, or compliant baked goods — even with approved ingredients." },
  { id: "vegetarian", label: "Vegetarian",     icon: Leaf,          color: "bg-green-50 text-green-800 border-green-300",      desc: "No meat, poultry, or fish. Eggs and dairy are welcome." },
  { id: "vegan",      label: "Vegan",          icon: Leaf,          color: "bg-emerald-50 text-emerald-800 border-emerald-300",desc: "No animal products of any kind — no meat, fish, eggs, dairy, or honey." },
  { id: "wfpb",       label: "WFPB",           icon: Wheat,         color: "bg-teal-50 text-teal-800 border-teal-300",         desc: "Whole Food Plant Based. Plants only, nothing refined — no oils, no white flour, no added sugar. Whole grains, legumes, vegetables, fruit." },
  { id: "heritage",   label: "Heritage",       icon: FlameKindling, color: "bg-[#2C1810] text-[#D4A853] border-[#8B4513]",    desc: "1850–1910 · No seed oils · Animal fats only · Scratch cooking · Raw dairy · Period-appropriate sweeteners in moderation" },
]

const DV = {
  calories: 2000,
  protein: 50,
  carbs: 275,
  fat: 78,
  fiber: 28,
  sugar: 50,
  sodium: 2300,
  saturatedFat: 20,
  cholesterol: 300,
  potassium: 4700,
}

function dvPct(val: number, max: number) {
  return Math.min(100, Math.round((val / max) * 100))
}

function scaleQty(qty: unknown, scale: number): string {
  const n = Number(qty)
  if (isNaN(n)) return String(qty ?? "")
  const v = n * scale
  if (Number.isInteger(v)) return String(v)
  return String(parseFloat(v.toFixed(2)))
}

function NutrientRow({
  label, value, unit, dv, isLimit = false,
}: { label: string; value: number; unit: string; dv: number; isLimit?: boolean }) {
  const pct = dvPct(value, dv)
  const barColor = isLimit
    ? pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500"
    : pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-[#D4A853]" : "bg-[#D4A853]/50"
  const pctColor = isLimit && pct >= 75 ? "text-amber-400" : "text-[#D4A853]/70"

  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span className="text-[#E8DCC8]/70">{label}</span>
        <span className="text-[#E8DCC8]/50">
          {value}{unit}&nbsp;&nbsp;<span className={pctColor}>{pct}% DV</span>
        </span>
      </div>
      <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-300", barColor)} style={{ width: pct + "%" }} />
      </div>
    </div>
  )
}

function RecipeCard({ recipe, onSave, saving }: { recipe: any; onSave: () => void; saving: boolean }) {
  const baseServings = recipe.servings || 4
  const [servings, setServings] = useState(baseServings)
  const [showNutrition, setShowNutrition] = useState(false)
  const scale = servings / baseServings
  const n = recipe.nutrition

  const sc = n ? {
    calories:     Math.round(n.calories * scale),
    protein:      parseFloat((n.protein * scale).toFixed(1)),
    carbs:        parseFloat((n.carbs * scale).toFixed(1)),
    fat:          parseFloat((n.fat * scale).toFixed(1)),
    fiber:        parseFloat((n.fiber * scale).toFixed(1)),
    sugar:        parseFloat((n.sugar * scale).toFixed(1)),
    sodium:       Math.round(n.sodium * scale),
    saturatedFat: n.saturatedFat != null ? parseFloat((n.saturatedFat * scale).toFixed(1)) : null,
    cholesterol:  n.cholesterol  != null ? Math.round(n.cholesterol * scale)               : null,
    potassium:    n.potassium    != null ? Math.round(n.potassium * scale)                 : null,
  } : null

  const proteinCal = sc ? sc.protein * 4 : 0
  const carbCal    = sc ? sc.carbs * 4   : 0
  const fatCal     = sc ? sc.fat * 9     : 0
  const totalCal   = (proteinCal + carbCal + fatCal) || 1

  return (
    <Card className="relative overflow-hidden flex flex-col">
      <div className="absolute top-3 right-3 z-10">
        <Badge variant="pro"><Sparkles size={9} />AI</Badge>
      </div>
      <CardContent className="pt-5 pb-4 flex flex-col flex-1 gap-0">
        <h3 className="font-display font-bold text-[#2C1810] mb-1 pr-12">{recipe.name}</h3>
        {recipe.category && (
          <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-[#8B4513] bg-[#E8DCC8] px-1.5 py-0.5 rounded mb-2 w-fit">
            {recipe.category}
          </span>
        )}
        <p className="text-xs text-[#8B7355] mb-3 line-clamp-3">{recipe.description}</p>

        <div className="flex items-center gap-3 text-xs text-[#8B7355] mb-3">
          {recipe.prepTime && <span className="flex items-center gap-1"><Clock size={11} />Prep {recipe.prepTime}m</span>}
          {recipe.cookTime && <span className="flex items-center gap-1"><Clock size={11} />Cook {recipe.cookTime}m</span>}
        </div>

        {/* Serving stepper */}
        <div className="flex items-center gap-3 mb-4 px-3 py-2.5 bg-[#F5F0E8] rounded-lg border border-[#E8DCC8]">
          <Users size={13} className="text-[#8B4513]" />
          <span className="text-xs font-medium text-[#2C1810] flex-1">Servings</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setServings((s: number) => Math.max(1, s - 1))}
              disabled={servings <= 1}
              className="w-6 h-6 rounded-full border border-[#D4A853]/60 text-[#8B4513] flex items-center justify-center hover:bg-[#D4A853]/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={10} />
            </button>
            <span className="w-5 text-center text-sm font-bold text-[#2C1810]">{servings}</span>
            <button
              onClick={() => setServings((s: number) => Math.min(20, s + 1))}
              disabled={servings >= 20}
              className="w-6 h-6 rounded-full border border-[#D4A853]/60 text-[#8B4513] flex items-center justify-center hover:bg-[#D4A853]/15 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={10} />
            </button>
          </div>
        </div>

        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#8B4513] opacity-70 mb-1.5">Ingredients</p>
            <ul className="space-y-0.5">
              {recipe.ingredients.slice(0, 6).map((ing: any, j: number) => (
                <li key={j} className="text-xs text-[#8B7355] flex gap-1">
                  <span className="text-[#D4A853]/60 shrink-0">·</span>
                  <span>{scaleQty(ing.quantity, scale)} {ing.unit} {ing.name}</span>
                </li>
              ))}
              {recipe.ingredients.length > 6 && (
                <li className="text-xs text-[#8B7355] opacity-50 pl-3">+{recipe.ingredients.length - 6} more</li>
              )}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {recipe.instructions?.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#8B4513] opacity-70 mb-1.5">Instructions</p>
            <ol className="space-y-1">
              {recipe.instructions.slice(0, 3).map((step: string, j: number) => (
                <li key={j} className="text-xs text-[#8B7355] leading-relaxed">{j + 1}. {step}</li>
              ))}
              {recipe.instructions.length > 3 && (
                <li className="text-xs text-[#8B7355] opacity-50">+{recipe.instructions.length - 3} more steps</li>
              )}
            </ol>
          </div>
        )}

        {/* Nutrition toggle */}
        {sc && (
          <div className="mt-auto mb-2">
            <button
              onClick={() => setShowNutrition(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#2C1810] text-[#D4A853] hover:bg-[#3D2418] transition-colors"
            >
              <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest">
                <Activity size={11} />Nutrition Facts
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#D4A853]/60">{sc.calories} kcal</span>
                {showNutrition ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </div>
            </button>

            {showNutrition && (
              <div className="bg-[#2C1810] rounded-b-lg rounded-t-none px-4 pt-3 pb-4 border border-t-0 border-[#8B4513]/30">
                <p className="text-[9px] font-mono text-[#E8DCC8]/25 mb-3">Per serving · {servings} {servings === 1 ? "serving" : "servings"} total</p>

                {/* Calories */}
                <div className="border-b border-[#D4A853]/15 pb-3 mb-3">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-4xl font-bold text-[#D4A853] leading-none">{sc.calories}</span>
                    <div className="pb-0.5">
                      <div className="text-[9px] text-[#E8DCC8]/30 font-mono uppercase leading-tight">calories</div>
                      <div className="text-[9px] text-[#D4A853]/50 font-mono">{dvPct(sc.calories, DV.calories)}% DV</div>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#D4A853] to-[#8B4513] rounded-full transition-all duration-300"
                      style={{ width: dvPct(sc.calories, DV.calories) + "%" }}
                    />
                  </div>
                </div>

                {/* Macros */}
                <div className="mb-3">
                  <p className="text-[9px] font-mono uppercase tracking-widest text-[#D4A853]/50 mb-2">Macronutrients</p>

                  {/* Stacked calorie bar */}
                  <div className="flex h-4 rounded-lg overflow-hidden mb-2" style={{ gap: "1px" }}>
                    <div
                      className="bg-blue-400/80 flex items-center justify-center transition-all duration-300"
                      style={{ width: (proteinCal / totalCal * 100) + "%" }}
                    >
                      {proteinCal / totalCal > 0.14 && (
                        <span className="text-[8px] font-bold text-white/90">{Math.round(proteinCal / totalCal * 100)}%</span>
                      )}
                    </div>
                    <div
                      className="bg-amber-400/80 flex items-center justify-center transition-all duration-300"
                      style={{ width: (carbCal / totalCal * 100) + "%" }}
                    >
                      {carbCal / totalCal > 0.14 && (
                        <span className="text-[8px] font-bold text-white/90">{Math.round(carbCal / totalCal * 100)}%</span>
                      )}
                    </div>
                    <div
                      className="bg-orange-400/80 flex items-center justify-center transition-all duration-300"
                      style={{ width: (fatCal / totalCal * 100) + "%" }}
                    >
                      {fatCal / totalCal > 0.14 && (
                        <span className="text-[8px] font-bold text-white/90">{Math.round(fatCal / totalCal * 100)}%</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { label: "Protein", value: sc.protein, unit: "g", cal: proteinCal, dot: "bg-blue-400" },
                      { label: "Carbs",   value: sc.carbs,   unit: "g", cal: carbCal,    dot: "bg-amber-400" },
                      { label: "Fat",     value: sc.fat,     unit: "g", cal: fatCal,     dot: "bg-orange-400" },
                    ].map(m => (
                      <div key={m.label} className="bg-white/5 rounded-lg p-2 text-center">
                        <div className={cn("w-1.5 h-1.5 rounded-full mx-auto mb-1", m.dot)} />
                        <div className="text-xs font-bold text-[#E8DCC8]">{m.value}{m.unit}</div>
                        <div className="text-[9px] text-[#E8DCC8]/40">{m.label}</div>
                        <div className="text-[9px] text-[#D4A853]/60">{Math.round(m.cal / totalCal * 100)}% cal</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 mb-3" />

                {/* Daily values */}
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#D4A853]/50 mb-2">Daily Values</p>
                <div className="space-y-2.5">
                  <NutrientRow label="Fiber"       value={sc.fiber}  unit="g"  dv={DV.fiber} />
                  <NutrientRow label="Sugar"        value={sc.sugar}  unit="g"  dv={DV.sugar}  isLimit />
                  <NutrientRow label="Sodium"       value={sc.sodium} unit="mg" dv={DV.sodium} isLimit />
                  {sc.saturatedFat != null && (
                    <NutrientRow label="Sat. Fat" value={sc.saturatedFat} unit="g"  dv={DV.saturatedFat} isLimit />
                  )}
                  {sc.cholesterol != null && (
                    <NutrientRow label="Cholesterol" value={sc.cholesterol} unit="mg" dv={DV.cholesterol} isLimit />
                  )}
                  {sc.potassium != null && (
                    <NutrientRow label="Potassium" value={sc.potassium} unit="mg" dv={DV.potassium} />
                  )}
                </div>

                <p className="text-[8px] text-[#E8DCC8]/15 font-mono mt-3">* % DV based on a 2,000 cal diet. Values are AI estimates.</p>
              </div>
            )}
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save to My Recipes"}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function AIPage() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [addonLoading, setAddonLoading] = useState(false)
  const [diet, setDiet] = useState("")
  const [pantryEmpty, setPantryEmpty] = useState(false)

  const isPro = session?.user?.subscriptionTier === "PRO" || session?.user?.isAdmin === true
  const hasAiAccess = isPro || session?.user?.hasAiAddon === true

  const { data: pantryData } = useQuery({
    queryKey: ["pantry"],
    queryFn: () => fetch("/api/pantry").then(r => r.json()),
  })

  const hasPantryItems = Array.isArray(pantryData) && pantryData.length > 0

  async function activateAddon() {
    setAddonLoading(true)
    try {
      const res = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "checkout_ai" }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else toast.error("Could not start checkout")
    } catch { toast.error("Checkout failed") }
    finally { setAddonLoading(false) }
  }

  async function getSuggestions() {
    if (!hasPantryItems) { toast.error("Add some items to your pantry first"); return }
    setLoading(true)
    setPantryEmpty(false)
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "suggest", diet: diet || undefined }),
      })
      const data = await res.json()
      if (data.empty) {
        setPantryEmpty(true)
        setSuggestions([])
      } else if (data.recipes?.length > 0) {
        setSuggestions(data.recipes)
        toast.success(data.recipes.length + " recipes suggested!")
      } else {
        toast.error("No suggestions returned. Try a different dietary filter or add more pantry items.")
      }
    } catch { toast.error("AI Chef is unavailable right now") }
    finally { setLoading(false) }
  }

  async function saveRecipe(recipe: any) {
    setSaving(recipe.name)
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: recipe.name,
          description: recipe.description,
          servings: recipe.servings || 4,
          prepTime: recipe.prepTime || null,
          cookTime: recipe.cookTime || null,
          category: recipe.category || null,
          notes: recipe.instructions?.join("\n") || null,
          isAiGenerated: true,
        }),
      })
      if (res.ok) {
        qc.invalidateQueries({ queryKey: ["recipes"] })
        toast.success('"' + recipe.name + '" saved to your recipes')
      }
    } catch { toast.error("Failed to save recipe") }
    finally { setSaving(null) }
  }

  const activeDiet = DIETS.find(d => d.id === diet) ?? DIETS[0]

  return (
    <div>
      <PageHeader title="AI Chef" subtitle="Recipes built from what you actually have" />
      <AdSlot className="mb-6" />

      {/* Paywall */}
      {!hasAiAccess && (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-[#D4A853]/15 flex items-center justify-center mb-6">
            <Sparkles size={28} className="text-[#D4A853]" />
          </div>
          <h2 className="font-display text-2xl font-bold text-[#2C1810] mb-2">AI Chef</h2>
          <p className="text-[#8B7355] max-w-sm mb-2 leading-relaxed">
            AI-powered recipe suggestions built from exactly what&apos;s in your pantry — with dietary filters including Heritage, Keto, Carnivore, and more.
          </p>
          <p className="text-[#8B7355] max-w-sm mb-8 text-sm">
            Available as an add-on for free accounts, or included with <strong>Pro</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="gold" size="lg" onClick={activateAddon} disabled={addonLoading}>
              <Sparkles size={16} />
              {addonLoading ? "Redirecting..." : "Add AI Chef — $9.99/mo"}
            </Button>
            <Button variant="outline" size="lg" onClick={() => window.location.href = "/upgrade"}>
              <Crown size={16} />
              Upgrade to Pro — $29.99/mo
            </Button>
          </div>
          <p className="text-xs text-[#8B7355]/60 mt-4">Pro includes AI Chef plus the full restaurant toolkit</p>
        </div>
      )}

      {/* Main UI */}
      {hasAiAccess && (
        <>
          <div className="bg-[#2C1810] rounded-xl p-8 mb-6">
            <div className="flex flex-col items-center text-center mb-6">
              <ChefHat size={40} className="text-[#D4A853] mb-4" />
              <h2 className="font-display text-2xl font-bold text-[#F5F0E8] mb-2">What Can I Cook Tonight?</h2>
              <p className="text-[#E8DCC8]/60 max-w-md text-sm">
                The AI Chef looks at your pantry and suggests 3 recipes using <strong className="text-[#E8DCC8]/80">only what you have</strong> — no phantom ingredients.
              </p>
            </div>

            <div className="mb-6">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#D4A853]/50 text-center mb-3">Dietary Filter</p>
              <div className="flex flex-wrap justify-center gap-2">
                {DIETS.map(d => {
                  const Icon = d.icon
                  const active = diet === d.id
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDiet(d.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        active
                          ? d.id === "heritage"
                            ? "bg-[#D4A853] text-[#2C1810] border-[#D4A853] scale-105 shadow-md"
                            : d.color + " scale-105 shadow-md border-2"
                          : "bg-white/8 text-[#E8DCC8]/50 border-white/10 hover:bg-white/12 hover:text-[#E8DCC8]/80"
                      )}
                    >
                      <Icon size={11} />
                      {d.label}
                    </button>
                  )
                })}
              </div>
              {activeDiet.desc && (
                <p className="text-center text-[#D4A853]/60 text-[11px] font-mono mt-3 max-w-lg mx-auto leading-relaxed">
                  {activeDiet.desc}
                </p>
              )}
            </div>

            {!hasPantryItems && (
              <div className="flex items-center gap-2 bg-white/6 rounded-lg px-4 py-3 mb-4 max-w-sm mx-auto">
                <Package size={14} className="text-[#D4A853] shrink-0" />
                <p className="text-xs text-[#E8DCC8]/60">Add items to your pantry before asking for suggestions.</p>
              </div>
            )}

            <div className="flex justify-center">
              <Button variant="gold" size="lg" onClick={getSuggestions} disabled={loading || !hasPantryItems}>
                <Sparkles size={18} />
                {loading ? "The Chef is thinking..." : diet ? "Suggest " + activeDiet.label + " Recipes" : "Ask the AI Chef"}
              </Button>
            </div>
          </div>

          {pantryEmpty && (
            <div className="text-center py-12 text-[#8B7355]">
              <Package size={36} className="mx-auto mb-3 opacity-40" />
              <p className="font-medium">Your pantry is empty</p>
              <p className="text-sm mt-1">Add ingredients to your pantry and the AI Chef will suggest recipes you can actually make.</p>
            </div>
          )}

          {suggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-display text-xl font-bold text-[#2C1810]">Tonight&apos;s Suggestions</h3>
                {diet && (
                  <span className={cn("text-[10px] font-mono uppercase tracking-widest px-2 py-1 rounded-full border", activeDiet.color)}>
                    {activeDiet.label}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {suggestions.map((recipe: any, i: number) => (
                  <RecipeCard
                    key={i}
                    recipe={recipe}
                    onSave={() => saveRecipe(recipe)}
                    saving={saving === recipe.name}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
