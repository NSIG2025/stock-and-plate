"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Trash2, Users } from "lucide-react"
import { ProGate } from "@/components/layout/pro-gate"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"

const empty = { name:"", contactName:"", email:"", phone:"", address:"", notes:"" }

export default function SuppliersPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)

  const { data: suppliers = [], isLoading } = useQuery({ queryKey:["suppliers"], queryFn:()=>fetch("/api/suppliers").then(r=>r.json()) })

  const add = useMutation({
    mutationFn: (body: any)=>fetch("/api/suppliers",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(r=>r.json()),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["suppliers"]}); toast.success("Supplier added"); setOpen(false); setForm(empty) },
    onError: ()=>toast.error("Failed to add supplier"),
  })

  const remove = useMutation({
    mutationFn: (id:string)=>fetch(`/api/suppliers/${id}`,{method:"DELETE"}),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["suppliers"]}); toast.success("Supplier removed") },
  })

  return (
    <ProGate feature="Supplier management">
      <div>
        <PageHeader title="Suppliers" subtitle={`${suppliers.length} suppliers`} action={<Button onClick={()=>setOpen(true)}><Plus size={16}/>Add Supplier</Button>}/>
        {isLoading ? <div className="h-32 bg-[#E8DCC8] rounded animate-pulse"/> :
        suppliers.length===0 ? (
          <div className="text-center py-16"><Users size={40} className="text-[#8B7355]/30 mx-auto mb-3"/><p className="text-[#8B7355]">No suppliers yet</p><Button className="mt-4" onClick={()=>setOpen(true)}><Plus size={16}/>Add First Supplier</Button></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suppliers.map((s:any)=>(
              <Card key={s.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold text-[#2C1810] truncate">{s.name}</h3>
                      {s.contactName&&<p className="text-sm text-[#8B7355]">{s.contactName}</p>}
                      {s.email&&<p className="text-xs text-[#8B4513] mt-1">{s.email}</p>}
                      {s.phone&&<p className="text-xs text-[#8B7355]">{s.phone}</p>}
                    </div>
                    <button onClick={()=>remove.mutate(s.id)} className="p-1.5 rounded hover:bg-red-50 text-[#8B7355] hover:text-red-600 transition-colors shrink-0 ml-2"><Trash2 size={13}/></button>
                  </div>
                  {s.notes&&<p className="text-xs text-[#8B7355] mt-2 line-clamp-2 border-t border-[#2C1810]/8 pt-2">{s.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Dialog open={open} onClose={()=>setOpen(false)} title="Add Supplier">
          <form onSubmit={e=>{e.preventDefault();add.mutate(form)}} className="space-y-3">
            <div><Label>Company Name *</Label><Input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required placeholder="e.g. Fresh Farms Co."/></div>
            <div><Label>Contact Name</Label><Input value={form.contactName} onChange={e=>setForm(f=>({...f,contactName:e.target.value}))} placeholder="John Smith"/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="orders@supplier.com"/></div>
              <div><Label>Phone</Label><Input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="(555) 000-0000"/></div>
            </div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Payment terms, delivery schedule..."/></div>
            <Button type="submit" className="w-full" disabled={add.isPending}>{add.isPending?"Adding...":"Add Supplier"}</Button>
          </form>
        </Dialog>
      </div>
    </ProGate>
  )
}
