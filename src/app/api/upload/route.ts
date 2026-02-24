import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const files = formData.getAll('file') as File[]

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: "File is required." },
                { status: 400 }
            );
        }

        const uploadDir = join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true })
        }

        const uploadedUrls: string[] = []

        for (const file of files) {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            // Generate unique filename to avoid collisions
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
            const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
            const filepath = join(uploadDir, filename)

            await writeFile(filepath, buffer)
            uploadedUrls.push(`/uploads/${filename}`)
        }

        return NextResponse.json({ urls: uploadedUrls })
    } catch (e: any) {
        console.error("Error uploading file:", e)
        return NextResponse.json(
            { error: "Failed to upload file." },
            { status: 500 }
        );
    }
}
