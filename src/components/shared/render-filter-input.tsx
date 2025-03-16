// import { useEffect } from 'react'
import { DateRangePicker } from './range-picker'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
// import { useFilter } from '@/context/filter-context'

interface FilterInputProps {
    column: any
    handleFilterChange: (id: string, val: any) => void
    sortingState?: 'asc' | 'desc' | false
}

export function FilterInput({ column, handleFilterChange, sortingState }: FilterInputProps) {
    // const { pageType } = useFilter()
    const handleChange = (value: any) => {
        column.setFilterValue(value)
        handleFilterChange(column.id, value)
    }

    const handleSortToggle = (e: React.MouseEvent) => {
        e.stopPropagation()

        const currentDirection = column.getIsSorted()

        column.toggleSorting()

        const newDirection = column.getIsSorted()

        if (newDirection) {
            const sortParams = {
                filterFieldName: column.id,
                direction: newDirection === 'asc' ? 'ascending' : 'descending' || currentDirection

                // startFrom: {
                //    fieldValue:
                //    id:
                // }
            }
            console.log('sortParams', sortParams)

            handleFilterChange('sort', sortParams)
        }
    }

    const getStringValue = (value: string | string[] | null): string => {
        if (Array.isArray(value)) {
            return value.join(',')
        }
        return value ?? ''
    }

    const renderSortingIndicator = () => {
        if (!column.getCanSort()) return null

        return (
            <button
                onClick={handleSortToggle}
                className='relative -left-7 focus:outline-none'
                aria-label={
                    sortingState === 'asc'
                        ? 'Сортировать по убыванию'
                        : sortingState === 'desc'
                          ? 'Отменить сортировку'
                          : 'Сортировать по возрастанию'
                }
            >
                {sortingState ? (
                    sortingState === 'asc' ? (
                        <ArrowUp className='h-4 w-4' />
                    ) : (
                        <ArrowDown className='h-4 w-4' />
                    )
                ) : (
                    <ArrowUpDown className='h-4 w-4 opacity-50' />
                )}
            </button>
        )
    }

    switch (column.columnDef.filterType) {
        case 'exact':
            return (
                <div className='flex'>
                    <Input
                        value={(column.getFilterValue() as string) ?? ''}
                        onChange={e => handleChange(e.target.value)}
                        placeholder='Точное'
                        className='text-xs min-w-32 h-7 bg-white'
                    />

                    {renderSortingIndicator()}
                </div>
            )
        case 'select':
            return (
                <div className='flex gap-3 bg-white rounded-md pr-3'>
                    <Select
                        value={getStringValue(column.getFilterValue())}
                        onValueChange={value => {
                            const selectedOption = column.columnDef.filterOptions?.find(option =>
                                Array.isArray(option.value) ? option.value.join(',') === value : option.value === value
                            )
                            const newValue = selectedOption ? selectedOption.value : []
                            column.setFilterValue(newValue)
                            handleFilterChange(column.id, newValue)
                        }}
                    >
                        <SelectTrigger className='text-xs min-w-full h-7 bg-transparent border-0'>
                            <SelectValue placeholder='Выберите' />
                        </SelectTrigger>
                        <SelectContent>
                            {column.columnDef.filterOptions?.map(option => (
                                <SelectItem
                                    key={Array.isArray(option.value) ? option.value.join(',') : option.value}
                                    value={Array.isArray(option.value) ? option.value.join(',') : option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {renderSortingIndicator()}
                </div>
            )
        case 'dateRange':
            return (
                <div className='flex w-full gap-4 bg-white rounded-md '>
                    <DateRangePicker
                        value={column.getFilterValue() as { from: Date; to?: Date } | undefined}
                        onChange={range => handleChange(range)}
                        placeholder='Дата'
                        className='text-xs'
                    />

                    {renderSortingIndicator()}
                </div>
            )
        case 'fuzzy':
            return (
                <div className='flex'>
                    <Input
                        value={(column.getFilterValue() as string) ?? ''}
                        onChange={e => handleChange(e.target.value)}
                        placeholder='Поиск...'
                        className='text-xs h-7  min-w-32 bg-white'
                    />

                    {renderSortingIndicator()}
                </div>
            )
        case 'range':
            return <button className='text-xs h-7 bg-white px-2'>{column.columnDef.header}</button>
        default:
            return null
    }
}
