import { getItems } from '@/app/actions/item'
import { getCategories } from '@/app/actions/category'
import { getBrands } from '@/app/actions/brand'
import { ItemForm } from './ItemForm'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
    const items = await getItems()
    const categories = await getCategories()
    const brands = await getBrands()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight glow-text">Gadget Inventory</h1>
                    <p className="text-muted-foreground">Manage your cameras, lenses, drones, and other equipment.</p>
                </div>
                <ItemForm categories={categories} brands={brands} />
            </header>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-primary/20 text-primary-foreground">
                            <tr>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Name</th>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Brand</th>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Category</th>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Purchased</th>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Sold</th>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs text-right">Rent/Day</th>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs text-right">Paid Price</th>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {items.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="px-6 py-8 text-center flex flex-col items-center justify-center text-muted-foreground h-32">
                                        No gadgets found. Add one above.
                                    </td>
                                </tr>
                            ) : (
                                items.map(item => (
                                    <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-4 font-medium text-foreground">{item.name}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{item.brand?.name || 'No Brand'}</td>
                                        <td className="px-5 py-4 text-muted-foreground capitalize">{item.category?.name || 'Uncategorized'}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold
                        ${item.status === 'working' ? 'bg-emerald-500/20 text-emerald-400' : ''}
                        ${item.status === 'damage' ? 'bg-red-500/20 text-red-400' : ''}
                        ${item.status === 'on rent' ? 'bg-blue-500/20 text-blue-400' : ''}
                        ${item.status === 'sold out' ? 'bg-zinc-500/20 text-zinc-400' : ''}
                      `}>
                                                {item.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground">{new Date(item.purchaseDate).toLocaleDateString()}</td>
                                        <td className="px-5 py-4 text-muted-foreground">{item.soldDate ? new Date(item.soldDate).toLocaleDateString() : '-'}</td>
                                        <td className="px-5 py-4 text-right text-muted-foreground">₹{item.rentAmount.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right text-muted-foreground">₹{item.paidPrice.toFixed(2)}</td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex justify-end pr-2">
                                                <ItemForm item={item} categories={categories} brands={brands} />
                                            </div>
                                        </td>
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
