import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { PrintInvoiceButton } from './PrintInvoiceButton'

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const rental = await prisma.rental.findUnique({
        where: { id },
        include: {
            items: {
                include: { brand: true }
            }
        } // Include relations
    })

    if (!rental) {
        notFound()
    }

    const { items, ...rentalInfo } = rental

    return (
        <div className="min-h-screen bg-white text-black p-8 sm:p-12 print:p-0 font-sans">
            <div className="max-w-4xl mx-auto border border-gray-200 p-10 print:border-none print:shadow-none shadow-sm rounded-lg relative overflow-hidden bg-white">
                {/* Print button - hidden while printing */}
                <div className="absolute top-8 right-8 print:hidden">
                    <PrintInvoiceButton />
                </div>

                {/* Header */}
                <div className="flex justify-between items-start mb-12 border-b-2 border-primary pb-8">
                    <div>
                        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Capture Craft Rentals</h1>
                        <p className="text-gray-500 mt-2">Premium Camera Equipment</p>
                        <div className="mt-4 text-sm text-gray-600">
                            <p>123 Camera Lane, Photo District</p>
                            <p>Cityville, State 12345</p>
                            <p>contact@capturecraft.com</p>
                            <p>+91 (123) 456-7890</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-3xl font-bold uppercase tracking-widest text-primary mb-2">Invoice</h2>
                        <div className="text-gray-600 space-y-1">
                            <p><span className="font-semibold text-gray-800">Date:</span> {format(new Date(), 'PP')}</p>
                            <p><span className="font-semibold text-gray-800">Receipt No:</span> {rentalInfo.receiptNo || rentalInfo.id.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="mb-10 bg-gray-50 p-6 rounded-lg flex flex-col md:flex-row gap-8 justify-between">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2 uppercase text-sm tracking-widest border-b border-gray-200 pb-2">Billed To</h3>
                        <p className="font-semibold text-lg text-gray-800">{rentalInfo.tenantName}</p>
                        <p className="text-gray-600 mt-1">Mobile: {rentalInfo.tenantMobile || 'N/A'}</p>
                        {rentalInfo.address && <p className="text-gray-600 mt-1 whitespace-pre-wrap">{rentalInfo.address}</p>}
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2 uppercase text-sm tracking-widest border-b border-gray-200 pb-2">Rental Period ({rentalInfo.days} {rentalInfo.days === 1 ? 'day' : 'days'})</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-3 text-sm">
                            <span className="text-gray-500 font-medium">Pickup:</span>
                            <span className="text-gray-800 font-semibold">{format(new Date(rentalInfo.startDate), 'PPp')}</span>
                            <span className="text-gray-500 font-medium">Return:</span>
                            <span className="text-gray-800 font-semibold">{format(new Date(rentalInfo.endDate), 'PPp')}</span>
                        </div>
                    </div>
                </div>

                {/* Itemized Table */}
                <div className="mb-12">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-gray-200 text-gray-700">
                                <th className="py-3 px-4 font-semibold w-[60%]">Item Description</th>
                                <th className="py-3 px-4 font-semibold text-center">Qty</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600 divide-y divide-gray-100">
                            {items.map((item: any, index) => (
                                <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                                    <td className="py-4 px-4 font-medium text-gray-800">
                                        <div className="flex flex-col gap-0.5">
                                            <span>{item.brand ? `${item.brand.name} ` : ''}{item.name}</span>
                                            {item.serialNo && <span className="text-xs text-gray-500 font-normal">S/N: {item.serialNo}</span>}
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center">1</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-12">
                    <div className="w-full md:w-1/2 p-6 bg-gray-50 rounded-lg">
                        <div className="flex justify-between py-2 text-gray-600">
                            <span>Rate ({rentalInfo.days} days):</span>
                            <span>₹{((rentalInfo.totalPayment + rentalInfo.discount) || (rentalInfo.rentAmount * rentalInfo.days)).toFixed(2)}</span>
                        </div>
                        {rentalInfo.discount > 0 && (
                            <div className="flex justify-between py-2 text-red-500">
                                <span>Discount:</span>
                                <span>-₹{rentalInfo.discount.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between py-4 mt-2 border-t-2 border-gray-200 font-bold text-xl text-gray-900">
                            <span>Grand Total:</span>
                            <span>₹{rentalInfo.totalPayment.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between py-2 text-gray-600 font-medium">
                            <span>Amount Paid ({rentalInfo.paymentType || 'General'}):</span>
                            <span className="text-emerald-600">₹{rentalInfo.amountPaid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-3 mt-2 border-t border-gray-300 font-bold text-lg">
                            <span>Balance Due:</span>
                            <span className={rentalInfo.totalPayment - rentalInfo.amountPaid > 0 ? "text-red-500" : "text-emerald-500"}>
                                ₹{Math.max(0, rentalInfo.totalPayment - rentalInfo.amountPaid).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Notes */}
                <div className="text-center text-sm text-gray-500 border-t border-gray-200 mt-16 pt-8">
                    <p className="font-semibold text-gray-700 mb-2">Terms & Conditions</p>
                    <p className="mb-4">All equipment must be returned by the specified date in its original condition. Late returns will be subject to additional fees as per the default daily rate. Damage to equipment will be covered by the renter.</p>
                    <p className="italic">Thank you for choosing Capture Craft Rentals!</p>
                </div>
            </div>
            {/* Global style for printing to ensure buttons disappear and formatting is clean */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 0; size: auto; }
                    body {
                        background: white;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    button { display: none !important; }
                    aside, nav { display: none !important; }
                    main { margin-left: 0 !important; width: 100% !important; padding: 0 !important; max-width: 100% !important; }
                }
            `}} />
        </div>
    )
}
