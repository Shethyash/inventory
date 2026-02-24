import { getCategories } from '@/app/actions/category'
import { CategoryForm } from './CategoryForm'
import { CategoryList } from './CategoryList'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
    const categories = await getCategories()

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <header className="flex justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight glow-text">Categories</h1>
                    <p className="text-muted-foreground">Manage equipment categories for your inventory.</p>
                </div>
                <CategoryForm />
            </header>

            <div className="glass-card overflow-hidden">
                <CategoryList initialCategories={categories} />
            </div>
        </div>
    )
}
