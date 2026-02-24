import { getItems } from '@/app/actions/item'
import { prisma } from '@/lib/prisma'
import { PublicCatalogClient } from '@/components/PublicCatalogClient'

export const dynamic = 'force-dynamic'

export default async function PublicCatalogPage() {
    const items = await getItems()

    // Fetch rentals that haven't ended yet to use for availability filtering
    const activeRentals = await prisma.rental.findMany({
        where: {
            endDate: {
                gte: new Date()
            }
        },
        include: {
            items: {
                select: { id: true }
            }
        }
    })

    return <PublicCatalogClient initialItems={items} activeRentals={activeRentals} />
}
