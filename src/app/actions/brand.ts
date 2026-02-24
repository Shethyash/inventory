'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getBrands() {
    try {
        const brands = await prisma.brand.findMany({
            orderBy: { name: 'asc' }
        })
        return brands
    } catch (error) {
        console.error('Error fetching brands:', error)
        throw new Error('Failed to fetch brands')
    }
}

export async function createBrand(data: { name: string }) {
    try {
        const brand = await prisma.brand.create({
            data
        })
        revalidatePath('/brands')
        revalidatePath('/inventory')
        return brand
    } catch (error) {
        console.error('Error creating brand:', error)
        throw new Error('Failed to create brand')
    }
}

export async function deleteBrand(id: string) {
    try {
        await prisma.brand.delete({
            where: { id }
        })
        revalidatePath('/brands')
        revalidatePath('/inventory')
    } catch (error) {
        console.error('Error deleting brand:', error)
        throw new Error('Failed to delete brand')
    }
}

export async function updateBrand(id: string, data: { name: string }) {
    try {
        const brand = await prisma.brand.update({
            where: { id },
            data
        })
        revalidatePath('/brands')
        revalidatePath('/inventory')
        return brand
    } catch (error) {
        console.error('Error updating brand:', error)
        throw new Error('Failed to update brand')
    }
}
