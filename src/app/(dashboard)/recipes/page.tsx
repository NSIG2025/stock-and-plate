"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Trash2, Clock, Users, UtensilsCrossed, Sparkles } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdSlot } from "@/components/layout/ad-slot"
import { formatCurrency, calcRecipeCost } from "@/lib/utils"

const CATEGORIES = ["Breakfast","Lunch","Dinner","Appetizer","Side","Dessert","Snack","Beverage","Other"]
const empty = { name:"",description:"",servings:"4",prepTime:"",cookTime:"",category:"",notes:"" }

export default function RecipesPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState("")
  const [addIngOpen, setAddIngOpen] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null)
  const [ingForm, setIngForm] = useState({ ingredientId:"",quantity:"",unit:"" })

  const { data: recipes = [], isLoading } = useQuery({ queryKey:["recipes"], queryFn:()=>fetch("/api/recipes").then(r=>r.json()) })
  const { data: ingredients = [] } = useQuery({ queryKey:["ingredients"], queryFn:()=>fetch("/api/ingredients").then(r=>r.json()) })

  const add = useMutation({
    mutationFn: (body: any) => fetch("/api/recipes",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(r=>r.json()),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["recipes"]}); toast.success("Recipe created"); setOpen(false); setForm(empty) },
    onError: ()=>toast.error("Failed to create recipe"),
  })

  const remove = useMutation({
    mutationFn: (id:string)=>fetch(`/api/recipes/${id}`,{method:"DELETE"}),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["recipes"]}); toast.success("Recipe deleted") },
  })

  const filtered = recipes.filter((r:any)=>r.name.toLowerCase().includes(search.toLowerCase()))

  function recipeCost(recipe: any) {
    const ings = recipe.ingredients?.map((ri: any) => ({
      quantity: parseFloat(ri.quantity),
      costPerUnit: parseFloat(ri.ingredient?.costPerUnit ?? 0),
    })) ?? []
    return calcRecipeCost(ings)
  }

  return (
    <div>
      <PageHeader title="Recipes" subtitle={`${recipes.length} recipes`} action={<Button onClick={()=>setOpen(true)}><Plus size={16}/>New Recipe</Button>} />
      <AdSlot className="mb-4"/>
      <Input placeholder="Search recipes..." value={search} onChange={e=>setSearch(e.target.value)} className="mb-4 max-w-sm"/>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(4)].map((_,i)=><div key={i} className="h-40 bg-[#E8DCC8] rounded-lg animate-pulse"/>)}</div>
      ) : filtered.length===0 ? (
        <div className="text-center py-16"><UtensilsCrossed size={40} className="text-[#8B7355]/30 mx-auto mb-3"/><p className="text-[#8B7355]">{search?"No recipes match":"No recipes yet"}</p>{!search&&<Button className="mt-4" onClick={()=>setOpen(true)}><Plus size={16}/>Create First Recipe</Button>}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((recipe:any)=>{
            const cost = recipeCost(recipe)
            return (
              <Card key={recipe.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-[#2C1810] truncate">{recipe.name}</h3>
                      {recipe.category&&<span className="text-[10px] font-mono uppercase tracking-wider text-[#8B4513] bg-[#E8DCC8] px-1.5 py-0.5 rounded">{recipe.category}</span>}
                    </div>
                    <div className="flex gap-1 ml-2">
                      {recipe.isAiGenerated&&<Badge variant="pro"><Sparkles size={9}/>AI</Badge>}
                      <button onClick={()=>remove.mutate(recipe.id)} className="p-1.5 rounded hover:bg-red-50 text-[#8B7355] hover:text-red-600 transition-colors"><Trash2 size={13}/></button>
                    </div>
                  </div>
                  {recipe.description&&<p className="text-xs text-[#8B7355] mb-3 line-clamp-2">{recipe.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-[#8B7355] mb-3">
                    <span className="flex items-center gap-1"><Users size={11}/>{recipe.servings} servings</span>
                    {recipe.prepTime&&<span className="flex items-center gap-1"><Clock size={11}/>Prep {recipe.prepTime}m</span>}
                    {recipe.cookTime&&<span className="flex items-center gap-1"><Clock size={11}/>Cook {recipe.cookTime}m</span>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#2C1810]/8">
                    <span className="text-xs text-[#8B7355]">{recipe.ingredients?.length??0} ingredient{recipe.ingredients?.length!==1?"s":""}</span>
                    {cost>0&&<span className="text-sm font-semibold text-[#2C1810]">{formatCurrency(cost)} total</span>}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={open} onClose={()=>setOpen(false)} title="New Recipe">
        <form onSubmit={e=>{e.preventDefault();add.mutate(form)}} className="space-y-3">
          <div><Label>Recipe Name *</Label><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required placeholder="e.g. Roast Chicken"/></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="What makes this recipe special..."/></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Servings</Label><Input type="number" value={form.servings} onChange={e=>setForm(f=>({...f,servings:e.target.value}))} min="1"/></div>
            <div><Label>Prep (min)</Label><Input type="number" value={form.prepTime} onChange={e=>setForm(f=>({...f,prepTime:e.target.value}))} placeholder="30"/></div>
            <div><Label>Cook (min)</Label><Input type="number" value={form.cookTime} onChange={e=>setForm(f=>({...f,cookTime:e.target.value}))} placeholder="45"/></div>
          </div>
          <div><Label>Category</Label><Select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}><option value="">None</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</Select></div>
          <Button type="submit" className="w-full mt-2" disabled={add.isPending}>{add.isPending?"Creating...":"Create Recipe"}</Button>
        </form>
      </Dialog>
    </div>
  )
}
