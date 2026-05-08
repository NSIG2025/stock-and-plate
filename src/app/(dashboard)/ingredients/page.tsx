"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Trash2, BookOpen } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Dialog } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { AdSlot } from "@/components/layout/ad-slot"
import { formatCurrency } from "@/lib/utils"

const UNITS = ["oz","lb","kg","g","ml","L","cup","tbsp","tsp","piece","bunch","each"]
const CATEGORIES = ["Produce","Meat","Dairy","Dry Goods","Spices","Oil & Vinegar","Canned","Frozen","Other"]
const empty = { name:"",unit:"oz",costPerUnit:"",category:"",notes:"" }

export default function IngredientsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState("")

  const { data: items = [], isLoading } = useQuery({ queryKey:["ingredients"], queryFn: ()=>fetch("/api/ingredients").then(r=>r.json()) })

  const add = useMutation({
    mutationFn: (body: typeof form) => fetch("/api/ingredients",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(r=>r.json()),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["ingredients"]}); toast.success("Ingredient added"); setOpen(false); setForm(empty) },
    onError: ()=>toast.error("Failed to add ingredient"),
  })

  const remove = useMutation({
    mutationFn: (id:string)=>fetch(`/api/ingredients/${id}`,{method:"DELETE"}),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["ingredients"]}); toast.success("Ingredient removed") },
  })

  const filtered = items.filter((i:any)=>i.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <PageHeader title="Ingredients" subtitle="Unit costs for recipe costing" action={<Button onClick={()=>setOpen(true)}><Plus size={16}/>Add Ingredient</Button>} />
      <AdSlot className="mb-4"/>
      <Input placeholder="Search ingredients..." value={search} onChange={e=>setSearch(e.target.value)} className="mb-4 max-w-sm"/>
      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_,i)=><div key={i} className="h-14 bg-[#E8DCC8] rounded animate-pulse"/>)}</div>
      ) : filtered.length===0 ? (
        <div className="text-center py-16"><BookOpen size={40} className="text-[#8B7355]/30 mx-auto mb-3"/><p className="text-[#8B7355]">{search?"No ingredients match":"No ingredients yet"}</p>{!search&&<Button className="mt-4" onClick={()=>setOpen(true)}><Plus size={16}/>Add First Ingredient</Button>}</div>
      ) : (
        <div className="bg-white rounded-lg border border-[#2C1810]/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#2C1810]/8 bg-[#F5F0E8]">
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B4513] opacity-70">Name</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B4513] opacity-70">Unit</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B4513] opacity-70">Cost/Unit</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B4513] opacity-70">Category</th>
              <th className="px-4 py-3"/>
            </tr></thead>
            <tbody>{filtered.map((item:any)=>(
              <tr key={item.id} className="border-b border-[#2C1810]/5 hover:bg-[#F5F0E8]/50 transition-colors">
                <td className="px-4 py-3 font-medium text-[#2C1810]">{item.name}</td>
                <td className="px-4 py-3 text-[#8B7355]">{item.unit}</td>
                <td className="px-4 py-3 text-[#2C1810] font-semibold">{formatCurrency(item.costPerUnit)}</td>
                <td className="px-4 py-3"><span className="text-[10px] font-mono uppercase tracking-wider bg-[#E8DCC8] text-[#8B4513] px-1.5 py-0.5 rounded">{item.category||"—"}</span></td>
                <td className="px-4 py-3 text-right"><button onClick={()=>remove.mutate(item.id)} className="p-1.5 rounded hover:bg-red-50 text-[#8B7355] hover:text-red-600 transition-colors"><Trash2 size={14}/></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
      <Dialog open={open} onClose={()=>setOpen(false)} title="Add Ingredient">
        <form onSubmit={e=>{e.preventDefault();add.mutate(form)}} className="space-y-3">
          <div><Label>Name *</Label><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required placeholder="e.g. Chicken Breast"/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Unit *</Label><Select value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))}>{UNITS.map(u=><option key={u}>{u}</option>)}</Select></div>
            <div><Label>Cost Per Unit ($) *</Label><Input type="number" step="0.0001" value={form.costPerUnit} onChange={e=>setForm(f=>({...f,costPerUnit:e.target.value}))} required placeholder="0.00"/></div>
          </div>
          <div><Label>Category</Label><Select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))}><option value="">None</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</Select></div>
          <Button type="submit" className="w-full mt-2" disabled={add.isPending}>{add.isPending?"Adding...":"Add Ingredient"}</Button>
        </form>
      </Dialog>
    </div>
  )
}
