const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const existingAdmin = await prisma.user.findUnique({
        where: { email: 'admin@example.com' }
    })

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('admin123', 10)
        await prisma.user.create({
            data: {
                name: 'Admin',
                email: 'admin@example.com',
                password: hashedPassword,
            },
        })
        console.log('Created default admin user (admin@example.com / admin123)')
    } else {
        console.log('Admin user already exists')
    }

    // Seed Clients
    const clientCount = await prisma.client.count()
    if (clientCount === 0) {
        await prisma.client.createMany({
            data: [
                { name: 'John Doe', mobile: '9876543210', address: '123 Main St' },
                { name: 'Jane Smith', mobile: '9123456780', reference: 'Local Ad' },
                { name: 'Acme Corp', mobile: '9998887776', address: 'Corporate Park Block B' },
            ]
        })
        console.log('Seeded initial clients')
    }

    // Seed Categories
    const categoryCount = await prisma.category.count()
    if (categoryCount === 0) {
        await prisma.category.createMany({
            data: [
                { name: 'Cameras' },
                { name: 'Lenses' },
                { name: 'Flash' },
                { name: 'Dron' }
            ]
        })
        console.log('Seeded initial categories')
    }

    // Seed Brands
    const brandCount = await prisma.brand.count()
    if (brandCount === 0) {
        await prisma.brand.createMany({
            data: [
                { name: 'Sony' },
                { name: 'Canon' },
                { name: 'Nikon' },
                { name: 'DJI' }
            ]
        })
        console.log('Seeded initial brands')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
