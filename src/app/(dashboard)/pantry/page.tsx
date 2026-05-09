"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Trash2, AlertTriangle, Package, Pencil } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Dialog } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { AdSlot } from "@/components/layout/ad-slot"
import { formatCurrency } from "@/lib/utils"

const UNITS = ["oz","lb","kg","g","ml","L","cup","tbsp","tsp","piece","bunch","bag","box","can","bottle","each"]
const CATEGORIES = ["Produce","Meat & Seafood","Dairy & Eggs","Pantry","Frozen","Beverages","Spices","Baking","Other"]
const LOCATIONS = ["Pantry","Refrigerator","Freezer","Cabinet","Counter","Other"]

const empty = { name:"",quantity:"",unit:"oz",category:"",location:"Pantry",minStock:"",cost:"",notes:"" }

export default function PantryPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [form, setForm] = useState(empty)
  const [search, setSearch] = useState("")

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["pantry"],
    queryFn: () => fetch("/api/pantry").then(r => r.json()),
  })

  const add = useMutation({
    mutationFn: (body: typeof form) => fetch("/api/pantry", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) }).then(r => r.json()),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["pantry"] }); toast.success("Item added"); setOpen(false); setForm(empty) },
    onError: () => toast.error("Failed to add item"),
  })

  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: any }) => fetch(`/api/pantry/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["pantry"] }); toast.success("Item updated"); setEditItem(null) },
    onError: () => toast.error("Failed to update item"),
  })

  const remove = useMutation({
    mutationFn: (id: string) => fetch(`/api/pantry/${id}`, { method:"DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey:["pantry"] }); toast.success("Item removed") },
  })

  function openEdit(item: any) {
    setEditItem(item)
    setForm({
      name: item.name,
      quantity: String(parseFloat(item.quantity)),
      unit: item.unit,
      category: item.category || "",
      location: item.location || "Pantry",
      minStock: item.minStock ? String(parseFloat(item.minStock)) : "",
      cost: item.cost ? String(parseFloat(item.cost)) : "",
      notes: item.notes || "",
    })
  }

  const filtered = items.filter((i: any) => i.name.toLowerCase().includes(search.toLowerCase()))
  const lowStock = items.filter((i: any) => i.minStock && parseFloat(i.quantity) <= parseFloat(i.minStock))

  return (
    <div>
      <PageHeader title="Pantry" subtitle={`${items.length} items tracked`} action={<Button onClick={() => { setEditItem(null); setForm(empty); setOpen(true) }}><Plus size={16} />Add Item</Button>} />

      {lowStock.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-800">{lowStock.length} item{lowStock.length > 1 ? "s" : ""} running low</p>
            <p className="text-xs text-amber-600 mt-0.5">{lowStock.map((i: any) => i.name).join(", ")}</p>
          </div>
        </div>
      )}

      <AdSlot className="mb-4" />
      <Input placeholder="Search pantry..." value={search} onChange={e => setSearch(e.target.value)} className="mb-4 max-w-sm" />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-24 bg-[#E8DCC8] rounded-lg animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="text-[#8B7355]/30 mx-auto mb-3" />
          <p className="text-[#8B7355]">{search ? "No items match your search" : "Your pantry is empty"}</p>
          {!search && <Button className="mt-4" onClick={() => { setEditItem(null); setForm(empty); setOpen(true) }}><Plus size={16} />Add First Item</Button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((item: any) => {
            const isLow = item.minStock && parseFloat(item.quantity) <= parseFloat(item.minStock)
            return (
              <Card key={item.id} className={isLow ? "border-amber-300" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#2C1810] truncate">{item.name}</p>
                      <p className="text-sm text-[#8B7355] mt-0.5">
                        {parseFloat(item.quantity)} {item.unit}
                        {item.minStock && <span className="ml-2 text-xs opacity-60">(min: {item.minStock})</span>}
                      </p>
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        {item.category && <span className="text-[10px] font-mono uppercase tracking-wider bg-[#E8DCC8] text-[#8B4513] px-1.5 py-0.5 rounded">{item.category}</span>}
                        {item.location && <span className="text-[10px] font-mono uppercase tracking-wider bg-[#E8DCC8] text-[#8B7355] px-1.5 py-0.5 rounded">{item.location}</span>}
                        {item.cost && <span className="text-[10px] text-[#8B7355]">{formatCurrency(item.cost)}</span>}
                      </div>
                    </div>
                    <div className="flex gap-0.5 ml-2 shrink-0">
                      <button
                        onClick={() => openEdit(item)}
                        className="p-1.5 rounded hover:bg-[#E8DCC8] text-[#8B7355] hover:text-[#8B4513] transition-colors"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => remove.mutate(item.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-[#8B7355] hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {isLow && <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600"><AlertTriangle size={11} />Low stock</div>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={open || !!editItem} onClose={() => { setOpen(false); setEditItem(null) }} title={editItem ? `Edit — ${editItem.name}` : "Add Pantry Item"}>
        <form
          onSubmit={e => {
            e.preventDefault()
            if (editItem) {
              update.mutate({ id: editItem.id, body: form })
            } else {
              add.mutate(form)
            }
          }}
          className="space-y-3"
        >
          <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required placeholder="e.g. All-Purpose Flour" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Quantity *</Label><Input type="number" step="0.01" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} required placeholder="5" /></div>
            <div><Label>Unit</Label><Select value={form.unit} onChange={e => setForm(f => ({...f, unit: e.target.value}))}>{UNITS.map(u => <option key={u}>{u}</option>)}</Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Category</Label><Select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}><option value="">None</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</Select></div>
            <div><Label>Location</Label><Select value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))}>{LOCATIONS.map(l => <option key={l}>{l}</option>)}</Select></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Min Stock</Label><Input type="number" step="0.01" value={form.minStock} onChange={e => setForm(f => ({...f, minStock: e.target.value}))} placeholder="Alert when below" /></div>
            <div><Label>Cost ($)</Label><Input type="number" step="0.01" value={form.cost} onChange={e => setForm(f => ({...f, cost: e.target.value}))} placeholder="0.00" /></div>
          </div>
          <Button type="submit" className="w-full mt-2" disabled={add.isPending || update.isPending}>
            {add.isPending || update.isPending ? (editItem ? "Saving..." : "Adding...") : (editItem ? "Save Changes" : "Add to Pantry")}
          </Button>
        </form>
      </Dialog>
    </div>
  )
}
