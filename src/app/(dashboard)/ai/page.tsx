"use client"
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Sparkles, Clock, Users, ChefHat, Package, Leaf, Flame, Wheat, Drumstick, FlameKindling, Crown } from "lucide-react"
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

      {/* Paywall for free users without add-on */}
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

      {/* Main AI Chef UI — accessible users only */}
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

            {/* Dietary filter */}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suggestions.map((recipe: any, i: number) => (
                  <Card key={i} className="relative overflow-hidden">
                    <div className="absolute top-3 right-3"><Badge variant="pro"><Sparkles size={9} />AI</Badge></div>
                    <CardContent className="pt-5 pb-4">
                      <h3 className="font-display font-bold text-[#2C1810] mb-1 pr-12">{recipe.name}</h3>
                      {recipe.category && (
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B4513] bg-[#E8DCC8] px-1.5 py-0.5 rounded">
                          {recipe.category}
                        </span>
                      )}
                      <p className="text-xs text-[#8B7355] mt-2 mb-3 line-clamp-3">{recipe.description}</p>
                      <div className="flex items-center gap-3 text-xs text-[#8B7355] mb-3">
                        {recipe.servings && <span className="flex items-center gap-1"><Users size={11} />{recipe.servings} servings</span>}
                        {recipe.prepTime && <span className="flex items-center gap-1"><Clock size={11} />Prep {recipe.prepTime}m</span>}
                        {recipe.cookTime && <span className="flex items-center gap-1"><Clock size={11} />Cook {recipe.cookTime}m</span>}
                      </div>
                      {recipe.ingredients?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-[#8B4513] opacity-70 mb-1">Ingredients</p>
                          <ul className="space-y-0.5">
                            {recipe.ingredients.slice(0, 5).map((ing: any, j: number) => (
                              <li key={j} className="text-xs text-[#8B7355]">· {ing.quantity} {ing.unit} {ing.name}</li>
                            ))}
                            {recipe.ingredients.length > 5 && (
                              <li className="text-xs text-[#8B7355] opacity-60">+{recipe.ingredients.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      {recipe.instructions?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-[#8B4513] opacity-70 mb-1">Instructions</p>
                          <ol className="space-y-1">
                            {recipe.instructions.slice(0, 3).map((step: string, j: number) => (
                              <li key={j} className="text-xs text-[#8B7355]">{j + 1}. {step}</li>
                            ))}
                            {recipe.instructions.length > 3 && (
                              <li className="text-xs text-[#8B7355] opacity-60">+{recipe.instructions.length - 3} more steps</li>
                            )}
                          </ol>
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => saveRecipe(recipe)}
                        disabled={saving === recipe.name}
                      >
                        {saving === recipe.name ? "Saving..." : "Save to My Recipes"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
