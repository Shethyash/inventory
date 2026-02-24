'use client'

import { useState } from 'react'
import { completeRental } from '@/app/actions/rental'
import { CheckCircle2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function CompleteRentalButton({ rentalId }: { rentalId: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isLoadings, setIsLoading] = useState(false)
    const [notes, setNotes] = useState('')
    const router = useRouter()

    const handleComplete = async () => {
        setIsLoading(true)
        try {
            await completeRental(rentalId, notes)
            toast.success('Rental completed successfully')
            setIsOpen(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to complete rental')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="h-8 w-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20 shadow-sm transition-all flex items-center justify-center relative group"
                title="Complete / Return Rental"
            >
                <CheckCircle2 size={16} />
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="glass-card border-none text-foreground sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Complete Rental</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            Mark this rental as completed and return the gear to working inventory.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <label className="text-sm font-medium mb-2 block text-muted-foreground">
                            Completion Notes (Optional)
                        </label>
                        <Textarea
                            placeholder="e.g., Missing 1 battery, customer promised to return tomorrow..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="bg-background/50 border-white/10 min-h-[100px]"
                        />
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4 sm:space-x-0">
                        <Button
                            variant="default"
                            onClick={handleComplete}
                            disabled={isLoadings}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white"
                        >
                            {isLoadings ? 'Saving...' : 'Mark as Completed'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isLoadings}
                            className="w-full sm:w-auto border-white/10 bg-white/5 hover:bg-white/10 text-foreground"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
