'use client'

import { useState, useMemo, useRef } from 'react'
import { Plus, UploadCloud, X, Loader2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { createRental, updateRental } from '@/app/actions/rental'
import { toast } from 'sonner'
import { differenceInHours, parseISO } from 'date-fns'


export function RentalForm({ items, activeRentals, rental, clients = [] }: { items: any[], activeRentals: any[], rental?: any, clients: any[] }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form State
    const [selectedItems, setSelectedItems] = useState<any[]>(rental?.items || [])
    const [selectedClientId, setSelectedClientId] = useState<string>(rental?.clientId || '')
    const [startDate, setStartDate] = useState(rental?.startDate ? new Date(rental.startDate).toISOString().slice(0, 16) : '')
    const [endDate, setEndDate] = useState(rental?.endDate ? new Date(rental.endDate).toISOString().slice(0, 16) : '')
    const [discountPercentage, setDiscountPercentage] = useState(rental ? (rental.discount / ((rental.rentAmount * rental.days) || 1)) * 100 : 0)
    const [imageUrls, setImageUrls] = useState<string[]>(rental?.images ? rental.images.split(',') : [])
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return

        if (imageUrls.length + files.length > 6) {
            toast.error('You can only upload a maximum of 6 photos.')
            return
        }

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

    const selectedClientInfo = useMemo(() => {
        return clients.find(c => c.id === selectedClientId)
    }, [selectedClientId, clients])

    const availableItems = useMemo(() => {
        if (!items) return []

        return items.filter(item => {
            let isAvailable = true

            if (startDate && endDate) {
                const start = new Date(startDate)
                const end = new Date(endDate)

                if (start <= end) {
                    const overlappingRental = activeRentals?.find((r: any) => {
                        // ignore the current rental if we're editing it
                        if (rental && r.id === rental.id) return false;

                        const rStart = new Date(r.startDate)
                        const rEnd = new Date(r.endDate)
                        const overlaps = rStart <= end && rEnd >= start
                        if (!overlaps) return false

                        return r.items.some((rentedItem: any) => rentedItem.id === item.id)
                    })

                    if (overlappingRental) {
                        isAvailable = false
                    }
                }
            } else {
                // If no dates selected, only show items that are currently working
                isAvailable = item.status === 'working'
            }

            // Always include items already in this rental if editing
            if (rental && rental.items.some((i: any) => i.id === item.id)) {
                isAvailable = true
            }

            return isAvailable
        })
    }, [items, activeRentals, startDate, endDate, rental])

    // Handlers
    const handleItemToggle = (item: any, checked: boolean) => {
        if (checked) {
            setSelectedItems(prev => [...prev, item])
        } else {
            setSelectedItems(prev => prev.filter(i => i.id !== item.id))
        }
    }

    // Calculations
    const rentAmountPerDay = useMemo(() => {
        return selectedItems.reduce((sum, item) => sum + (item.rentAmount || 0), 0)
    }, [selectedItems])

    const calculatedDays = useMemo(() => {
        if (!startDate || !endDate) return 0
        const start = parseISO(startDate)
        const end = parseISO(endDate)
        const hours = differenceInHours(end, start)
        // Round to nearest day (minimum 1)
        return Math.max(1, Math.ceil(hours / 24))
    }, [startDate, endDate])

    const discountAmount = useMemo(() => {
        return (calculatedDays * rentAmountPerDay) * (discountPercentage / 100)
    }, [calculatedDays, rentAmountPerDay, discountPercentage])

    const calculatedTotal = useMemo(() => {
        return Math.max(0, (calculatedDays * rentAmountPerDay) - discountAmount)
    }, [calculatedDays, rentAmountPerDay, discountAmount])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (selectedItems.length === 0) {
            toast.error('Please select at least one item to rent.')
            return
        }
        if (!selectedClientId) {
            toast.error('Please select a client.')
            return
        }

        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const data = {
            itemIds: selectedItems.map(i => i.id),
            clientId: selectedClientId,
            images: imageUrls.length > 0 ? imageUrls.join(',') : undefined,
            description: formData.get('description') as string || undefined,
            paymentType: formData.get('paymentType') as string || undefined,
            startDate,
            endDate,
            rentAmount: rentAmountPerDay,
            days: calculatedDays,
            totalPayment: calculatedTotal,
            discount: discountAmount,
            amountPaid: parseFloat(formData.get('amountPaid') as string) || 0,
        }

        try {
            if (rental) {
                await updateRental(rental.id, data)
                toast.success('Rental updated successfully!')
            } else {
                await createRental(data)
                toast.success('Rental created successfully!')
            }
            setOpen(false)
            if (!rental) setSelectedItems([]) // Only reset on create
        } catch (error: any) {
            toast.error(error.message || 'Failed to process rental')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {rental ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm border border-border text-foreground hover:bg-background shadow-sm hover:shadow hover:text-primary transition-all">
                        <Edit2 className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button className="bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/25 rounded-full px-6 transition-all hover:scale-105">
                        <Plus className="mr-2 h-4 w-4" /> New Rental
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] glass-card border flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold glow-text">{rental ? 'Edit Rental' : 'Create Rental'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">

                        <div className="space-y-4">
                            <div className="space-y-4">
                                <Label htmlFor="clientId">Select Client</Label>
                                <Select value={selectedClientId} onValueChange={setSelectedClientId} required>
                                    <SelectTrigger className="w-full bg-background/50 border-white/10">
                                        <SelectValue placeholder="Choose an existing client" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20 max-h-[200px]">
                                        {clients.map(client => (
                                            <SelectItem key={client.id} value={client.id}>
                                                {client.name} - {client.mobile}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {selectedClientInfo && (
                                <div className="p-3 bg-white/5 border border-white/10 rounded-md text-sm text-muted-foreground flex flex-col gap-1">
                                    <p><strong className="text-foreground">Name:</strong> {selectedClientInfo.name}</p>
                                    <p><strong className="text-foreground">Mobile:</strong> {selectedClientInfo.mobile}</p>
                                    {selectedClientInfo.address && <p><strong className="text-foreground">Address:</strong> {selectedClientInfo.address}</p>}
                                </div>
                            )}
                        </div>


                        <div className="space-y-4">
                            <Label>Images (Optional)</Label>

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
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeImage(i); }}
                                                    className="bg-red-500/80 hover:bg-red-600 p-2 rounded-full text-white transition-colors"
                                                    title="Remove Image"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Textarea id="description" name="description" className="bg-background/50 border-white/10 resize-none min-h-[80px]" placeholder="Add further details about the rental..." defaultValue={rental?.description || ''} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Pick-up Date & Time</Label>
                                <Input
                                    id="startDate"
                                    type="datetime-local"
                                    required
                                    className="bg-background/50 border-white/10"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">Return Date & Time</Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    required
                                    className="bg-background/50 border-white/10"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Select Gadgets</Label>
                            <div className="max-h-40 overflow-y-auto border border-white/10 rounded-md p-2 bg-background/50 space-y-1">
                                {availableItems.length === 0 && (
                                    <p className="p-2 text-muted-foreground text-sm">No working items available</p>
                                )}
                                {availableItems.map(item => (
                                    <label key={item.id} className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors">
                                        <input
                                            type="checkbox"
                                            className="accent-primary w-4 h-4 rounded border-gray-300"
                                            checked={selectedItems.some(i => i.id === item.id)}
                                            onChange={(e) => handleItemToggle(item, e.target.checked)}
                                        />
                                        <span className="flex-1 font-medium">{item.name} <span className="text-muted-foreground text-xs">({item.category?.name || 'Uncategorized'})</span></span>
                                        <span className="text-primary font-semibold text-sm">₹{item.rentAmount?.toFixed(2) || '0.00'}/day</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Calculated Rent per Day</Label>
                                <div className="h-10 px-3 py-2 bg-background/50 border border-white/10 rounded-md text-white flex items-center">
                                    ₹{rentAmountPerDay.toFixed(2)}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="discountPercentage">Discount (%)</Label>
                                <Input
                                    id="discountPercentage"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="100"
                                    className="bg-background/50 border-white/10"
                                    value={discountPercentage || ''}
                                    onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                                />
                            </div>
                        </div>

                        <div className="glass p-4 rounded-xl border border-primary/20 space-y-2 relative overflow-hidden">
                            <div className="absolute inset-0 bg-primary/10 pointer-events-none" />
                            <div className="flex justify-between text-sm z-10 relative">
                                <span className="text-muted-foreground">Calculated Days:</span>
                                <span className="font-semibold text-white">{calculatedDays}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold z-10 relative">
                                <span className="text-white">Total Payment:</span>
                                <span className="text-primary glow-text">₹{calculatedTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="paymentType">Payment Type</Label>
                                <Select name="paymentType" defaultValue={rental?.paymentType || undefined}>
                                    <SelectTrigger className="w-full bg-background/50 border-white/10">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20">
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="online">Online</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="amountPaid">Amount Paid Now (₹)</Label>
                                <Input
                                    id="amountPaid"
                                    name="amountPaid"
                                    type="number"
                                    step="0.01"
                                    required
                                    className="bg-background/50 border-emerald-500/30 focus-visible:ring-emerald-500"
                                    placeholder="0.00"
                                    defaultValue={rental?.amountPaid !== undefined ? rental.amountPaid : calculatedTotal}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button type="submit" disabled={loading || availableItems.length === 0} className="bg-primary hover:bg-primary/80 rounded-full w-full h-12 text-lg font-medium shadow-lg shadow-primary/20">
                            {loading ? 'Processing...' : (rental ? 'Update Rental' : 'Confirm Rental')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
