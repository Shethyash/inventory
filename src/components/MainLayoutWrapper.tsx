'use client'

import { usePathname } from 'next/navigation'

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    // The public catalog and the invoice page should be full width
    const isFullWidthPage = pathname === '/' || pathname.endsWith('/invoice')

    if (isFullWidthPage) {
        return <div className="w-full">{children}</div>
    }

    // Standard admin layout wrap
    return (
        <div className="p-4 md:p-8 relative w-full">
            {/* Subtle background glow effect over the main area */}
            <div className="absolute top-0 right-0 -z-10 w-full h-full md:w-[800px] md:h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    )
}
