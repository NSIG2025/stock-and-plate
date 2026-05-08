"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Trash2, LayoutDashboard } from "lucide-react"
import { ProGate } from "@/components/layout/pro-gate"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"

const empty = { name:"", description:"", category:"", sellPrice:"", notes:"" }

export default function PlatesPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)

  const { data: plates = [], isLoading } = useQuery({ queryKey:["plates"], queryFn:()=>fetch("/api/plates").then(r=>r.json()) })
  const { data: recipes = [] } = useQuery({ queryKey:["recipes"], queryFn:()=>fetch("/api/recipes").then(r=>r.json()) })

  const add = useMutation({
    mutationFn: (body: any)=>fetch("/api/plates",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(r=>r.json()),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["plates"]}); toast.success("Plate created"); setOpen(false); setForm(empty) },
    onError: ()=>toast.error("Failed to create plate"),
  })

  const remove = useMutation({
    mutationFn: (id:string)=>fetch(`/api/plates/${id}`,{method:"DELETE"}),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["plates"]}); toast.success("Plate removed") },
  })

  return (
    <ProGate feature="Menu & Plate costing">
      <div>
        <PageHeader title="Menu & Plates" subtitle="Cost your menu items" action={<Button onClick={()=>setOpen(true)}><Plus size={16}/>New Plate</Button>}/>
        {isLoading ? <div className="h-32 bg-[#E8DCC8] rounded animate-pulse"/> :
        plates.length===0 ? (
          <div className="text-center py-16"><LayoutDashboard size={40} className="text-[#8B7355]/30 mx-auto mb-3"/><p className="text-[#8B7355]">No plates yet</p><Button className="mt-4" onClick={()=>setOpen(true)}><Plus size={16}/>Create First Plate</Button></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plates.map((plate: any) => {
              const cost = plate.components?.reduce((sum: number, c: any) => {
                if (c.recipe) return sum // simplified
                if (c.ingredient) return sum + (parseFloat(c.quantity) * parseFloat(c.ingredient.costPerUnit ?? 0))
                return sum
              }, 0) ?? 0
              const margin = plate.sellPrice && cost > 0 ? (((parseFloat(plate.sellPrice) - cost) / parseFloat(plate.sellPrice)) * 100).toFixed(0) : null
              return (
                <Card key={plate.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-display font-bold text-[#2C1810]">{plate.name}</h3>
                      <button onClick={()=>remove.mutate(plate.id)} className="p-1.5 rounded hover:bg-red-50 text-[#8B7355] hover:text-red-600 transition-colors"><Trash2 size={13}/></button>
                    </div>
                    {plate.category&&<span className="text-[10px] font-mono uppercase tracking-wider text-[#8B4513] bg-[#E8DCC8] px-1.5 py-0.5 rounded">{plate.category}</span>}
                    {plate.description&&<p className="text-xs text-[#8B7355] mt-2 line-clamp-2">{plate.description}</p>}
                    <div className="mt-3 pt-3 border-t border-[#2C1810]/8 space-y-1">
                      {plate.sellPrice&&<div className="flex justify-between text-sm"><span className="text-[#8B7355]">Sell Price</span><span className="font-semibold text-[#2C1810]">{formatCurrency(plate.sellPrice)}</span></div>}
                      {margin&&<div className="flex justify-between text-sm"><span className="text-[#8B7355]">Margin</span><span className="font-semibold text-[#4A6741]">{margin}%</span></div>}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
        <Dialog open={open} onClose={()=>setOpen(false)} title="New Menu Plate">
          <form onSubmit={e=>{e.preventDefault();add.mutate(form)}} className="space-y-3">
            <div><Label>Plate Name *</Label><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required placeholder="e.g. Pan-Seared Salmon"/></div>
            <div><Label>Description</Label><Input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Brief description"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Category</Label><Input value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="Entree"/></div>
              <div><Label>Sell Price ($)</Label><Input type="number" step="0.01" value={form.sellPrice} onChange={e=>setForm(f=>({...f,sellPrice:e.target.value}))} placeholder="24.99"/></div>
            </div>
            <Button type="submit" className="w-full" disabled={add.isPending}>{add.isPending?"Creating...":"Create Plate"}</Button>
          </form>
        </Dialog>
      </div>
    </ProGate>
  )
}
