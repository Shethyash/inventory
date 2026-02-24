'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getOrders() {
    try {
        const orders = await prisma.order.findMany({
            include: {
                items: true
            },
            orderBy: { createdAt: 'desc' }
        })
        return orders
    } catch (error) {
        console.error('Error fetching orders:', error)
        throw new Error('Failed to fetch orders')
    }
}

export async function getAvailableItems(startDate: string, endDate: string) {
    try {
        const start = new Date(startDate)
        const end = new Date(endDate)

        // Find all items not rented out or ordered during this period
        const allItems = await prisma.item.findMany()

        const unavailableRentals = await prisma.rental.findMany({
            include: { items: true },
            where: {
                OR: [
                    { startDate: { lte: end }, endDate: { gte: start } }
                ]
            }
        })

        const unavailableOrders = await prisma.order.findMany({
            include: { items: true },
            where: {
                OR: [
                    { startDate: { lte: end }, endDate: { gte: start } }
                ]
            }
        })

        const unavailableItemIds = new Set([
            ...unavailableRentals.flatMap(r => r.items.map(i => i.id)),
            ...unavailableOrders.flatMap(o => o.items.map(i => i.id))
        ])

        return allItems.filter(item => !unavailableItemIds.has(item.id))
    } catch (error) {
        console.error('Error fetching available items:', error)
        throw new Error('Failed to fetch available items')
    }
}

export async function createOrder(data: {
    itemIds: string[]
    customerName: string
    startDate: string
    endDate: string
    targetRentAmount: number
}) {
    try {
        // Re-verify availability
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)

        const existingRentals = await prisma.rental.findMany({
            where: {
                items: {
                    some: { id: { in: data.itemIds } }
                },
                OR: [
                    { startDate: { lte: end }, endDate: { gte: start } }
                ]
            }
        })

        const existingOrders = await prisma.order.findMany({
            where: {
                items: {
                    some: { id: { in: data.itemIds } }
                },
                OR: [
                    { startDate: { lte: end }, endDate: { gte: start } }
                ]
            }
        })

        if (existingRentals.length > 0 || existingOrders.length > 0) {
            throw new Error('One or more selected items are no longer available for these dates')
        }

        const { itemIds, ...orderData } = data

        const order = await prisma.order.create({
            data: {
                ...orderData,
                startDate: start,
                endDate: end,
                items: {
                    connect: itemIds.map(id => ({ id }))
                }
            }
        })

        revalidatePath('/orders')
        revalidatePath('/')
        return order
    } catch (error: any) {
        console.error('Error creating order:', error)
        throw new Error(error.message || 'Failed to create order')
    }
}
