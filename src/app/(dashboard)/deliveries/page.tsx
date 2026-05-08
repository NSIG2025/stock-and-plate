"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import { ProGate } from "@/components/layout/pro-gate"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog } from "@/components/ui/dialog"
import { formatCurrency, formatDate } from "@/lib/utils"

const empty = { supplierId:"", totalCost:"", date: new Date().toISOString().split("T")[0], notes:"", invoiceNum:"" }

export default function DeliveriesPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)

  const { data: deliveries = [], isLoading } = useQuery({ queryKey:["deliveries"], queryFn:()=>fetch("/api/deliveries").then(r=>r.json()) })
  const { data: suppliers = [] } = useQuery({ queryKey:["suppliers"], queryFn:()=>fetch("/api/suppliers").then(r=>r.json()) })

  const add = useMutation({
    mutationFn: (body: any)=>fetch("/api/deliveries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(r=>r.json()),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["deliveries"]}); toast.success("Delivery logged"); setOpen(false); setForm(empty) },
    onError: ()=>toast.error("Failed to log delivery"),
  })

  const remove = useMutation({
    mutationFn: (id:string)=>fetch(`/api/deliveries/${id}`,{method:"DELETE"}),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["deliveries"]}); toast.success("Delivery removed") },
  })

  const total = deliveries.reduce((s:number,d:any)=>s+parseFloat(d.totalCost),0)

  return (
    <ProGate feature="Delivery tracking">
      <div>
        <PageHeader title="Deliveries" subtitle={`${deliveries.length} deliveries · ${formatCurrency(total)} total spent`} action={<Button onClick={()=>setOpen(true)}><Plus size={16}/>Log Delivery</Button>}/>
        {isLoading ? <div className="h-32 bg-[#E8DCC8] rounded animate-pulse"/> :
        deliveries.length===0 ? <div className="text-center py-16"><p className="text-[#8B7355]">No deliveries logged yet</p><Button className="mt-4" onClick={()=>setOpen(true)}><Plus size={16}/>Log First Delivery</Button></div> :
        <div className="bg-white rounded-lg border border-[#2C1810]/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#2C1810]/8 bg-[#F5F0E8]">
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B4513] opacity-70">Date</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B4513] opacity-70">Supplier</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B4513] opacity-70">Invoice</th>
              <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B4513] opacity-70">Cost</th>
              <th className="px-4 py-3"/>
            </tr></thead>
            <tbody>{deliveries.map((d:any)=>(
              <tr key={d.id} className="border-b border-[#2C1810]/5 hover:bg-[#F5F0E8]/50">
                <td className="px-4 py-3 text-[#8B7355]">{formatDate(d.date)}</td>
                <td className="px-4 py-3 text-[#2C1810]">{d.supplier?.name||"—"}</td>
                <td className="px-4 py-3 text-[#8B7355]">{d.invoiceNum||"—"}</td>
                <td className="px-4 py-3 text-right font-semibold text-red-700">{formatCurrency(d.totalCost)}</td>
                <td className="px-4 py-3 text-right"><button onClick={()=>remove.mutate(d.id)} className="p-1.5 rounded hover:bg-red-50 text-[#8B7355] hover:text-red-600 transition-colors"><Trash2 size={13}/></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>}
        <Dialog open={open} onClose={()=>setOpen(false)} title="Log Delivery">
          <form onSubmit={e=>{e.preventDefault();add.mutate(form)}} className="space-y-3">
            <div><Label>Total Cost ($) *</Label><Input type="number" step="0.01" value={form.totalCost} onChange={e=>setForm(f=>({...f,totalCost:e.target.value}))} required placeholder="0.00"/></div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            {suppliers.length>0&&<div><Label>Supplier</Label><select className="flex h-9 w-full rounded border border-[#2C1810]/20 bg-white px-3 py-1 text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#D4A853]" value={form.supplierId} onChange={e=>setForm(f=>({...f,supplierId:e.target.value}))}><option value="">None</option>{suppliers.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div>}
            <div><Label>Invoice #</Label><Input value={form.invoiceNum} onChange={e=>setForm(f=>({...f,invoiceNum:e.target.value}))} placeholder="INV-001"/></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="What was delivered..."/></div>
            <Button type="submit" className="w-full" disabled={add.isPending}>{add.isPending?"Logging...":"Log Delivery"}</Button>
          </form>
        </Dialog>
      </div>
    </ProGate>
  )
}
