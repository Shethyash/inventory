'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' }
        })
        return categories
    } catch (error) {
        console.error('Error fetching categories:', error)
        throw new Error('Failed to fetch categories')
    }
}

export async function createCategory(data: { name: string }) {
    try {
        const category = await prisma.category.create({
            data
        })
        revalidatePath('/categories')
        revalidatePath('/inventory')
        return category
    } catch (error) {
        console.error('Error creating category:', error)
        throw new Error('Failed to create category')
    }
}

export async function deleteCategory(id: string) {
    try {
        await prisma.category.delete({
            where: { id }
        })
        revalidatePath('/categories')
        revalidatePath('/inventory')
    } catch (error) {
        console.error('Error deleting category:', error)
        throw new Error('Failed to delete category')
    }
}

export async function updateCategory(id: string, data: { name: string }) {
    try {
        const category = await prisma.category.update({
            where: { id },
            data
        })
        revalidatePath('/categories')
        revalidatePath('/inventory')
        return category
    } catch (error) {
        console.error('Error updating category:', error)
        throw new Error('Failed to update category')
    }
}
