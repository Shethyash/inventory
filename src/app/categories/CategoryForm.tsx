'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createCategory, updateCategory } from '@/app/actions/category'
import { Edit2 } from 'lucide-react'
import { toast } from 'sonner'

export function CategoryForm({ category }: { category?: { id: string, name: string } }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string

        try {
            if (category) {
                await updateCategory(category.id, { name })
                toast.success('Category updated successfully!')
            } else {
                await createCategory({ name })
                toast.success('Category created successfully!')
            }
            setOpen(false)
        } catch (error) {
            toast.error(category ? 'Failed to update category' : 'Failed to create category')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {category ? (
                    <Button variant="ghost" size="icon" className="hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button className="bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/25 rounded-full px-6 transition-all hover:scale-105">
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card border">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold glow-text">
                        {category ? 'Edit Category' : 'New Category'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Category Name</Label>
                        <Input id="name" name="name" required defaultValue={category?.name || ""} className="bg-background/50 border-white/10" placeholder="e.g. Camera" />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="hover:bg-white/5">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/25">
                            {loading ? 'Saving...' : 'Save Category'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
