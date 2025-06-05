"use client"

import React, { useState, useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { setPageTitle } from "../../store/themeConfigSlice"
import { IoIosArrowDropright, IoIosArrowDropdown, IoMdFunnel } from "react-icons/io"
import { IoMdArrowDropdownCircle } from "react-icons/io"
import { IoMdArrowDroprightCircle } from "react-icons/io"
import { Loader2, CheckCircle2, QrCode } from "lucide-react"
import QRCode from "react-qr-code"
import type Flatpickr from "react-flatpickr"
import FlatpickrReact from "react-flatpickr"
import "flatpickr/dist/themes/material_blue.css"
import ProductDetailsStatic from "../../components/order_status/ProductDetailsStatic"
import EmiDetails from "../../components/order_status/EmiDetails"
import InvoiceDetails from "../../components/order_status/InvoiceDetails"
import RemarkDetails from "../../components/order_status/RemarkDetails"
import UTRDetails from "../../components/order_status/UTRDetails"
import RejectedRemark from "../../components/order_status/RejectedRemark"
import CompletedStatusEmiDetails from "../../components/order_status/CompletedStatusEmiDetails"
import { updateOrderById, searchOrderByPhoneNumber, fetchOrdersByStore } from "../../api"
import { MdArrowBackIos } from "react-icons/md"
import { MdOutlineArrowForwardIos } from "react-icons/md"

interface AccordionContentProps {
    status: string
    orderId?: string
    qrUrl?: string
    onCompleteOrder?: (orderId: string) => void
    isCompletingOrder?: boolean
}

const AccordionContent = ({ status, orderId, qrUrl, onCompleteOrder, isCompletingOrder }: AccordionContentProps) => {
    const [isExpanded, setIsExpanded] = useState(false)

    const toggleExpand = () => setIsExpanded(!isExpanded)

    const handleQRClick = () => {
        window.open(qrUrl)
    }

    return (
        <div className="mt-4 bg-gray-50 rounded-lg">
            {status === "QR Generated" && (
                <div className="space-y-2">
                    {qrUrl ? (
                        <div className="bg-white rounded-lg  border-gray-200 p-2">
                            <div className="flex flex-col-2 gap-4 items-center space-y-2">
                                {/* QR Code Section - centered with minimal spacing */}
                                <div className="flex flex-col items-center space-y-1">
                                    <h4 className="text-sm font-semibold text-gray-800">Scan QR</h4>
                                    <div
                                        className="cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={handleQRClick}
                                        title="Click to open QR"
                                    >
                                        <QRCode value={qrUrl} size={120} />
                                    </div>
                                    <p className="text-xs text-gray-500 text-center">Tap to open</p>
                                </div>

                                {/* Buttons Section - below QR code */}
                                <div className="flex flex-col space-y-2 w-40">
                                    <button
                                        onClick={() => orderId && onCompleteOrder?.(orderId)}
                                        disabled={isCompletingOrder}
                                        className="w-full bg-green-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 text-xs"
                                    >
                                        {isCompletingOrder ? (
                                            <>
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Completing...
                                            </>
                                        ) : (
                                            "Complete Order"
                                        )}
                                    </button>

                                    <button
                                        onClick={handleQRClick}
                                        className="w-full bg-blue-600 text-white font-semibold py-2 px-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-1 text-xs"
                                    >
                                        <QrCode className="h-3 w-3" />
                                        Open QR Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-yellow-800 text-sm">QR Code not available for this order.</p>
                        </div>
                    )}
                </div>
            )}

            {status === "Completed" && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Order Completed Successfully!</span>
                    </div>
                    <button className="flex items-center gap-2 text-blue-500 font-semibold" onClick={toggleExpand}>
                        {isExpanded ? (
                            <>
                                <IoMdArrowDropdownCircle className="text-2xl" />
                                <span className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                                    Hide details
                                </span>
                            </>
                        ) : (
                            <></>
                        )}
                    </button>
                    {isExpanded && (
                        <div className="space-y-4 mt-4">
                            <CompletedStatusEmiDetails />
                            <ProductDetailsStatic />
                        </div>
                    )}
                </div>
            )}

            {status === "Processed" && (
                <div className="space-y-4">
                    <EmiDetails />
                    <button className="flex items-center gap-2 text-blue-500 font-semibold" onClick={toggleExpand}>
                        {isExpanded ? (
                            <>
                                <IoMdArrowDropdownCircle className="text-2xl" />
                                <span className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                                    Hide details
                                </span>
                            </>
                        ) : (
                            <>
                                <IoMdArrowDroprightCircle className="text-2xl" />
                                <span className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                                    View more
                                </span>
                            </>
                        )}
                    </button>
                    {isExpanded && (
                        <div className="space-y-4 mt-4">
                            <ProductDetailsStatic />
                        </div>
                    )}
                </div>
            )}

            {status === "On Hold" && (
                <div className="space-y-4">
                    <RemarkDetails />
                    <button className="flex items-center gap-2 text-blue-500 font-semibold" onClick={toggleExpand}>
                        {isExpanded ? (
                            <>
                                <IoMdArrowDropdownCircle className="text-2xl" />
                                <span className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                                    Hide details
                                </span>
                            </>
                        ) : (
                            <>
                                <IoMdArrowDroprightCircle className="text-2xl" />
                                <span className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                                    View more
                                </span>
                            </>
                        )}
                    </button>
                    {isExpanded && (
                        <div className="space-y-4 mt-4">
                            <EmiDetails />
                            <ProductDetailsStatic />
                        </div>
                    )}
                </div>
            )}

            {status === "Settled" && (
                <div className="space-y-4">
                    <UTRDetails />
                    <button className="flex items-center gap-2 text-blue-500 font-semibold" onClick={toggleExpand}>
                        {isExpanded ? (
                            <>
                                <IoMdArrowDropdownCircle className="text-2xl" />
                                <span className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                                    Hide details
                                </span>
                            </>
                        ) : (
                            <>
                                <IoMdArrowDroprightCircle className="text-2xl" />
                                <span className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                                    View more
                                </span>
                            </>
                        )}
                    </button>
                    {isExpanded && (
                        <div className="space-y-4 mt-4">
                            <InvoiceDetails />
                            <EmiDetails />
                            <ProductDetailsStatic />
                        </div>
                    )}
                </div>
            )}

            {status === "Rejected" && (
                <div className="space-y-4">
                    <RejectedRemark />
                    <button className="flex items-center gap-2 text-blue-500 font-semibold" onClick={toggleExpand}>
                        {isExpanded ? (
                            <>
                                <IoMdArrowDropdownCircle className="text-2xl" />
                                <span className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                                    Hide details
                                </span>
                            </>
                        ) : (
                            <>
                                <IoMdArrowDroprightCircle className="text-2xl" />
                                <span className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition duration-300">
                                    View more
                                </span>
                            </>
                        )}
                    </button>
                    {isExpanded && (
                        <div className="space-y-4 mt-4">
                            <ProductDetailsStatic />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const OrdersDemo = () => {
    const [allOrders, setAllOrders] = useState<any[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Array<any>>([])

    const dispatch = useDispatch()
    const [expandedRow, setExpandedRow] = useState<string | null>(null)
    const [orders, setOrders] = useState<Array<any>>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [completingOrders, setCompletingOrders] = useState<Set<string>>(new Set())
    const [successMessage, setSuccessMessage] = useState<string>("")
    const [search, setSearch] = useState<string>("")
    const [searchLoading, setSearchLoading] = useState<boolean>(false)
    const [isSearchMode, setIsSearchMode] = useState<boolean>(false)
    const [dateRange, setDateRange] = useState<Date[] | string[]>([])
    const flatpickrRef = useRef<Flatpickr | null>(null)
    const [isDateFilterMode, setIsDateFilterMode] = useState<boolean>(false)
    const [dateFilterLoading, setDateFilterLoading] = useState<boolean>(false)
    const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState<boolean>(false)
    const [initialLoading, setInitialLoading] = useState<boolean>(true)

    // Pagination states
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [totalPages, setTotalPages] = useState<number>(1)
    const [totalOrders, setTotalOrders] = useState<number>(0)
    const ordersPerPage = 10

    useEffect(() => {
        dispatch(setPageTitle("Orders"))
    }, [dispatch])

    // Load orders with pagination (100 orders per page from past 30 days)
    const loadOrdersWithPagination = async (page = 1, isInitialLoad = false) => {
        if (isInitialLoad) {
            setInitialLoading(true)
        } else {
            setLoading(true)
        }
        setError(null)
        try {
            const response = await fetchOrdersByStore()

            const endDate = new Date()
            const startDate = new Date()
            startDate.setDate(startDate.getDate() - 30)

            const filteredOrders = response.data
                .filter((order: any) => {
                    const orderDate = new Date(order.createdAt)
                    return orderDate >= startDate && orderDate <= endDate
                })
                .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

            setAllOrders(filteredOrders)

            // Apply pagination to filteredOrders
            const totalFilteredOrders = filteredOrders.length
            const calculatedTotalPages = Math.ceil(totalFilteredOrders / ordersPerPage)
            const startIndex = (page - 1) * ordersPerPage
            const endIndex = startIndex + ordersPerPage
            const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

            setOrders(paginatedOrders)
            setTotalPages(calculatedTotalPages)
            setTotalOrders(totalFilteredOrders)
            setCurrentPage(page)
        } catch (err) {
            setError("Failed to load orders.")
            console.error(err)
        } finally {
            if (isInitialLoad) {
                setInitialLoading(false)
            } else {
                setLoading(false)
            }
        }
    }

    const handleSearch = async (phoneNumber: string) => {
        setSearchLoading(true)
        setError(null)
        setIsSearchMode(true)

        try {
            const response = await searchOrderByPhoneNumber(phoneNumber)
            setOrders(response || [])
            setTotalPages(1)
            setTotalOrders(response?.length || 0)
            setCurrentPage(1)
        } catch (err: any) {
            console.error("Search error:", err)
            // Don't set error state for "no orders found" - let table handle it
            setOrders([])
            setTotalPages(1)
            setTotalOrders(0)
            setCurrentPage(1)
        } finally {
            setSearchLoading(false)
        }
    }

    const handleClearSearch = () => {
        setSearch("")
        setIsSearchMode(false)
        setError(null)

        // If date filter is active, don't reload - just clear search mode
        if (!isDateFilterMode) {
            loadOrdersWithPagination(1, false)
        }
    }

    const handleDateFilter = (selectedDates: Date[]) => {
        if (selectedDates.length === 2) {
            setDateFilterLoading(true)
            setError(null)
            setIsDateFilterMode(true)

            const startDate = new Date(selectedDates[0])
            startDate.setHours(0, 0, 0, 0)

            const endDate = new Date(selectedDates[1])
            endDate.setHours(23, 59, 59, 999)

            try {
                let dataToFilter = allOrders

                // If we're in search mode, we should maintain the search context
                // and not show date-filtered results from all orders
                if (isSearchMode) {
                    // In search mode, if there are no search results,
                    // date filter should also show no results
                    if (orders.length === 0) {
                        setOrders([])
                        setTotalPages(1)
                        setTotalOrders(0)
                        setCurrentPage(1)
                        setFilteredOrders([])
                        setDateFilterLoading(false)
                        return
                    }
                    // If there are search results, filter those by date
                    dataToFilter = orders
                }

                const filtered = dataToFilter.filter((order) => {
                    const orderDate = new Date(order.createdAt)
                    return orderDate >= startDate && orderDate <= endDate
                })

                const sorted = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

                // Store filtered data for pagination
                setFilteredOrders(sorted)

                // Apply pagination to first page
                const totalFiltered = sorted.length
                const calculatedTotalPages = Math.ceil(totalFiltered / ordersPerPage)
                const startIndex = 0
                const endIndex = startIndex + ordersPerPage
                const paginated = sorted.slice(startIndex, endIndex)

                setOrders(paginated)
                setTotalPages(calculatedTotalPages)
                setTotalOrders(totalFiltered)
                setCurrentPage(1)
            } catch (err) {
                console.error("Date filter error:", err)
                setError("Failed to filter orders by date.")
                setOrders([])
            } finally {
                setDateFilterLoading(false)
            }
        }
    }

    const handleClearDateFilter = () => {
        setDateRange([])
        setIsDateFilterMode(false)
        setFilteredOrders([])
        setError(null)
        if (flatpickrRef.current) {
            flatpickrRef.current.flatpickr.clear()
        }
        loadOrdersWithPagination(1, false)
    }

    // Replace the initial load useEffect
    useEffect(() => {
        if (!hasInitiallyLoaded) {
            loadOrdersWithPagination(1, true)
            setHasInitiallyLoaded(true)
        }
    }, [hasInitiallyLoaded])

    // Replace the debounced search effect
    useEffect(() => {
        // Don't run this effect during initial load
        if (!hasInitiallyLoaded) return

        const timeoutId = setTimeout(() => {
            if (search.trim()) {
                // If there's a search term, perform search
                handleSearch(search.trim())
            } else if (isSearchMode) {
                // If search was cleared, reset to default view
                setIsSearchMode(false)
                if (!isDateFilterMode) {
                    loadOrdersWithPagination(1)
                }
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [search, hasInitiallyLoaded]) // Removed isDateFilterMode dependency

    // Clear success message after 3 seconds
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage("")
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [successMessage])

    const toggleRow = (rowId: string) => {
        setExpandedRow(expandedRow === rowId ? null : rowId)
    }

    const handleCompleteOrder = async (orderId: string) => {
        try {
            setCompletingOrders((prev) => new Set(prev).add(orderId))

            const response = await updateOrderById(orderId)

            if (response.data.success) {
                setOrders((prevOrders) =>
                    prevOrders.map((order) => {
                        const currentOrderId = order.id || order.orderId
                        if (currentOrderId === orderId) {
                            return { ...order, status: "Completed" }
                        }
                        return order
                    }),
                )

                setSuccessMessage(`Order ${orderId} completed successfully!`)
            } else {
                throw new Error("Failed to complete order")
            }
        } catch (error: any) {
            console.error("Error completing order:", error)
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to complete order"
            setError(errorMessage)
            setTimeout(() => setError(null), 5000)
        } finally {
            setCompletingOrders((prev) => {
                const newSet = new Set(prev)
                newSet.delete(orderId)
                return newSet
            })
        }
    }

    const getStatusButton = (status: string) => {
        let btnClass = "btn btn-outline-primary btn-sm rounded-full w-full"
        if (status === "Completed") btnClass = "btn btn-outline-success btn-sm rounded-full w-full"
        else if (status === "Rejected") btnClass = "btn btn-outline-danger btn-sm rounded-full w-full"
        else if (status === "On Hold") btnClass = "btn btn-outline-warning btn-sm rounded-full w-full"

        return (
            <button type="button" className={btnClass} disabled={status === "Rejected"}>
                {status}
            </button>
        )
    }

    const formatDateTime = (dateTime: string) => {
        try {
            return new Date(dateTime).toLocaleString()
        } catch {
            return dateTime
        }
    }

    // Handle page changes
    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            setExpandedRow(null) // Close any expanded rows

            if (!isSearchMode && !isDateFilterMode) {
                loadOrdersWithPagination(page, false)
            } else if (isDateFilterMode && filteredOrders.length > 0) {
                // Handle pagination for date filtered data
                const startIndex = (page - 1) * ordersPerPage
                const endIndex = startIndex + ordersPerPage
                const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

                setOrders(paginatedOrders)
                setCurrentPage(page)
            } else {
                setCurrentPage(page)
            }
        }
    }

    // Generate page numbers for pagination
    const getVisiblePages = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= maxVisiblePages; i++) {
                    pages.push(i)
                }
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pages.push(i)
                }
            }
        }

        return pages
    }

    return (
        <div className="mb-8 px-4 sm:px-0">
            {/* <ul className="flex space-x-2 rtl:space-x-reverse mb-6">
                <li>
                    <Link to="/merchant" className="text-primary hover:underline">
                        Dashboard
                    </Link>
                </li>
                <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
                    <span>Orders</span>
                </li>
            </ul> */}

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>{successMessage}</span>
                </div>
            )}

            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

            {/* Search and Filter Section */}
            <div className="mb-4">
                <div className="flex gap-2 flex-wrap">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-[400px]">
                        <input
                            type="text"
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Search by Phone Number"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <svg
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>

                        {searchLoading && (
                            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            </div>
                        )}

                        {search && !searchLoading && (
                            <button
                                onClick={handleClearSearch}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white text-sm px-2 py-1 rounded hover:bg-gray-600"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Date Filter */}
                    <div className="relative w-full sm:w-[300px]">
                        <div className="relative">
                            <IoMdFunnel className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 pointer-events-none z-10" />
                            <FlatpickrReact
                                ref={flatpickrRef}
                                value={dateRange}
                                onChange={(selectedDates) => {
                                    setDateRange(selectedDates)
                                    handleDateFilter(selectedDates)
                                }}
                                options={{
                                    mode: "range",
                                    dateFormat: "d F Y",
                                }}
                                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Filter by Date Range"
                            />

                            {dateFilterLoading && (
                                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                </div>
                            )}

                            {dateRange.length > 0 && !dateFilterLoading && (
                                <button
                                    onClick={handleClearDateFilter}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-500 text-white text-sm px-2 py-1 rounded hover:bg-gray-600"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Status Messages */}
                <div className="mt-2 space-y-1">
                    {isSearchMode && isDateFilterMode && (
                        <div className="text-sm text-gray-600">
                            {searchLoading || dateFilterLoading
                                ? "Searching and filtering..."
                                : `Found ${orders.length} order${orders.length !== 1 ? "s" : ""} for "${search}" in selected date range`}
                        </div>
                    )}

                    {isSearchMode && !isDateFilterMode && (
                        <div className="text-sm text-gray-600">
                            {searchLoading
                                ? "Searching..."
                                : `Found ${orders.length} order${orders.length !== 1 ? "s" : ""} for "${search}"`}
                        </div>
                    )}

                    {!isSearchMode && isDateFilterMode && (
                        <div className="text-sm text-gray-600">
                            {dateFilterLoading
                                ? "Filtering by date..."
                                : `Found ${orders.length} order${orders.length !== 1 ? "s" : ""} in selected date range`}
                        </div>
                    )}

                    {!isSearchMode && !isDateFilterMode && (
                        <div className="text-sm text-gray-600">
                            Showing {orders.length} orders from page {currentPage} of {totalPages} (Total: {totalOrders} orders from
                            past 30 days)
                        </div>
                    )}
                </div>
            </div>

            {(loading || initialLoading) && (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">{initialLoading ? "Loading orders..." : "Loading..."}</span>
                </div>
            )}

            {!loading && !initialLoading && (
                <>
                    {/* Responsive Table View for All Devices */}
                    <div className="relative">
                        {/* Scrollable Table Container */}
                        <div className="max-h-[500px] overflow-y-auto rounded-lg shadow border border-gray-200">
                            <table className="w-full border-collapse bg-white">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th className="border border-gray-300 p-2 sm:p-3 text-center font-semibold text-xs sm:text-sm">
                                            Details
                                        </th>
                                        <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">ID</th>
                                        <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">
                                            Status
                                        </th>
                                        <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">
                                            Date & Time
                                        </th>
                                        <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">
                                            Name
                                        </th>
                                        <th className="border border-gray-300 p-2 sm:p-3 text-left font-semibold text-xs sm:text-sm">
                                            Phone
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="border border-gray-300 p-8 text-center text-gray-500">
                                                {isSearchMode
                                                    ? `No orders found for phone number "${search}" in this store`
                                                    : isDateFilterMode
                                                        ? "No orders found in the selected date range"
                                                        : "No orders found."}
                                            </td>
                                        </tr>
                                    )}
                                    {orders?.map((row) => {
                                        const rowId = row.id || row.orderId
                                        const isCompleting = completingOrders.has(rowId)

                                        return (
                                            <React.Fragment key={rowId}>
                                                <tr className="border border-gray-300 hover:bg-gray-50">
                                                    <td className="border border-gray-300 p-2 sm:p-3 text-center">
                                                        <button
                                                            onClick={() => toggleRow(rowId)}
                                                            className="text-xl sm:text-2xl focus:outline-none hover:text-primary transition-colors"
                                                        >
                                                            {expandedRow === rowId ? <IoIosArrowDropdown /> : <IoIosArrowDropright />}
                                                        </button>
                                                    </td>
                                                    <td className="border border-gray-300 p-2 sm:p-3 text-xs sm:text-sm">
                                                        {row.orderId || row.id}
                                                    </td>
                                                    <td className="border border-gray-300 p-2 sm:p-3 text-xs sm:text-sm">
                                                        {getStatusButton(row.status)}
                                                    </td>
                                                    <td className="border border-gray-300 p-2 sm:p-3 text-xs sm:text-sm">
                                                        {formatDateTime(row.createdAt)}
                                                    </td>
                                                    <td className="border border-gray-300 p-2 sm:p-3 text-xs sm:text-sm">{row.name}</td>
                                                    <td className="border border-gray-300 p-2 sm:p-3 text-xs sm:text-sm">{row.number}</td>
                                                </tr>
                                                {expandedRow === rowId && (
                                                    <tr>
                                                        <td colSpan={6} className="border border-gray-300 p-0">
                                                            <AccordionContent
                                                                status={row.status}
                                                                orderId={rowId}
                                                                qrUrl={row.qrUrl}
                                                                onCompleteOrder={handleCompleteOrder}
                                                                isCompletingOrder={isCompleting}
                                                            />
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {totalPages && (
                            <ul className="mt-6 mb-10 flex justify-center items-center space-x-1 rtl:space-x-reverse">
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary disabled:opacity-50"
                                    >
                                        <MdArrowBackIos />
                                    </button>
                                </li>

                                {getVisiblePages().map((pageNum) => (
                                    <li key={pageNum}>
                                        <button
                                            type="button"
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3.5 py-2 rounded-full transition font-semibold ${currentPage === pageNum
                                                    ? "bg-primary text-white"
                                                    : "bg-white-light text-dark hover:text-white hover:bg-primary"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    </li>
                                ))}

                                <li>
                                    <button
                                        type="button"
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-full transition bg-white-light text-dark hover:text-white hover:bg-primary disabled:opacity-50"
                                    >
                                        <MdOutlineArrowForwardIos />
                                    </button>
                                </li>
                            </ul>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

export default OrdersDemo
