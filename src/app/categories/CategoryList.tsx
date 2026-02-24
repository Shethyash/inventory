'use client'

import { deleteCategory } from '@/app/actions/category'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useState } from 'react'
import { CategoryForm } from './CategoryForm'

export function CategoryList({ initialCategories }: { initialCategories: any[] }) {
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete the category "${name}"?`)) return

        setDeletingId(id)
        try {
            await deleteCategory(id)
            toast.success('Category deleted')
        } catch (error) {
            toast.error('Failed to delete category (it might be in use)')
        } finally {
            setDeletingId(null)
        }
    }

    return (
        <table className="w-full text-sm text-left">
            <thead className="bg-primary/20 text-primary-foreground">
                <tr>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs">Name</th>
                    <th className="px-5 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {initialCategories.length === 0 ? (
                    <tr>
                        <td colSpan={2} className="px-6 py-8 text-center text-muted-foreground h-32">
                            No categories found. Add one above.
                        </td>
                    </tr>
                ) : (
                    initialCategories.map(cat => (
                        <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-5 py-4 font-medium text-foreground capitalize">{cat.name}</td>
                            <td className="px-5 py-4 text-right">
                                <div className="flex justify-end gap-2">
                                    <CategoryForm category={cat} />
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="hover:bg-red-500/20 text-red-400/70 hover:text-red-400 transition-colors h-8 w-8"
                                        onClick={() => handleDelete(cat.id, cat.name)}
                                        disabled={deletingId === cat.id}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    )
}
