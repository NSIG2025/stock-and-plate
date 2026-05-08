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

const empty = { totalAmount:"", date: new Date().toISOString().split("T")[0], notes:"" }

export default function SalesPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)

  const { data: sales = [], isLoading } = useQuery({ queryKey:["sales"], queryFn:()=>fetch("/api/sales").then(r=>r.json()) })

  const add = useMutation({
    mutationFn: (body: any)=>fetch("/api/sales",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(r=>r.json()),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["sales"]}); toast.success("Sale recorded"); setOpen(false); setForm(empty) },
    onError: ()=>toast.error("Failed to record sale"),
  })

  const remove = useMutation({
    mutationFn: (id:string)=>fetch(`/api/sales/${id}`,{method:"DELETE"}),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["sales"]}); toast.success("Sale removed") },
  })

  const total = sales.reduce((s:number,x:any)=>s+parseFloat(x.totalAmount),0)

  return (
    <ProGate feature="Sales recording">
      <div>
        <PageHeader title="Sales" subtitle={`${sales.length} records · ${formatCurrency(total)} total`} action={<Button onClick={()=>setOpen(true)}><Plus size={16}/>Record Sale</Button>}/>
        {isLoading ? <div className="h-32 bg-[#E8DCC8] rounded animate-pulse"/> :
        sales.length===0 ? <div className="text-center py-16"><p className="text-[#8B7355]">No sales recorded yet</p><Button className="mt-4" onClick={()=>setOpen(true)}><Plus size={16}/>Record First Sale</Button></div> :
        <div className="bg-white rounded-lg border border-[#2C1810]/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-[#2C1810]/8 bg-[#F5F0E8]">
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B4513] opacity-70">Date</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B4513] opacity-70">Notes</th>
              <th className="text-right px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-[#8B4513] opacity-70">Amount</th>
              <th className="px-4 py-3"/>
            </tr></thead>
            <tbody>{sales.map((sale:any)=>(
              <tr key={sale.id} className="border-b border-[#2C1810]/5 hover:bg-[#F5F0E8]/50">
                <td className="px-4 py-3 text-[#8B7355]">{formatDate(sale.date)}</td>
                <td className="px-4 py-3 text-[#2C1810]">{sale.notes||"—"}</td>
                <td className="px-4 py-3 text-right font-semibold text-[#4A6741]">{formatCurrency(sale.totalAmount)}</td>
                <td className="px-4 py-3 text-right"><button onClick={()=>remove.mutate(sale.id)} className="p-1.5 rounded hover:bg-red-50 text-[#8B7355] hover:text-red-600 transition-colors"><Trash2 size={13}/></button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>}
        <Dialog open={open} onClose={()=>setOpen(false)} title="Record Sale">
          <form onSubmit={e=>{e.preventDefault();add.mutate(form)}} className="space-y-3">
            <div><Label>Total Amount ($) *</Label><Input type="number" step="0.01" value={form.totalAmount} onChange={e=>setForm(f=>({...f,totalAmount:e.target.value}))} required placeholder="0.00"/></div>
            <div><Label>Date</Label><Input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Lunch service, event, etc."/></div>
            <Button type="submit" className="w-full" disabled={add.isPending}>{add.isPending?"Saving...":"Record Sale"}</Button>
          </form>
        </Dialog>
      </div>
    </ProGate>
  )
}
