'use client'

import { useState, useMemo, useEffect } from 'react'
import { Camera, Search, Filter, Moon, Sun, X, Info } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function PublicCatalogClient({ initialItems, activeRentals = [] }: { initialItems: any[], activeRentals?: any[] }) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [brandFilter, setBrandFilter] = useState<string>('all')
    const [showFilters, setShowFilters] = useState(false)
    const [selectedItem, setSelectedItem] = useState<any | null>(null)
    const [startDate, setStartDate] = useState<string>('')
    const [endDate, setEndDate] = useState<string>('')

    useEffect(() => {
        setMounted(true)
    }, [])

    const categories = useMemo(() => Array.from(new Set(initialItems.map((i) => i.category?.name || 'Uncategorized'))), [initialItems])
    const brands = useMemo(() => Array.from(new Set(initialItems.map((i) => i.brand?.name || 'No Brand'))), [initialItems])

    const processedItems = useMemo(() => {
        let items = initialItems.filter(item => {
            const catName = item.category?.name || 'Uncategorized'
            const brandName = item.brand?.name || 'No Brand'

            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                brandName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
            const matchesCategory = categoryFilter === 'all' || catName === categoryFilter
            const matchesBrand = brandFilter === 'all' || brandName === brandFilter
            return matchesSearch && matchesCategory && matchesBrand
        }).map(item => {
            let isAvailableForDates = true
            let conflictMsg = ''

            if (startDate && endDate) {
                const start = new Date(startDate)
                start.setHours(0, 0, 0, 0)
                const end = new Date(endDate)
                end.setHours(23, 59, 59, 999)

                if (start <= end) {
                    const overlappingRental = activeRentals.find((rental: any) => {
                        const rentalStart = new Date(rental.startDate)
                        const rentalEnd = new Date(rental.endDate)
                        const overlaps = rentalStart <= end && rentalEnd >= start
                        if (!overlaps) return false
                        // Check if item is in this rental
                        return rental.items.some((rentedItem: any) => rentedItem.id === item.id)
                    })

                    if (overlappingRental) {
                        isAvailableForDates = false
                    }
                }
            } else {
                isAvailableForDates = item.status === 'working'
            }

            return { ...item, isAvailableForDates }
        })

        if (startDate && endDate) {
            items.sort((a, b) => (a.isAvailableForDates === b.isAvailableForDates ? 0 : a.isAvailableForDates ? -1 : 1))
        }

        return items
    }, [initialItems, searchQuery, categoryFilter, brandFilter, startDate, endDate, activeRentals])

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Header / Theme Toggle */}
            <div className="absolute top-4 right-4 z-50">
                {mounted && (
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-3 rounded-full glass border border-white/10 hover:bg-white/10 transition-colors text-foreground"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                )}
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden py-16 sm:py-24">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative w-full px-4 sm:px-8 lg:px-12 text-center text-foreground">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-6 animate-in slide-in-from-bottom-6 duration-700">
                        Capture <span className="text-primary glow-text">Craft</span> Rentals
                    </h1>
                    <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto animate-in slide-in-from-bottom-8 duration-700 delay-150">
                        Browse our curated collection of professional cameras, lenses, and accessories available for your next shoot.
                    </p>
                </div>
            </div>

            {/* Catalog Grid */}
            <div className="w-full px-4 sm:px-8 lg:px-12 pb-24 text-foreground">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 animate-in fade-in duration-1000 gap-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2 min-w-max">
                        <Camera className="text-primary" /> Available Gear
                    </h2>
                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search gear..."
                                className="pl-9 bg-background/50 border-white/10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 border border-white/10 rounded-md px-4 py-2 text-sm transition-colors ${showFilters ? 'bg-primary text-white border-primary' : 'bg-background/50 text-muted-foreground hover:bg-white/5'}`}
                        >
                            <Filter size={16} /> Filters
                        </button>
                    </div>
                </div>

                {/* Optional Filters Row */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8 p-4 glass-card rounded-xl border border-white/10 animate-in slide-in-from-top-4 duration-300">
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Category</label>
                            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                                <SelectTrigger className="bg-background/50 border-white/10">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20">
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(c => (
                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Brand</label>
                            <Select value={brandFilter} onValueChange={setBrandFilter}>
                                <SelectTrigger className="bg-background/50 border-white/10">
                                    <SelectValue placeholder="All Brands" />
                                </SelectTrigger>
                                <SelectContent className="bg-background/95 backdrop-blur-xl border-white/20">
                                    <SelectItem value="all">All Brands</SelectItem>
                                    {brands.map(b => (
                                        <SelectItem key={b} value={b}>{b}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Start Date</label>
                            <Input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-background/50 border-white/10"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">End Date</label>
                            <Input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-background/50 border-white/10"
                            />
                        </div>
                        <div className="flex items-end">
                            {(categoryFilter !== 'all' || brandFilter !== 'all' || searchQuery !== '' || startDate !== '' || endDate !== '') && (
                                <button
                                    onClick={() => { setCategoryFilter('all'); setBrandFilter('all'); setSearchQuery(''); setStartDate(''); setEndDate(''); }}
                                    className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1 p-2"
                                >
                                    <X size={16} /> Clear Filters
                                </button>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 animate-in slide-in-from-bottom-12 duration-1000 delay-300">
                    {processedItems.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-muted-foreground border border-white/10 rounded-2xl glass-card backdrop-blur-md">
                            No equipment found matching your criteria.
                        </div>
                    ) : (
                        processedItems.map((item: any) => {
                            const isAvailable = item.isAvailableForDates
                            const hasImages = item.images && item.images.length > 0
                            const mainImage = hasImages ? item.images[0].url : null

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => isAvailable && setSelectedItem(item)}
                                    className={`group relative rounded-2xl border border-white/10 glass overflow-hidden transition-all duration-300 flex flex-col h-full ${isAvailable ? 'cursor-pointer hover:bg-white/5 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20' : 'opacity-60 grayscale-[0.8] cursor-not-allowed'}`}
                                >
                                    <div className="aspect-[4/3] w-full bg-black/5 dark:bg-black/50 relative overflow-hidden flex items-center justify-center p-6">
                                        {mainImage ? (
                                            <img
                                                src={mainImage}
                                                alt={item.name}
                                                className="w-full h-full object-contain filter drop-shadow-2xl group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <Camera size={48} className="text-foreground/10 group-hover:text-primary/40 transition-colors duration-300" />
                                        )}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            {startDate && endDate ? (
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${isAvailable ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                                                    {isAvailable ? 'Available for Dates' : 'Booked'}
                                                </span>
                                            ) : (
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${isAvailable ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>
                                                    {isAvailable ? 'Available' : 'Currently Rented'}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="mb-2">
                                            <span className="text-xs font-semibold uppercase tracking-wider text-primary mb-1 block">
                                                {item.category?.name || 'Uncategorized'}
                                            </span>
                                            <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors">
                                                {item.brand?.name || 'No Brand'} {item.name}
                                            </h3>
                                        </div>

                                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/10">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-muted-foreground">Rent per day</span>
                                                <span className="text-xl font-bold">₹{item.rentAmount || 0}</span>
                                            </div>
                                            <div className="bg-primary/10 text-primary p-2 rounded-xl transition-colors duration-300 group-hover:bg-primary group-hover:text-white group-hover:shadow-[0_0_15px_rgba(var(--primary),0.5)]">
                                                <Info size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* Item Details Modal */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="sm:max-w-[700px] glass-card border border-white/10 p-0 overflow-hidden flex flex-col max-h-[90vh]">
                    {selectedItem && (
                        <>
                            <div className="relative h-64 sm:h-80 bg-black/5 dark:bg-black/50 flex items-center justify-center p-8 border-b border-white/10">
                                {selectedItem.images && selectedItem.images.length > 0 ? (
                                    <div className="flex gap-4 overflow-x-auto w-full h-full items-center snap-x">
                                        {selectedItem.images.map((img: any, idx: number) => (
                                            <img key={idx} src={img.url} alt={`${selectedItem.name} - ${idx}`} className="h-full object-contain snap-center flex-shrink-0" />
                                        ))}
                                    </div>
                                ) : (
                                    <Camera size={64} className="text-foreground/10" />
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold shadow-lg backdrop-blur-md ${selectedItem.status === 'working' ? 'bg-emerald-500/90 text-white' : 'bg-orange-500/90 text-white'}`}>
                                        {selectedItem.status === 'working' ? 'Available to Rent' : 'Currently Out on Rent'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 md:p-8 overflow-y-auto">
                                <DialogHeader className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                                            {selectedItem.category?.name || 'Uncategorized'}
                                        </span>
                                        <span className="px-2 py-1 rounded-md bg-white/5 text-muted-foreground border border-white/10 text-xs font-bold uppercase tracking-widest">
                                            {selectedItem.brand?.name || 'No Brand'}
                                        </span>
                                    </div>
                                    <DialogTitle className="text-3xl font-extrabold tracking-tight">
                                        {selectedItem.name}
                                    </DialogTitle>
                                </DialogHeader>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 border-b border-white/10 pb-2">Description</h4>
                                        <p className="text-foreground/90 leading-relaxed text-sm whitespace-pre-wrap">
                                            {selectedItem.description || "No detailed description available for this item."}
                                        </p>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="glass-card p-4 rounded-xl border border-primary/20 bg-primary/5">
                                            <p className="text-sm text-primary/80 font-medium mb-1">Rental Rate</p>
                                            <p className="text-4xl font-extrabold text-primary glow-text">₹{selectedItem.rentAmount || 0}<span className="text-lg text-primary/60 font-medium">/day</span></p>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 border-b border-white/10 pb-2">Details</h4>
                                            <ul className="space-y-2 text-sm text-foreground/80">
                                                <li className="flex justify-between">
                                                    <span className="text-muted-foreground">Brand</span>
                                                    <span className="font-semibold">{selectedItem.brand?.name || 'No Brand'}</span>
                                                </li>
                                                <li className="flex justify-between">
                                                    <span className="text-muted-foreground">Category</span>
                                                    <span className="font-semibold capitalize">{selectedItem.category?.name || 'Uncategorized'}</span>
                                                </li>
                                                <li className="flex justify-between">
                                                    <span className="text-muted-foreground">Serial No.</span>
                                                    <span className="font-semibold">{selectedItem.serialNo || 'N/A'}</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <footer className="mt-20 border-t border-border bg-card">
                <div className="w-full px-6 sm:px-12 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-12 text-sm text-foreground/80">
                        {/* Brand Column */}
                        <div className="flex flex-col items-start gap-4 col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-3">
                            <div className="flex flex-col items-start gap-1 text-primary glow-text">
                                <div className="flex items-center gap-2">
                                    <Camera size={28} />
                                    <span className="text-2xl font-black tracking-tighter leading-none">Capture Craft<br />Rentals</span>
                                </div>
                            </div>
                            <p className="mt-4 leading-relaxed text-muted-foreground">
                                Capture Craft Rentals is your premium destination for renting high-quality camera equipment, lenses, and lighting, catering to the needs of passionate photographers and videographers.
                            </p>
                        </div>

                        {/* Links Column 1 */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold text-primary mb-2 uppercase tracking-wider text-xs">Cameras</h4>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Bundles</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Camera Body</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Lenses</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Batteries</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Gimbals</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Memory Card</a>
                        </div>

                        {/* Links Column 2 */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold text-primary mb-2 uppercase tracking-wider text-xs">Lenses</h4>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Sony</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Sony G-master</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Canon</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Nikon</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Other</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">ND Filters</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Teleprompter</a>
                        </div>

                        {/* Links Column 3 */}
                        <div className="flex flex-col gap-4">
                            <h4 className="font-bold text-primary mb-2 uppercase tracking-wider text-xs">Lights</h4>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Lights</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Continuous Lights</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Flash Lights</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Studio Lights</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Softboxes</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Triggers</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Reflector</a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Accessories</a>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-border py-6 mt-4">
                    <div className="w-full px-6 sm:px-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                        <div>
                            &copy; {new Date().getFullYear()} Capture Craft Rentals. All rights reserved.
                        </div>
                        <div className="flex items-center gap-6">
                            <a href="#" className="hover:text-foreground transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            <a href="#" className="hover:text-foreground transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                            </a>
                            <a href="#" className="hover:text-foreground transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
