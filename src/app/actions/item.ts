'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getItems() {
    try {
        const items = await prisma.item.findMany({
            include: { images: true, category: true, brand: true },
            orderBy: { createdAt: 'desc' }
        })
        return items
    } catch (error) {
        console.error('Error fetching items:', error)
        throw new Error('Failed to fetch items')
    }
}

export async function createItem(data: {
    name: string
    brandId?: string
    categoryId?: string
    status: string
    purchaseDate: string
    soldDate?: string
    realPrice: number
    paidPrice: number
    soldPrice?: number
    rentAmount: number
    serialNo?: string
    description?: string
    images?: string[]
}) {
    try {
        const { images, ...itemData } = data
        const item = await prisma.item.create({
            data: {
                ...itemData,
                purchaseDate: new Date(data.purchaseDate),
                soldDate: data.soldDate ? new Date(data.soldDate) : null,
                images: images && images.length > 0 ? {
                    create: images.map(url => ({ url }))
                } : undefined
            }
        })
        revalidatePath('/inventory')
        return item
    } catch (error) {
        console.error('Error creating item:', error)
        throw new Error('Failed to create item')
    }
}

export async function updateItem(id: string, data: any) {
    try {
        const { images, ...itemData } = data

        const updateData: any = {
            ...itemData,
            purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
            soldDate: data.soldDate ? new Date(data.soldDate) : null
        }

        if (images !== undefined) {
            // If images are provided (even empty), we replace all existing images
            await prisma.itemImage.deleteMany({ where: { itemId: id } })
            updateData.images = {
                create: images.map((url: string) => ({ url }))
            }
        }

        const item = await prisma.item.update({
            where: { id },
            data: updateData,
            include: { images: true, category: true, brand: true }
        })
        revalidatePath('/inventory')
        return item
    } catch (error) {
        console.error('Error updating item:', error)
        throw new Error('Failed to update item')
    }
}

export async function updateItemStatus(id: string, status: string) {
    try {
        const item = await prisma.item.update({
            where: { id },
            data: { status }
        })
        revalidatePath('/inventory')
        return item
    } catch (error) {
        console.error('Error updating item status:', error)
        throw new Error('Failed to update item status')
    }
}

export async function deleteItem(id: string) {
    try {
        await prisma.item.delete({
            where: { id }
        })
        revalidatePath('/inventory')
    } catch (error) {
        console.error('Error deleting item:', error)
        throw new Error('Failed to delete item')
    }
}
