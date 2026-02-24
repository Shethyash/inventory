'use client'

import { useState, useRef } from 'react'
import { Plus, Edit2, UploadCloud, X, Loader2 } from 'lucide-react'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createItem, updateItem } from '@/app/actions/item'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'

export function ItemForm({ item, categories, brands }: { item?: any, categories?: { id: string, name: string }[], brands?: { id: string, name: string }[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [imageUrls, setImageUrls] = useState<string[]>(item?.images ? item.images.map((i: any) => i.url) : [])
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return
        setUploading(true)
        try {
            const formData = new FormData()
            Array.from(files).forEach(file => formData.append('file', file))

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) throw new Error('Upload failed')

            const data = await res.json()
            setImageUrls(prev => [...prev, ...data.urls])
            toast.success('Images uploaded successfully')
        } catch (error) {
            toast.error('Failed to upload images')
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (indexToRemove: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== indexToRemove))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        const data = {
            name: formData.get('name') as string,
            brandId: formData.get('brandId') as string || undefined,
            categoryId: formData.get('categoryId') as string || undefined,
            status: formData.get('status') as string,
            purchaseDate: formData.get('purchaseDate') as string,
            soldDate: formData.get('soldDate') as string || undefined,
            realPrice: parseFloat(formData.get('realPrice') as string),
            paidPrice: parseFloat(formData.get('paidPrice') as string),
            soldPrice: formData.get('soldPrice') ? parseFloat(formData.get('soldPrice') as string) : undefined,
            rentAmount: parseFloat(formData.get('rentAmount') as string) || 0,
            serialNo: formData.get('serialNo') as string || undefined,
            description: formData.get('description') as string || undefined,
            images: imageUrls.length > 0 ? imageUrls : undefined,
        }

        try {
            if (item) {
                await updateItem(item.id, data)
                toast.success('Gadget updated successfully!')
            } else {
                await createItem(data)
                toast.success('Gadget added successfully!')
            }
            setOpen(false)
        } catch (error) {
            toast.error(item ? 'Failed to update gadget' : 'Failed to add gadget')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {item ? (
                    <Button variant="ghost" size="icon" className="hover:bg-primary/20 text-muted-foreground hover:text-primary transition-colors h-8 w-8">
                        <Edit2 className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button className="bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/25 rounded-full px-6 transition-all hover:scale-105">
                        <Plus className="mr-2 h-4 w-4" /> Add Gadget
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card border flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold glow-text">
                        {item ? 'Edit Gadget' : 'New Gadget'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brandId">Brand</Label>
                            <Select name="brandId" required defaultValue={item?.brandId || ""}>
                                <SelectTrigger className="bg-background/50 border-white/10">
                                    <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20">
                                    {brands?.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" required className="bg-background/50 border-white/10" placeholder="e.g. A7IV" defaultValue={item?.name} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="categoryId">Category</Label>
                            <Select name="categoryId" required defaultValue={item?.categoryId || ""}>
                                <SelectTrigger className="bg-background/50 border-white/10">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20">
                                    {categories?.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select name="status" required defaultValue={item?.status || "working"}>
                                <SelectTrigger className="bg-background/50 border-white/10">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20">
                                    <SelectItem value="working">Working</SelectItem>
                                    <SelectItem value="damage">Damage</SelectItem>
                                    <SelectItem value="on rent">On Rent</SelectItem>
                                    <SelectItem value="sold out">Sold Out</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="purchaseDate">Purchase Date</Label>
                            <Input id="purchaseDate" name="purchaseDate" type="date" required className="bg-background/50 border-white/10" defaultValue={item?.purchaseDate ? new Date(item.purchaseDate).toISOString().split('T')[0] : ''} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="soldDate">Sold Date (if applicable)</Label>
                            <Input id="soldDate" name="soldDate" type="date" className="bg-background/50 border-white/10" defaultValue={item?.soldDate ? new Date(item.soldDate).toISOString().split('T')[0] : ''} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="serialNo">Serial No (Optional)</Label>
                        <Input id="serialNo" name="serialNo" className="bg-background/50 border-white/10" placeholder="e.g. S/N 123456" defaultValue={item?.serialNo || ''} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea id="description" name="description" className="bg-background/50 border-white/10" placeholder="Add further details about the item..." defaultValue={item?.description || ''} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="realPrice">Real (₹)</Label>
                            <Input id="realPrice" name="realPrice" type="number" step="0.01" required className="bg-background/50 border-white/10" defaultValue={item?.realPrice} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="paidPrice">Paid (₹)</Label>
                            <Input id="paidPrice" name="paidPrice" type="number" step="0.01" required className="bg-background/50 border-white/10" defaultValue={item?.paidPrice} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="rentAmount">Rent/Day (₹)</Label>
                            <Input id="rentAmount" name="rentAmount" type="number" step="0.01" required className="bg-background/50 border-white/10" defaultValue={item?.rentAmount} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label>Images</Label>

                        <div
                            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${uploading ? 'bg-primary/5 border-primary/30' : 'bg-background/50 border-white/20 hover:bg-white/5 hover:border-primary/50'}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault()
                                handleFileUpload(e.dataTransfer.files)
                            }}
                        >
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => handleFileUpload(e.target.files)}
                            />

                            <div className="flex flex-col items-center justify-center gap-3">
                                {uploading ? (
                                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                ) : (
                                    <UploadCloud className="h-10 w-10 text-muted-foreground" />
                                )}

                                <div>
                                    <p className="text-sm font-semibold mb-1">
                                        Drag files to upload
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-4">
                                        or click button below
                                    </p>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="bg-primary/20 hover:bg-primary/30 text-primary"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                    >
                                        Select files to upload
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {imageUrls.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-4">
                                {imageUrls.map((url, i) => (
                                    <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-black/20 group border border-white/10">
                                        <img src={url} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute top-1 right-1 bg-black/60 hover:bg-red-500/80 p-1 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/80 rounded-full w-full">
                            {loading ? 'Saving...' : (item ? 'Update Gadget' : 'Save Gadget')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
