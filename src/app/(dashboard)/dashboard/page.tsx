"use client"
import { useQuery } from "@tanstack/react-query"
import { ProGate } from "@/components/layout/pro-gate"
import { PageHeader } from "@/components/shared/page-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { subDays, format, isAfter } from "date-fns"

function StatCard({ label, value, sub, icon: Icon, trend }: any) {
  return (
    <Card>
      <CardContent className="py-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#8B4513] opacity-70 mb-1">{label}</p>
            <p className="font-display text-2xl font-bold text-[#2C1810]">{value}</p>
            {sub && <p className="text-xs text-[#8B7355] mt-0.5">{sub}</p>}
          </div>
          <div className="w-10 h-10 rounded-full bg-[#D4A853]/12 flex items-center justify-center">
            <Icon size={18} className="text-[#D4A853]"/>
          </div>
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-3 text-xs ${trend >= 0 ? "text-[#4A6741]" : "text-red-600"}`}>
            {trend >= 0 ? <TrendingUp size={12}/> : <TrendingDown size={12}/>}
            {Math.abs(trend)}% vs last 30 days
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: sales = [] } = useQuery({ queryKey:["sales"], queryFn:()=>fetch("/api/sales").then(r=>r.json()) })
  const { data: deliveries = [] } = useQuery({ queryKey:["deliveries"], queryFn:()=>fetch("/api/deliveries").then(r=>r.json()) })

  const thirtyAgo = subDays(new Date(), 30)
  const recentSales = sales.filter((s: any) => isAfter(new Date(s.date), thirtyAgo))
  const recentDeliveries = deliveries.filter((d: any) => isAfter(new Date(d.date), thirtyAgo))

  const revenue = recentSales.reduce((s: number, x: any) => s + parseFloat(x.totalAmount), 0)
  const expenses = recentDeliveries.reduce((s: number, x: any) => s + parseFloat(x.totalCost), 0)
  const profit = revenue - expenses
  const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : "0"

  // Build daily chart data for last 14 days
  const chartData = Array.from({ length: 14 }, (_, i) => {
    const date = subDays(new Date(), 13 - i)
    const dayStr = format(date, "MMM d")
    const dayRevenue = sales.filter((s: any) => format(new Date(s.date), "MMM d") === dayStr).reduce((sum: number, s: any) => sum + parseFloat(s.totalAmount), 0)
    const dayExpenses = deliveries.filter((d: any) => format(new Date(d.date), "MMM d") === dayStr).reduce((sum: number, d: any) => sum + parseFloat(d.totalCost), 0)
    return { date: dayStr, Revenue: dayRevenue, Expenses: dayExpenses }
  })

  return (
    <ProGate feature="The financial dashboard">
      <div>
        <PageHeader title="Dashboard" subtitle="Last 30 days" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Revenue" value={formatCurrency(revenue)} icon={DollarSign}/>
          <StatCard label="Expenses" value={formatCurrency(expenses)} icon={ShoppingBag}/>
          <StatCard label="Net Profit" value={formatCurrency(profit)} icon={profit>=0?TrendingUp:TrendingDown}/>
          <StatCard label="Profit Margin" value={`${margin}%`} icon={TrendingUp}/>
        </div>

        <Card className="mb-6">
          <CardHeader><CardTitle>Revenue vs Expenses (14 days)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(44,24,16,0.06)"/>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#8B7355" }} tickLine={false}/>
                <YAxis tick={{ fontSize: 11, fill: "#8B7355" }} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}`}/>
                <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background:"#F5F0E8", border:"1px solid rgba(44,24,16,0.1)", borderRadius:"8px", fontSize:"12px" }}/>
                <Area type="monotone" dataKey="Revenue" stroke="#4A6741" fill="rgba(74,103,65,0.1)" strokeWidth={2}/>
                <Area type="monotone" dataKey="Expenses" stroke="#D4A853" fill="rgba(212,168,83,0.1)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader><CardTitle>Recent Sales</CardTitle></CardHeader>
            <CardContent>
              {recentSales.length === 0 ? <p className="text-sm text-[#8B7355]">No sales recorded yet</p> :
              <div className="space-y-2">
                {recentSales.slice(0,5).map((s: any) => (
                  <div key={s.id} className="flex items-center justify-between text-sm">
                    <span className="text-[#8B7355]">{format(new Date(s.date), "MMM d")}{s.notes && ` · ${s.notes.slice(0,30)}`}</span>
                    <span className="font-semibold text-[#2C1810]">{formatCurrency(s.totalAmount)}</span>
                  </div>
                ))}
              </div>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Recent Deliveries</CardTitle></CardHeader>
            <CardContent>
              {recentDeliveries.length === 0 ? <p className="text-sm text-[#8B7355]">No deliveries recorded yet</p> :
              <div className="space-y-2">
                {recentDeliveries.slice(0,5).map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between text-sm">
                    <span className="text-[#8B7355]">{format(new Date(d.date), "MMM d")}{d.supplier && ` · ${d.supplier.name}`}</span>
                    <span className="font-semibold text-red-700">{formatCurrency(d.totalCost)}</span>
                  </div>
                ))}
              </div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProGate>
  )
}
