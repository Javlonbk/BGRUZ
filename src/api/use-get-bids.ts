import { useState, useCallback, useEffect, useRef } from 'react'
import { postData2 } from '@/api/api'
import { useFilter } from '@/context/filter-context'

interface Bid {
    _id?: string
    client: { organizationName: string }
    cargoTitle: string
    price: number | null
    status: string | null
}

interface BidFilter {
    [key: string]: any
}

export const useGetBids = (size: number, sendRequest: boolean = true) => {
    const [bids, setBids] = useState<Bid[]>([]) // Ensure it's always an array
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState<boolean>(true)
    const { filters } = useFilter()

    const prevFiltersRef = useRef<BidFilter | null>(null)
    const prevSizeRef = useRef<number | null>(null)
    const isMounted = useRef(false)

    const fetchBids = useCallback(
        async (force = false) => {
            setLoading(true)
            setError(null)

            try {
                const token = localStorage.getItem('authToken') || ''

                const isFiltersChanged = JSON.stringify(prevFiltersRef.current) !== JSON.stringify(filters)
                const isSizeChanged = prevSizeRef.current !== size

                if (!force && !isFiltersChanged && !isSizeChanged) {
                    setLoading(false)
                    return
                }

                prevFiltersRef.current = filters
                prevSizeRef.current = size

                // getting bid data from API
                const response = await postData2<{ items: Bid[]; total: number }>(
                    'api/v1/bids/getbatch',
                    { size, filter: filters },
                    token
                )

                setBids(response.items)
                setHasMore(response.items.length < response.total)
            } catch (err) {
                console.error('Ошибка при загрузке заявок:', err)
                setError('Не удалось загрузить заявки. Попробуйте позже.')
            } finally {
                setLoading(false)
            }
        },
        [size, filters]
    )

    useEffect(() => {
        if (isMounted.current && sendRequest) {
            fetchBids()
        } else {
            isMounted.current = true
        }
    }, [size, filters])

    const refreshBids = useCallback(() => {
        fetchBids(true)
    }, [fetchBids])

    // Fix: Ensure addBid is always a valid function
    const addBid = useCallback((newBid: Bid) => {
        setBids(prevBids => [newBid, ...(prevBids || [])]) // Ensure `prevBids` is always an array
        console.log('added')
    }, [])

    return {
        bids,
        loading,
        error,
        hasMore,
        refreshBids,
        addBid, // Ensure this is returned
    }
}
