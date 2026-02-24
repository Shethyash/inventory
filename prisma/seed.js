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
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
