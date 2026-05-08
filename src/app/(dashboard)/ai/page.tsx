"use client"
import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Sparkles, Clock, Users, ChefHat } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdSlot } from "@/components/layout/ad-slot"

export default function AIPage() {
  const qc = useQueryClient()
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState<string|null>(null)

  async function getSuggestions() {
    setLoading(true)
    try {
      const res = await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"suggest"})})
      const data = await res.json()
      if (data.recipes?.length>0) {
        setSuggestions(data.recipes)
        toast.success(`${data.recipes.length} recipes suggested!`)
      } else {
        toast.error("No suggestions generated. Make sure you have pantry items added.")
      }
    } catch { toast.error("AI Chef is unavailable right now") }
    finally { setLoading(false) }
  }

  async function saveRecipe(recipe: any) {
    setSaving(recipe.name)
    try {
      const res = await fetch("/api/recipes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        name: recipe.name,
        description: recipe.description,
        servings: recipe.servings||4,
        prepTime: recipe.prepTime||null,
        cookTime: recipe.cookTime||null,
        category: recipe.category||null,
        notes: recipe.instructions?.join("\n")||null,
        isAiGenerated: true,
      })})
      if (res.ok) {
        qc.invalidateQueries({queryKey:["recipes"]})
        toast.success(`"${recipe.name}" saved to your recipes`)
      }
    } catch { toast.error("Failed to save recipe") }
    finally { setSaving(null) }
  }

  return (
    <div>
      <PageHeader title="AI Chef" subtitle="Recipes suggested from your pantry" />
      <AdSlot className="mb-6"/>

      <div className="bg-[#2C1810] rounded-xl p-8 mb-8 text-center">
        <ChefHat size={40} className="text-[#D4A853] mx-auto mb-4"/>
        <h2 className="font-display text-2xl font-bold text-[#F5F0E8] mb-2">What Can I Cook Tonight?</h2>
        <p className="text-[#E8DCC8]/60 mb-6 max-w-md mx-auto text-sm">The AI Chef looks at your pantry and suggests 3 recipes you can make right now with what you have.</p>
        <Button variant="gold" size="lg" onClick={getSuggestions} disabled={loading}>
          <Sparkles size={18}/>{loading?"The Chef is thinking...":"Ask the AI Chef"}
        </Button>
      </div>

      {suggestions.length>0&&(
        <div>
          <h3 className="font-display text-xl font-bold text-[#2C1810] mb-4">Tonight&apos;s Suggestions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.map((recipe:any,i:number)=>(
              <Card key={i} className="relative overflow-hidden">
                <div className="absolute top-3 right-3"><Badge variant="pro"><Sparkles size={9}/>AI</Badge></div>
                <CardContent className="pt-5 pb-4">
                  <h3 className="font-display font-bold text-[#2C1810] mb-1 pr-12">{recipe.name}</h3>
                  {recipe.category&&<span className="text-[10px] font-mono uppercase tracking-wider text-[#8B4513] bg-[#E8DCC8] px-1.5 py-0.5 rounded">{recipe.category}</span>}
                  <p className="text-xs text-[#8B7355] mt-2 mb-3 line-clamp-3">{recipe.description}</p>
                  <div className="flex items-center gap-3 text-xs text-[#8B7355] mb-3">
                    {recipe.servings&&<span className="flex items-center gap-1"><Users size={11}/>{recipe.servings} servings</span>}
                    {recipe.prepTime&&<span className="flex items-center gap-1"><Clock size={11}/>Prep {recipe.prepTime}m</span>}
                    {recipe.cookTime&&<span className="flex items-center gap-1"><Clock size={11}/>Cook {recipe.cookTime}m</span>}
                  </div>
                  {recipe.ingredients?.length>0&&(
                    <div className="mb-3">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#8B4513] opacity-70 mb-1">Ingredients</p>
                      <ul className="space-y-0.5">{recipe.ingredients.slice(0,5).map((ing:any,j:number)=>(
                        <li key={j} className="text-xs text-[#8B7355]">· {ing.quantity} {ing.unit} {ing.name}</li>
                      ))}{recipe.ingredients.length>5&&<li className="text-xs text-[#8B7355] opacity-60">+{recipe.ingredients.length-5} more</li>}</ul>
                    </div>
                  )}
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={()=>saveRecipe(recipe)} disabled={saving===recipe.name}>
                    {saving===recipe.name?"Saving...":"Save to My Recipes"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
