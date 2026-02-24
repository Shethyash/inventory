'use client'

import { useState, useMemo } from 'react'
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
import { Edit2 } from 'lucide-react'

export function RentalForm({ items, activeRentals, rental }: { items: any[], activeRentals: any[], rental?: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form State
    const [selectedItems, setSelectedItems] = useState<any[]>(rental?.items || [])
    const [startDate, setStartDate] = useState(rental?.startDate ? new Date(rental.startDate).toISOString().slice(0, 16) : '')
    const [endDate, setEndDate] = useState(rental?.endDate ? new Date(rental.endDate).toISOString().slice(0, 16) : '')
    const [discount, setDiscount] = useState(rental?.discount || 0)

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

    const calculatedTotal = useMemo(() => {
        return Math.max(0, (calculatedDays * rentAmountPerDay) - discount)
    }, [calculatedDays, rentAmountPerDay, discount])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (selectedItems.length === 0) {
            toast.error('Please select at least one item to rent.')
            return
        }

        setLoading(true)
        const formData = new FormData(e.currentTarget)

        const data = {
            itemIds: selectedItems.map(i => i.id),
            tenantName: formData.get('tenantName') as string,
            tenantMobile: formData.get('tenantMobile') as string,
            idProof: formData.get('idProof') as string || undefined,
            vehicleNo: formData.get('vehicleNo') as string || undefined,
            address: formData.get('address') as string || undefined,
            images: formData.get('images') as string || undefined,
            description: formData.get('description') as string || undefined,
            paymentType: formData.get('paymentType') as string || undefined,
            startDate,
            endDate,
            rentAmount: rentAmountPerDay,
            days: calculatedDays,
            totalPayment: calculatedTotal,
            discount,
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tenantName">Tenant Name</Label>
                                <Input id="tenantName" name="tenantName" required className="bg-background/50 border-white/10" placeholder="John Doe" defaultValue={rental?.tenantName || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tenantMobile">Mobile Number</Label>
                                <Input
                                    id="tenantMobile"
                                    name="tenantMobile"
                                    type="tel"
                                    required
                                    minLength={10}
                                    maxLength={10}
                                    pattern="[0-9]{10}"
                                    title="Mobile number must be exactly 10 digits"
                                    className="bg-background/50 border-white/10"
                                    placeholder="9876543210"
                                    defaultValue={rental?.tenantMobile || ''}
                                    onInput={(e) => {
                                        const target = e.target as HTMLInputElement;
                                        target.value = target.value.replace(/[^0-9]/g, '');
                                    }}
                                />
                            </div>
                        </div>


                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="idProof">ID Proof (Optional)</Label>
                                <Input id="idProof" name="idProof" className="bg-background/50 border-white/10" placeholder="Aadhar/License" defaultValue={rental?.idProof || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="vehicleNo">Vehicle No (Optional)</Label>
                                <Input id="vehicleNo" name="vehicleNo" className="bg-background/50 border-white/10" placeholder="e.g. MH 01 AB 1234" defaultValue={rental?.vehicleNo || ''} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address (Optional)</Label>
                            <Textarea id="address" name="address" className="bg-background/50 border-white/10 resize-none min-h-[80px]" placeholder="Full residential address" defaultValue={rental?.address || ''} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="images">Images (Optional)</Label>
                            <Input id="images" name="images" className="bg-background/50 border-white/10" placeholder="Image URL(s)" defaultValue={rental?.images || ''} />
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
                                <Label htmlFor="discount">Discount (₹)</Label>
                                <Input
                                    id="discount"
                                    type="number"
                                    step="0.01"
                                    className="bg-background/50 border-white/10"
                                    value={discount || ''}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
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
                                    <SelectTrigger className="bg-background/50 border-white/10">
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
