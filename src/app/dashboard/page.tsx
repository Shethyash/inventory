import { getDashboardData } from '@/app/actions/dashboard'
import { DashboardClient } from '@/components/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const data = await getDashboardData()

  // Format currency
  const formattedIncome = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(data.totalIncome)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight glow-text">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Overview of your camera inventory system.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1 space-y-6">
          <div className="glass-card p-6 flex flex-col justify-center min-h-[160px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-2 z-10">Monthly Income</h3>
            <div className="text-5xl font-black text-white glow-text z-10">{formattedIncome}</div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                <span className="text-muted-foreground">Active Rentals</span>
                <span className="font-bold text-xl">{data.rentals.length}</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                <span className="text-muted-foreground">Future Orders</span>
                <span className="font-bold text-xl">{data.orders.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-3">
          <DashboardClient rentals={data.rentals} orders={data.orders} />
        </div>
      </div>
    </div>
  )
}
