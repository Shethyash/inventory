'use client'

import { useState } from 'react'
import { Plus, Edit2 } from 'lucide-react'
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
import { Textarea } from '@/components/ui/textarea'
import { createClient, updateClient } from '@/app/actions/client'
import { toast } from 'sonner'
import { Client } from '@prisma/client'

export function ClientForm({ client }: { client?: Client }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name') as string,
            mobile: formData.get('mobile') as string,
            address: formData.get('address') as string || undefined,
            reference: formData.get('reference') as string || undefined,
        }

        try {
            if (client) {
                await updateClient(client.id, data)
                toast.success('Client updated successfully')
            } else {
                await createClient(data)
                toast.success('Client created successfully')
            }
            setOpen(false)
        } catch (error: any) {
            toast.error(error.message || 'Failed to save client')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {client ? (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-background/50 border shadow-sm hover:text-primary transition-all">
                        <Edit2 className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button className="bg-primary hover:bg-primary/80 text-white rounded-full px-6 transition-all hover:scale-105 shadow-lg shadow-primary/25">
                        <Plus className="mr-2 h-4 w-4" /> New Client
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-card border">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold glow-text">
                        {client ? 'Edit Client' : 'Add New Client'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            className="bg-background/50 border-white/10"
                            placeholder="John Doe"
                            defaultValue={client?.name}
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input
                            id="mobile"
                            name="mobile"
                            type="tel"
                            required
                            minLength={10}
                            maxLength={10}
                            pattern="[0-9]{10}"
                            title="10 digit mobile number"
                            className="bg-background/50 border-white/10"
                            placeholder="9876543210"
                            defaultValue={client?.mobile}
                            onInput={(e) => {
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^0-9]/g, '');
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="address">Address (Optional)</Label>
                        <Textarea
                            id="address"
                            name="address"
                            className="bg-background/50 border-white/10 resize-none"
                            placeholder="Full residential address"
                            defaultValue={client?.address || ''}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reference">Reference / Notes (Optional)</Label>
                        <Input
                            id="reference"
                            name="reference"
                            className="bg-background/50 border-white/10"
                            placeholder="e.g. Referred by Ravi"
                            defaultValue={client?.reference || ''}
                        />
                    </div>

                    <div className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/80 text-lg rounded-full h-12">
                            {loading ? 'Saving...' : (client ? 'Update Client' : 'Add Client')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
