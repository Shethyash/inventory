'use client'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
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
import { createOrder, getAvailableItems } from '@/app/actions/order'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function OrderForm() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [checking, setChecking] = useState(false)

    // Form State
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [availableItems, setAvailableItems] = useState<any[]>([])
    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const [datesLocked, setDatesLocked] = useState(false)

    const handleCheckAvailability = async () => {
        if (!startDate || !endDate) {
            toast.error('Please select both start and end dates.')
            return
        }

        if (new Date(startDate) > new Date(endDate)) {
            toast.error('Start date must be before end date.')
            return
        }

        setChecking(true)
        try {
            const items = await getAvailableItems(startDate, endDate)
            setAvailableItems(items)
            setDatesLocked(true)
            toast.success(`Found ${items.length} available items!`)
        } catch (error) {
            toast.error('Failed to check availability')
        } finally {
            setChecking(false)
        }
    }

    const handleResetDates = () => {
        setDatesLocked(false)
        setAvailableItems([])
        setSelectedItems([])
        setStartDate('')
        setEndDate('')
    }

    const handleItemToggle = (item: any, checked: boolean) => {
        if (checked) {
            setSelectedItems(prev => [...prev, item])
        } else {
            setSelectedItems(prev => prev.filter(i => i.id !== item.id))
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (selectedItems.length === 0) {
            toast.error('Please select at least one item to order.')
            return
        }

        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            itemIds: selectedItems.map(i => i.id),
            customerName: formData.get('customerName') as string,
            startDate,
            endDate,
            targetRentAmount: parseFloat(formData.get('targetRentAmount') as string) || 0,
        }

        try {
            await createOrder(data)
            toast.success('Order scheduled successfully!')
            setOpen(false)
            handleResetDates()
        } catch (error: any) {
            toast.error(error.message || 'Failed to schedule order')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/80 text-white shadow-lg shadow-primary/25 rounded-full px-6 transition-all hover:scale-105">
                    <Plus className="mr-2 h-4 w-4" /> Place Order
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] glass-card border flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold glow-text">Schedule Order</DialogTitle>
                </DialogHeader>

                {!datesLocked ? (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Step 1: Select dates to check gadget availability.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date & Time</Label>
                                <Input
                                    id="startDate"
                                    type="datetime-local"
                                    className="bg-background/50 border-white/10"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date & Time</Label>
                                <Input
                                    id="endDate"
                                    type="datetime-local"
                                    className="bg-background/50 border-white/10"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleCheckAvailability}
                            disabled={checking || !startDate || !endDate}
                            className="w-full bg-secondary hover:bg-secondary/80 text-foreground border border-white/10"
                        >
                            <Search className="mr-2 h-4 w-4" />
                            {checking ? 'Searching...' : 'Check Availability'}
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="glass p-3 rounded-xl border border-primary/20 flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                                <span className="text-white block font-medium">Selected Period:</span>
                                {format(new Date(startDate), 'PP p')} <br />to {format(new Date(endDate), 'PP p')}
                            </div>
                            <Button type="button" variant="outline" size="sm" onClick={handleResetDates} className="bg-transparent border-white/10 hover:bg-white/5">
                                Change
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Select Available Gadgets</Label>
                                <div className="max-h-40 overflow-y-auto border border-white/10 rounded-md p-2 bg-background/50 space-y-1">
                                    {availableItems.length === 0 ? (
                                        <p className="p-2 text-muted-foreground text-sm">No items available for these dates.</p>
                                    ) : (
                                        availableItems.map(item => (
                                            <label key={item.id} className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded cursor-pointer transition-colors">
                                                <input
                                                    type="checkbox"
                                                    className="accent-primary w-4 h-4 rounded border-gray-300"
                                                    checked={selectedItems.some(i => i.id === item.id)}
                                                    onChange={(e) => handleItemToggle(item, e.target.checked)}
                                                />
                                                <span className="flex-1 font-medium">{item.name} <span className="text-muted-foreground text-xs">({item.category})</span></span>
                                                <span className="text-primary font-semibold text-sm">₹{item.rentAmount?.toFixed(2) || '0.00'}/day</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customerName">Customer Name</Label>
                                <Input id="customerName" name="customerName" required className="bg-background/50 border-white/10" placeholder="Jane Doe" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="targetRentAmount">Estimated Target Rent (₹)</Label>
                                <Input
                                    id="targetRentAmount"
                                    name="targetRentAmount"
                                    type="number"
                                    step="0.01"
                                    required
                                    className="bg-background/50 border-white/10"
                                    placeholder="0.00"
                                    defaultValue={selectedItems.reduce((acc, curr) => acc + (curr.rentAmount || 0), 0)}
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex flex-col gap-2">
                            <Button type="submit" disabled={loading || selectedItems.length === 0} className="bg-primary hover:bg-primary/80 rounded-full w-full h-12 text-lg font-medium shadow-lg shadow-primary/20">
                                {loading ? 'Processing...' : 'Schedule Order'}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
