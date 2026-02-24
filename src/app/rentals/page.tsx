import { getRentals } from '@/app/actions/rental'
import { RentalForm } from './RentalForm'
import { DeleteRentalButton } from './DeleteRentalButton'
import { CompleteRentalButton } from './CompleteRentalButton'
import { getItems } from '@/app/actions/item'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function RentalsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
    // searchParams is a promise in Next 15
    const resolvedParams = await searchParams;
    const currentTab = resolvedParams.tab || 'active'

    const [rentals, items] = await Promise.all([
        getRentals(),
        getItems()
    ])

    const activeRentals = rentals.filter(r => r.status !== 'completed')
    const rentableItems = items.filter(item => item.status === 'working' || item.status === 'on rent')
    const displayedRentals = currentTab === 'completed' ? rentals.filter(r => r.status === 'completed') : activeRentals

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight glow-text">Rentals</h1>
                    <p className="text-muted-foreground">Manage ongoing and completed gadget rentals.</p>
                </div>
                <div className="flex gap-4 items-center">
                    {currentTab !== 'completed' && <RentalForm items={rentableItems} activeRentals={activeRentals} />}
                    <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                        <Link
                            href="/rentals?tab=active"
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentTab !== 'completed' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Active
                        </Link>
                        <Link
                            href="/rentals?tab=completed"
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentTab === 'completed' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Completed
                        </Link>
                    </div>
                </div>
            </header>

            <div className="grid gap-6">
                {displayedRentals.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground border border-white/10 rounded-2xl glass-card backdrop-blur-md">
                        {currentTab === 'completed' ? 'No completed rentals found.' : 'No active rentals found.'}
                    </div>
                ) : (
                    displayedRentals.map((rental: any) => {
                        const isFullyPaid = rental.amountPaid >= rental.totalPayment
                        const isReturnOverdue = new Date() > new Date(rental.endDate)

                        return (
                            <div key={rental.id} className="glass-card p-6 flex flex-col md:flex-row gap-6 justify-between overflow-hidden relative group">
                                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />

                                <div className="space-y-4 z-10 flex-1">
                                    <div>
                                        <div className="flex flex-wrap sm:flex-nowrap items-start sm:items-center justify-between gap-4 mb-2">
                                            <h3 className="text-2xl font-bold text-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                                                {rental.tenantName} - {rental.tenantMobile || 'N/A'}
                                            </h3>

                                            <div className="flex gap-2 z-20 shrink-0">
                                                {currentTab !== 'completed' && (
                                                    <RentalForm items={rentableItems} activeRentals={activeRentals} rental={rental} />
                                                )}

                                                <a
                                                    href={`/rentals/${rental.id}/invoice`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm border border-border text-foreground hover:bg-background shadow-sm hover:shadow hover:text-primary transition-all flex items-center justify-center relative group"
                                                    title="View Invoice"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                                                </a>

                                                {currentTab !== 'completed' && (
                                                    <CompleteRentalButton rentalId={rental.id} />
                                                )}

                                                <div className="ml-2 pl-2 border-l border-white/10 block"></div>

                                                <DeleteRentalButton rentalId={rental.id} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-muted-foreground">Items: <span className="text-foreground font-medium">{rental.items.map((i: any) => i.name).join(', ')}</span></p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm bg-background/30 p-3 rounded-lg border border-border">
                                        <div>
                                            <p className="text-muted-foreground mb-1">Period ({rental.days} days)</p>
                                            <div className="font-semibold text-foreground flex flex-col gap-1">
                                                <span>Pick: {new Date(rental.startDate).toLocaleString()}</span>
                                                <span>Drop: {new Date(rental.endDate).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground mb-1">Status</p>
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${isFullyPaid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                                                    {isFullyPaid ? 'Paid in Full' : `Partial Pay`}
                                                </span>
                                                {currentTab === 'completed' && (
                                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-400">
                                                        Completed
                                                    </span>
                                                )}
                                                {isReturnOverdue && currentTab !== 'completed' && (
                                                    <span className="px-2 py-0.5 rounded text-xs font-semibold bg-red-500/20 text-red-400 flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                                        Overdue
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:border-l md:border-border md:pl-6 z-10 flex flex-col gap-3 justify-center min-w-[220px]">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Rent per day:</span>
                                            <span className="font-medium">₹{rental.rentAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Discount:</span>
                                            <span className="text-red-400">-{rental.discount > 0 ? `₹${rental.discount.toFixed(2)}` : 'None'}</span>
                                        </div>

                                        <div className="border-t border-border pt-3 mt-3 flex justify-between font-bold text-xl text-foreground">
                                            <span>Total:</span>
                                            <span className="text-primary glow-text">₹{rental.totalPayment.toFixed(2)}</span>
                                        </div>

                                        <div className="flex justify-between text-sm pt-2 bg-background/50 p-2 rounded-md mt-2">
                                            <span className="text-muted-foreground">Amount Paid:</span>
                                            <span className={isFullyPaid ? 'text-emerald-400 font-bold' : 'text-orange-400 font-bold'}>
                                                ₹{rental.amountPaid.toFixed(2)}
                                            </span>
                                        </div>

                                        {!isFullyPaid && (
                                            <div className="flex justify-between text-sm pt-1 px-2">
                                                <span className="text-muted-foreground">Balance Left:</span>
                                                <span className="text-red-400 font-bold">
                                                    ₹{(rental.totalPayment - rental.amountPaid).toFixed(2)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {rental.notes && (
                                        <div className="pt-2">
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Completion Notes</p>
                                            <p className="text-sm bg-background/50 p-2 rounded border border-white/5">{rental.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
