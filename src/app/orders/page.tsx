import { getOrders } from '@/app/actions/order'
import { OrderForm } from './OrderForm'

export const dynamic = 'force-dynamic'

export default async function OrdersPage() {
    const orders = await getOrders()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight glow-text">Future Orders</h1>
                    <p className="text-muted-foreground">Book and manage future gadget reservations.</p>
                </div>
                <OrderForm />
            </header>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-primary/20 text-primary-foreground">
                            <tr>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Customer</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs w-[30%]">Gadgets</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Start Date & Time</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">End Date & Time</th>
                                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Target Rent (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center flex flex-col items-center justify-center text-muted-foreground h-32">
                                        No future orders scheduled.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{order.customerName}</td>
                                        <td className="px-6 py-4 text-primary font-medium">
                                            {order.items.map((i: any) => i.name).join(', ')}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{new Date(order.startDate).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{new Date(order.endDate).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-white">₹{order.targetRentAmount.toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
