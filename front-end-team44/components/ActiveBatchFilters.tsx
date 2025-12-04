import React from 'react'
import { Badge } from "./components/ui/badge"
import { Button } from "./components/ui/button"
import { X } from "lucide-react"
import { BatchFilters } from '../types/batches'

interface ActiveBatchFiltersProps {
  filters: BatchFilters
  onRemoveFilter: (key: keyof BatchFilters) => void
}

export function ActiveBatchFilters({ filters, onRemoveFilter }: ActiveBatchFiltersProps) {
  const activeFilters = []

  if (filters.execution_status !== 'all') {
    activeFilters.push({
      key: 'execution_status' as keyof BatchFilters,
      label: 'Status',
      value: filters.execution_status.replace('_', ' ')
    })
  }

  if (filters.batch_number) {
    activeFilters.push({
      key: 'batch_number' as keyof BatchFilters,
      label: 'Batch Number',
      value: filters.batch_number
    })
  }

  if (filters.production_order_number) {
    activeFilters.push({
      key: 'production_order_number' as keyof BatchFilters,
      label: 'Production Order',
      value: filters.production_order_number
    })
  }

  if (filters.recipe_id) {
    activeFilters.push({
      key: 'recipe_id' as keyof BatchFilters,
      label: 'Recipe ID',
      value: filters.recipe_id
    })
  }

  if (filters.start_date) {
    activeFilters.push({
      key: 'start_date' as keyof BatchFilters,
      label: 'Start Date From',
      value: new Date(filters.start_date).toLocaleDateString()
    })
  }

  if (filters.end_date) {
    activeFilters.push({
      key: 'end_date' as keyof BatchFilters,
      label: 'Start Date To',
      value: new Date(filters.end_date).toLocaleDateString()
    })
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center mr-2">
        Active filters:
      </span>
      {activeFilters.map(filter => (
        <Badge 
          key={filter.key} 
          variant="secondary" 
          className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        >
          <span className="mr-1">
            {filter.label}: {filter.value}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 ml-1 hover:bg-transparent"
            onClick={() => onRemoveFilter(filter.key)}
          >
            <X className="h-3 w-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200" />
          </Button>
        </Badge>
      ))}
    </div>
  )
}