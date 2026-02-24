import { getBrands } from '@/app/actions/brand'
import { BrandForm } from './BrandForm'
import { BrandList } from './BrandList'

export const dynamic = 'force-dynamic'

export default async function BrandsPage() {
    const brands = await getBrands()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <header className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight glow-text">Brands</h1>
                    <p className="text-muted-foreground">Manage equipment brands for your inventory.</p>
                </div>
                <BrandForm />
            </header>

            <div className="glass-card overflow-hidden">
                <BrandList initialBrands={brands} />
            </div>
        </div>
    )
}
