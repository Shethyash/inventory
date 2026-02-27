'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Camera,
    Calendar,
    PackageSearch,
    Repeat,
    CalendarPlus,
    Menu,
    X,
    Moon,
    Sun,
    Tags,
    Star,
    Users
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'

import { signOut } from 'next-auth/react'

const navItems = [
    { name: 'Public Catalog', href: '/', icon: Camera },
    { name: 'Dashboard', href: '/dashboard', icon: Calendar },
    { name: 'Inventory', href: '/inventory', icon: PackageSearch },
    { name: 'Categories', href: '/categories', icon: Tags },
    { name: 'Brands', href: '/brands', icon: Star },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Active Rentals', href: '/rentals', icon: Repeat },
    { name: 'Future Orders', href: '/orders', icon: CalendarPlus },
]

export function SidebarNav() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const { theme, setTheme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (pathname === '/' || pathname === '/login') {
        return null
    }

    return (
        <>
            {/* Mobile Top Navbar */}
            <div className="md:hidden w-full flex items-center justify-between px-4 py-3 glass border-b sticky top-0 z-40 bg-background/80 backdrop-blur-md">
                <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105" onClick={() => setIsOpen(false)}>
                    <Camera className="w-6 h-6 text-primary glow-text" />
                    <span className="font-bold text-lg tracking-tight">Capture Craft</span>
                </Link>
                <button
                    className="p-2 glass rounded-md border border-white/10 text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`
          fixed inset-y-0 left-0 z-50 w-64 glass border-r
          transform transition-transform duration-300 ease-in-out
          md:translate-x-0 md:static md:flex md:flex-col
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
            >
                <div className="p-6">
                    <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105" onClick={() => setIsOpen(false)}>
                        <div className="bg-primary/20 p-2 rounded-xl border border-primary/30">
                            <Camera className="w-6 h-6 text-primary glow-text" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">Capture Craft Rentals</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive
                                        ? 'bg-primary/10 text-primary font-medium border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                                        : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground hover:pl-5'
                                    }
                `}
                            >
                                <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 mt-auto space-y-4">
                    {/* Theme Toggle Button */}
                    {mounted && (
                        <button
                            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-border bg-foreground/5 hover:bg-foreground/10 transition-colors"
                        >
                            <span className="text-sm font-medium">Appearance</span>
                            {resolvedTheme === 'dark' ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-orange-500" />}
                        </button>
                    )}

                    <div className="glass-card p-4 rounded-xl text-center">
                        <p className="text-xs text-muted-foreground mb-1">System Status</p>
                        <div className="flex items-center justify-center gap-2 text-sm font-medium text-emerald-400">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            Operational
                        </div>
                    </div>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="flex items-center space-x-3 px-3 py-2 w-full mt-4 text-left rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                        <span className="font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    )
}
