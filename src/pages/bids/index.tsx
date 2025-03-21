import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { FilterProvider, useFilter } from '@/context/filter-context'
import { TotalsProvider } from '@/context/totals-context'

import { useGetBids } from '@/api/use-get-bids'
import { useWebSocket } from '@/api/use-websocket'

import { lazy } from 'react'

const BgruzHeader = lazy(() => import('@/components/shared/bgruz-header'))
const PageHead = lazy(() => import('@/components/shared/page-head'))
const BidsTable = lazy(() => import('./components/bids-table/bids-table'))
const BidsTableMobile = lazy(() => import('./components/bids-table/bids-table-mobile'))

export default function BidsPage() {
    const [searchParams] = useSearchParams()
    const [size, setSize] = useState(Number(searchParams.get('size')) || 20)
    const isMobile = useMemo(() => window.innerWidth <= 768, [])

    const { bids, hasMore, loading, refreshBids, addBid } = useGetBids(size, !isMobile)
    const { setFilters } = useFilter()

    const loadMore = () => {
        if (hasMore) {
            setSize(prev => prev + 50)
        }
    }
    useWebSocket(refreshBids, () => { })

    // ! если что тут надо попробовать добавить ScrollArea
    return (
        <div className='px-0 md:px-4'>
            <PageHead title='Заявки' />
            <TotalsProvider data={bids}>
                <BgruzHeader />
                <FilterProvider onFiltersChange={setFilters}>
                    <div>
                        <div className='hidden md:block'>
                            //getting data from context
                            <BidsTable bids={bids || []} loading={loading} loadMore={loadMore} hasMore={hasMore} addBid={addBid} />
                        </div>

                        <div className='md:hidden'>
                            <BidsTableMobile bids={bids || []} />
                        </div>
                    </div>
                </FilterProvider>
            </TotalsProvider>
        </div>
    )
}
