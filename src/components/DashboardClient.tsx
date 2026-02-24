'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { isWithinInterval, startOfDay, endOfDay } from 'date-fns'

type Item = {
    id: string
    name: string
}

type Rental = {
    id: string
    items: Item[]
    startDate: Date
    endDate: Date
    tenantName: string
}

type Order = {
    id: string
    items: Item[]
    startDate: Date
    endDate: Date
    customerName: string
}

export function DashboardClient({ rentals, orders }: { rentals: Rental[], orders: Order[] }) {
    const [date, setDate] = useState<Date | undefined>(new Date())

    const selectedDateEvents = [...rentals, ...orders].filter(event => {
        if (!date) return false
        return isWithinInterval(date, {
            start: startOfDay(new Date(event.startDate)),
            end: endOfDay(new Date(event.endDate))
        })
    })

    const modifiers = {
        booked: (day: Date) => {
            return [...rentals, ...orders].some(event =>
                isWithinInterval(day, {
                    start: startOfDay(new Date(event.startDate)),
                    end: endOfDay(new Date(event.endDate))
                })
            )
        }
    }

    const modifiersStyles = {
        booked: { border: '2px solid var(--primary)', backgroundColor: 'rgba(139, 92, 246, 0.2)' }
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <Card className="glass-card border-none xl:col-span-2">
                <CardHeader>
                    <CardTitle>Schedule Calendar</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center w-full">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-xl border border-white/10 p-4 sm:p-6 lg:p-8 bg-white/5 w-full [&_.rdp-day]:text-lg [&_.rdp-caption_label]:text-xl [&_.rdp-head_cell]:text-base [&_.rdp-table]:w-full"
                        modifiers={modifiers}
                        modifiersStyles={modifiersStyles}
                    />
                </CardContent>
            </Card>

            <Card className="glass-card border-none overflow-hidden h-[600px] flex flex-col">
                <CardHeader>
                    <CardTitle>Events on {date?.toLocaleDateString()}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-3 pr-2">
                    {selectedDateEvents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No schedule for this date.
                        </div>
                    ) : (
                        selectedDateEvents.map((evt: any) => (
                            <div key={evt.id} className="p-4 rounded-lg border border-white/10 bg-white/5 flex flex-col gap-1 transition-colors hover:bg-white/10">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-sm font-semibold capitalize text-primary glow-text">
                                        {'tenantName' in evt ? 'Rental' : 'Order'}
                                    </span>
                                    {'tenantName' in evt && (
                                        <a
                                            href={`/rentals/${evt.id}/invoice`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="h-8 w-8 rounded-full bg-background/50 backdrop-blur-sm border border-border text-foreground hover:bg-background shadow-sm hover:shadow hover:text-primary transition-all flex items-center justify-center shrink-0"
                                            title="View Invoice"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" /><circle cx="12" cy="12" r="3" /></svg>
                                        </a>
                                    )}
                                </div>
                                <span className="font-medium text-lg capitalize">
                                    {'tenantName' in evt ? evt.tenantName : evt.customerName}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    Items: {evt.items.map((i: any) => i.name).join(', ')}
                                </span>
                                <span className="text-xs text-muted-foreground mt-2 bg-background/50 px-2 py-1 rounded inline-block w-fit">
                                    {new Date(evt.startDate).toLocaleDateString()} - {new Date(evt.endDate).toLocaleDateString()}
                                </span>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
