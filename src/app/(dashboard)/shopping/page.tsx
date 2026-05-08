"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Plus, Trash2, Check, ShoppingCart, Sparkles } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdSlot } from "@/components/layout/ad-slot"
import { formatCurrency } from "@/lib/utils"

export default function ShoppingPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [listName, setListName] = useState("Shopping List")
  const [aiLoading, setAiLoading] = useState(false)

  const { data: lists = [], isLoading } = useQuery({ queryKey:["shopping"], queryFn:()=>fetch("/api/shopping").then(r=>r.json()) })

  const create = useMutation({
    mutationFn: (body: any)=>fetch("/api/shopping",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}).then(r=>r.json()),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["shopping"]}); toast.success("List created"); setOpen(false) },
  })

  const remove = useMutation({
    mutationFn: (id:string)=>fetch(`/api/shopping/${id}`,{method:"DELETE"}),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:["shopping"]}); toast.success("List deleted") },
  })

  const toggleItem = useMutation({
    mutationFn: ({listId,itemId,isChecked}:{listId:string;itemId:string;isChecked:boolean})=>
      fetch(`/api/shopping/${listId}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemId,isChecked})}),
    onSuccess: ()=>qc.invalidateQueries({queryKey:["shopping"]}),
  })

  async function generateAI() {
    setAiLoading(true)
    try {
      const res = await fetch("/api/ai",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"shopping",recipeIds:[]})})
      const data = await res.json()
      if (data.items?.length>0) {
        await create.mutateAsync({ name:`AI Shopping List — ${new Date().toLocaleDateString()}`, items: data.items })
        toast.success("AI shopping list created!")
      } else {
        toast.error("No items generated. Add some pantry items first.")
      }
    } catch { toast.error("AI generation failed") }
    finally { setAiLoading(false) }
  }

  return (
    <div>
      <PageHeader title="Shopping Lists" action={
        <div className="flex gap-2">
          <Button variant="outline" onClick={generateAI} disabled={aiLoading}><Sparkles size={16}/>{aiLoading?"Generating...":"AI Generate"}</Button>
          <Button onClick={()=>setOpen(true)}><Plus size={16}/>New List</Button>
        </div>
      }/>
      <AdSlot className="mb-4"/>

      {isLoading ? <div className="h-32 bg-[#E8DCC8] rounded-lg animate-pulse"/> :
      lists.length===0 ? (
        <div className="text-center py-16"><ShoppingCart size={40} className="text-[#8B7355]/30 mx-auto mb-3"/><p className="text-[#8B7355]">No shopping lists yet</p><Button className="mt-4" onClick={()=>setOpen(true)}><Plus size={16}/>Create List</Button></div>
      ) : (
        <div className="space-y-4">
          {lists.map((list:any)=>{
            const total = list.items.reduce((s:number,i:any)=>s+(parseFloat(i.estimatedCost??0)),0)
            const checked = list.items.filter((i:any)=>i.isChecked).length
            return (
              <Card key={list.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{list.name}</CardTitle>
                      <p className="text-xs text-[#8B7355] mt-0.5">{checked}/{list.items.length} checked{total>0&&` · Est. ${formatCurrency(total)}`}</p>
                    </div>
                    <button onClick={()=>remove.mutate(list.id)} className="p-1.5 rounded hover:bg-red-50 text-[#8B7355] hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
                  </div>
                </CardHeader>
                <CardContent>
                  {list.items.length===0 ? <p className="text-sm text-[#8B7355]">No items</p> :
                  <ul className="space-y-1.5">
                    {list.items.map((item:any)=>(
                      <li key={item.id} className="flex items-center gap-2.5 text-sm">
                        <button
                          onClick={()=>toggleItem.mutate({listId:list.id,itemId:item.id,isChecked:!item.isChecked})}
                          className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${item.isChecked?"bg-[#4A6741] border-[#4A6741]":"border-[#2C1810]/30 hover:border-[#4A6741]"}`}
                        >
                          {item.isChecked&&<Check size={10} className="text-white"/>}
                        </button>
                        <span className={item.isChecked?"line-through text-[#8B7355]":"text-[#2C1810]"}>
                          {item.quantity} {item.unit} {item.name}
                        </span>
                        {item.estimatedCost&&<span className="ml-auto text-[#8B7355] text-xs">{formatCurrency(item.estimatedCost)}</span>}
                      </li>
                    ))}
                  </ul>}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={open} onClose={()=>setOpen(false)} title="New Shopping List">
        <form onSubmit={e=>{e.preventDefault();create.mutate({name:listName,items:[]})}} className="space-y-3">
          <div><Label>List Name</Label><Input value={listName} onChange={e=>setListName(e.target.value)} required/></div>
          <p className="text-xs text-[#8B7355]">You can add items after creating the list, or use AI Generate to auto-populate from your pantry.</p>
          <Button type="submit" className="w-full" disabled={create.isPending}>{create.isPending?"Creating...":"Create List"}</Button>
        </form>
      </Dialog>
    </div>
  )
}
