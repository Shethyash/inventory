import { getClients } from '@/app/actions/client'
import { ClientForm } from './ClientForm'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
    const clients = await getClients()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight glow-text">Clients</h1>
                    <p className="text-muted-foreground">Manage your customer database for rentals.</p>
                </div>
                <ClientForm />
            </header>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-primary/20 text-primary-foreground">
                            <tr>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs w-16">Edit</th>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Name</th>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Mobile</th>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Address</th>
                                <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {clients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center flex flex-col items-center justify-center text-muted-foreground h-32">
                                        No clients found. Add your first client above.
                                    </td>
                                </tr>
                            ) : (
                                clients.map(client => (
                                    <tr key={client.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-5 py-4 text-left">
                                            <ClientForm client={client} />
                                        </td>
                                        <td className="px-5 py-4 font-medium text-foreground">{client.name}</td>
                                        <td className="px-5 py-4 font-mono text-muted-foreground">{client.mobile}</td>
                                        <td className="px-5 py-4 text-muted-foreground truncate max-w-[200px]" title={client.address || ''}>
                                            {client.address || '-'}
                                        </td>
                                        <td className="px-5 py-4 text-muted-foreground truncate max-w-[150px]" title={client.reference || ''}>
                                            {client.reference || '-'}
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
