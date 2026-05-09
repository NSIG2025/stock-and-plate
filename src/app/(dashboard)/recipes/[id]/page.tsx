"use client"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Clock, Users, Sparkles, Plus, Minus, Activity, ChevronDown, ChevronUp, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const DV = {
  calories: 2000, protein: 50, carbs: 275, fat: 78,
  fiber: 28, sugar: 50, sodium: 2300, saturatedFat: 20, cholesterol: 300, potassium: 4700,
}

function dvPct(val: number, max: number) { return Math.min(100, Math.round((val / max) * 100)) }

function scaleQty(qty: unknown, scale: number): string {
  const n = Number(qty)
  if (isNaN(n)) return String(qty ?? "")
  const v = n * scale
  if (Number.isInteger(v)) return String(v)
  return String(parseFloat(v.toFixed(2)))
}

function NutrientRow({ label, value, unit, dv, isLimit = false }: { label: string; value: number; unit: string; dv: number; isLimit?: boolean }) {
  const pct = dvPct(value, dv)
  const barColor = isLimit
    ? pct >= 100 ? "bg-red-500" : pct >= 75 ? "bg-amber-500" : "bg-emerald-500"
    : pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-[#D4A853]" : "bg-[#D4A853]/50"
  return (
    <div>
      <div className="flex items-center justify-between text-[10px] mb-1">
        <span className="text-[#E8DCC8]/70">{label}</span>
        <span className="text-[#E8DCC8]/50">{value}{unit} &nbsp;<span className={isLimit && pct >= 75 ? "text-amber-400" : "text-[#D4A853]/70"}>{pct}% DV</span></span>
      </div>
      <div className="w-full h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-300", barColor)} style={{ width: pct + "%" }} />
      </div>
    </div>
  )
}

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const [showNutrition, setShowNutrition] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { data: recipe, isLoading, error } = useQuery({
    queryKey: ["recipe", id],
    queryFn: () => fetch(`/api/recipes/${id}`).then(r => { if (!r.ok) throw new Error("Not found"); return r.json() }),
  })

  const baseServings = recipe?.servings || 4
  const [servings, setServings] = useState<number | null>(null)
  const currentServings = servings ?? baseServings
  const scale = currentServings / baseServings

  const nutrition = (() => {
    if (!recipe?.nutritionData) return null
    try { return JSON.parse(recipe.nutritionData) } catch { return null }
  })()

  const sc = nutrition ? {
    calories:     Math.round(nutrition.calories * scale),
    protein:      parseFloat((nutrition.protein * scale).toFixed(1)),
    carbs:        parseFloat((nutrition.carbs * scale).toFixed(1)),
    fat:          parseFloat((nutrition.fat * scale).toFixed(1)),
    fiber:        parseFloat((nutrition.fiber * scale).toFixed(1)),
    sugar:        parseFloat((nutrition.sugar * scale).toFixed(1)),
    sodium:       Math.round(nutrition.sodium * scale),
    saturatedFat: nutrition.saturatedFat != null ? parseFloat((nutrition.saturatedFat * scale).toFixed(1)) : null,
    cholesterol:  nutrition.cholesterol  != null ? Math.round(nutrition.cholesterol * scale)               : null,
    potassium:    nutrition.potassium    != null ? Math.round(nutrition.potassium * scale)                 : null,
  } : null

  const proteinCal = sc ? sc.protein * 4 : 0
  const carbCal    = sc ? sc.carbs * 4   : 0
  const fatCal     = sc ? sc.fat * 9     : 0
  const totalCal   = (proteinCal + carbCal + fatCal) || 1

  async function handleDelete() {
    if (!confirm("Delete this recipe?")) return
    setDeleting(true)
    try {
      await fetch(`/api/recipes/${id}`, { method: "DELETE" })
      qc.invalidateQueries({ queryKey: ["recipes"] })
      toast.success("Recipe deleted")
      router.push("/recipes")
    } catch { toast.error("Failed to delete") }
    finally { setDeleting(false) }
  }

  if (isLoading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-[#E8DCC8] rounded" />
      <div className="h-4 w-96 bg-[#E8DCC8] rounded" />
      <div className="h-64 bg-[#E8DCC8] rounded-xl" />
    </div>
  )

  if (error || !recipe) return (
    <div className="text-center py-16">
      <p className="text-[#8B7355] mb-4">Recipe not found.</p>
      <Button variant="outline" onClick={() => router.push("/recipes")}><ArrowLeft size={16} />Back to Recipes</Button>
    </div>
  )

  const instructions = recipe.notes ? recipe.notes.split("\n").filter(Boolean) : []

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.push("/recipes")} className="flex items-center gap-1.5 text-sm text-[#8B7355] hover:text-[#2C1810] transition-colors">
          <ArrowLeft size={15} />Back to Recipes
        </button>
        <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 text-sm text-[#8B7355] hover:text-red-600 transition-colors disabled:opacity-40">
          <Trash2 size={14} />{deleting ? "Deleting..." : "Delete"}
        </button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-2 flex-wrap">
          <h1 className="font-display text-3xl font-bold text-[#2C1810] flex-1">{recipe.name}</h1>
          {recipe.isAiGenerated && <Badge variant="pro"><Sparkles size={9} />AI Generated</Badge>}
        </div>
        {recipe.category && (
          <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-[#8B4513] bg-[#E8DCC8] px-2 py-0.5 rounded mb-3">
            {recipe.category}
          </span>
        )}
        {recipe.description && <p className="text-[#8B7355] leading-relaxed">{recipe.description}</p>}
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-6 text-sm text-[#8B7355] mb-6 pb-6 border-b border-[#2C1810]/8">
        {recipe.prepTime && <span className="flex items-center gap-1.5"><Clock size={14} />Prep {recipe.prepTime}m</span>}
        {recipe.cookTime && <span className="flex items-center gap-1.5"><Clock size={14} />Cook {recipe.cookTime}m</span>}
        <span className="flex items-center gap-1.5"><Users size={14} />{recipe.servings} servings (base)</span>
      </div>

      {/* Serving adjuster */}
      <div className="flex items-center gap-4 mb-8 px-4 py-3 bg-[#F5F0E8] rounded-xl border border-[#E8DCC8]">
        <Users size={16} className="text-[#8B4513]" />
        <span className="text-sm font-medium text-[#2C1810] flex-1">Adjust Servings</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setServings((s: number | null) => Math.max(1, (s ?? baseServings) - 1))}
            disabled={currentServings <= 1}
            className="w-7 h-7 rounded-full border border-[#D4A853]/60 text-[#8B4513] flex items-center justify-center hover:bg-[#D4A853]/15 transition-colors disabled:opacity-30"
          >
            <Minus size={12} />
          </button>
          <span className="w-8 text-center font-bold text-[#2C1810]">{currentServings}</span>
          <button
            onClick={() => setServings((s: number | null) => Math.min(50, (s ?? baseServings) + 1))}
            disabled={currentServings >= 50}
            className="w-7 h-7 rounded-full border border-[#D4A853]/60 text-[#8B4513] flex items-center justify-center hover:bg-[#D4A853]/15 transition-colors disabled:opacity-30"
          >
            <Plus size={12} />
          </button>
        </div>
        {scale !== 1 && (
          <span className="text-xs text-[#D4A853] font-mono">{scale > 1 ? "×" : "÷"}{scale > 1 ? scale.toFixed(2).replace(/\.?0+$/, "") : (1/scale).toFixed(2).replace(/\.?0+$/, "")} scale</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Ingredients */}
        {recipe.ingredients?.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-bold text-[#2C1810] mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ri: any, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-[#D4A853] mt-1 shrink-0">·</span>
                  <span className="text-[#2C1810]">
                    <span className="font-medium">{scaleQty(ri.quantity, scale)} {ri.unit || ri.ingredient?.unit}</span>
                    {" "}{ri.ingredient?.name || ri.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Instructions */}
        {instructions.length > 0 && (
          <div>
            <h2 className="font-display text-lg font-bold text-[#2C1810] mb-4">Instructions</h2>
            <ol className="space-y-3">
              {instructions.map((step: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#2C1810] text-[#D4A853] text-[10px] font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                  <span className="text-[#8B7355] leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* No structured content */}
        {recipe.ingredients?.length === 0 && instructions.length === 0 && (
          <div className="md:col-span-2 text-center py-8 text-[#8B7355]">
            <p className="text-sm">No ingredients or instructions stored for this recipe.</p>
            <p className="text-xs mt-1 opacity-60">Recipes saved from AI Chef include full details.</p>
          </div>
        )}
      </div>

      {/* Nutrition Panel */}
      {sc ? (
        <div className="mb-8">
          <button
            onClick={() => setShowNutrition(v => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[#2C1810] text-[#D4A853] hover:bg-[#3D2418] transition-colors"
          >
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
              <Activity size={13} />Nutrition Facts
            </span>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[10px] text-[#D4A853]/60">{sc.calories} kcal per serving</span>
              {showNutrition ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </div>
          </button>

          {showNutrition && (
            <div className="bg-[#2C1810] rounded-b-xl px-6 pt-4 pb-6 border border-t-0 border-[#8B4513]/30">
              <p className="text-[9px] font-mono text-[#E8DCC8]/25 mb-4">Per serving · {currentServings} {currentServings === 1 ? "serving" : "servings"} shown</p>

              {/* Calories */}
              <div className="border-b border-[#D4A853]/15 pb-4 mb-4">
                <div className="flex items-end gap-3 mb-2">
                  <span className="text-5xl font-bold text-[#D4A853] leading-none">{sc.calories}</span>
                  <div className="pb-1">
                    <div className="text-[9px] text-[#E8DCC8]/30 font-mono uppercase">calories</div>
                    <div className="text-[9px] text-[#D4A853]/50 font-mono">{dvPct(sc.calories, DV.calories)}% daily value</div>
                  </div>
                </div>
                <div className="w-full h-2 bg-white/8 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#D4A853] to-[#8B4513] rounded-full transition-all duration-300" style={{ width: dvPct(sc.calories, DV.calories) + "%" }} />
                </div>
              </div>

              {/* Macros */}
              <div className="mb-4">
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#D4A853]/50 mb-3">Macronutrients</p>
                <div className="flex h-5 rounded-lg overflow-hidden mb-3" style={{ gap: "1px" }}>
                  {[
                    { cal: proteinCal, color: "bg-blue-400/80" },
                    { cal: carbCal,    color: "bg-amber-400/80" },
                    { cal: fatCal,     color: "bg-orange-400/80" },
                  ].map((m, i) => (
                    <div key={i} className={cn("flex items-center justify-center transition-all duration-300", m.color)} style={{ width: (m.cal / totalCal * 100) + "%" }}>
                      {m.cal / totalCal > 0.12 && <span className="text-[8px] font-bold text-white/90">{Math.round(m.cal / totalCal * 100)}%</span>}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Protein", value: sc.protein, unit: "g", dot: "bg-blue-400",   dv: DV.protein },
                    { label: "Carbs",   value: sc.carbs,   unit: "g", dot: "bg-amber-400",  dv: DV.carbs },
                    { label: "Fat",     value: sc.fat,     unit: "g", dot: "bg-orange-400", dv: DV.fat },
                  ].map(m => (
                    <div key={m.label} className="bg-white/5 rounded-lg p-3 text-center">
                      <div className={cn("w-2 h-2 rounded-full mx-auto mb-1.5", m.dot)} />
                      <div className="text-sm font-bold text-[#E8DCC8]">{m.value}{m.unit}</div>
                      <div className="text-[9px] text-[#E8DCC8]/40">{m.label}</div>
                      <div className="text-[9px] text-[#D4A853]/60 mt-0.5">{dvPct(m.value, m.dv)}% DV</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 mb-4" />

              {/* Daily values */}
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#D4A853]/50 mb-3">Daily Values</p>
              <div className="space-y-3">
                <NutrientRow label="Fiber"       value={sc.fiber}  unit="g"  dv={DV.fiber} />
                <NutrientRow label="Sugar"        value={sc.sugar}  unit="g"  dv={DV.sugar}  isLimit />
                <NutrientRow label="Sodium"       value={sc.sodium} unit="mg" dv={DV.sodium} isLimit />
                {sc.saturatedFat != null && <NutrientRow label="Sat. Fat"    value={sc.saturatedFat} unit="g"  dv={DV.saturatedFat} isLimit />}
                {sc.cholesterol  != null && <NutrientRow label="Cholesterol" value={sc.cholesterol}  unit="mg" dv={DV.cholesterol}  isLimit />}
                {sc.potassium    != null && <NutrientRow label="Potassium"   value={sc.potassium}    unit="mg" dv={DV.potassium} />}
              </div>
              <p className="text-[8px] text-[#E8DCC8]/15 font-mono mt-4">* % DV based on a 2,000 cal diet. Values are AI estimates.</p>
            </div>
          )}
        </div>
      ) : recipe.isAiGenerated ? (
        <div className="mb-8 px-4 py-3 bg-[#F5F0E8] rounded-lg border border-[#E8DCC8] text-center">
          <p className="text-xs text-[#8B7355]">Nutrition data not available for this recipe.</p>
          <p className="text-[10px] text-[#8B7355]/60 mt-0.5">New AI suggestions include full nutrition panels.</p>
        </div>
      ) : null}
    </div>
  )
}
