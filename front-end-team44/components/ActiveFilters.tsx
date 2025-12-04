import React from 'react'
import { X } from 'lucide-react'
import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { AlarmFilters } from '../types'

interface ActiveFiltersProps {
  filters: AlarmFilters
  onRemoveFilter: (filterKey: keyof AlarmFilters) => void
}

const ActiveFilters: React.FC<ActiveFiltersProps> = ({ filters, onRemoveFilter }) => {
  const activeFilters = []

  // Check each filter and create display items
  if (filters.severity && filters.severity !== 'all') {
    activeFilters.push({
      key: 'severity' as keyof AlarmFilters,
      label: 'Severity',
      value: filters.severity.charAt(0).toUpperCase() + filters.severity.slice(1)
    })
  }

  if (filters.equipment_id && filters.equipment_id.trim() !== '') {
    activeFilters.push({
      key: 'equipment_id' as keyof AlarmFilters,
      label: 'Equipment',
      value: filters.equipment_id
    })
  }

  if (filters.production_step && filters.production_step !== 'all') {
    const stepLabels: Record<string, string> = {
      'polymerization': 'Polymerization',
      'mixing': 'Mixing',
      'drying': 'Drying',
      'packaging': 'Packaging',
      'qa': 'Quality Assurance'
    }
    
    activeFilters.push({
      key: 'production_step' as keyof AlarmFilters,
      label: 'Production Step',
      value: stepLabels[filters.production_step] || filters.production_step
    })
  }

  if (filters.batch_id && filters.batch_id.trim() !== '') {
    activeFilters.push({
      key: 'batch_id' as keyof AlarmFilters,
      label: 'Batch ID',
      value: filters.batch_id
    })
  }

  if (filters.start_date && filters.start_date.trim() !== '') {
    const date = new Date(filters.start_date)
    activeFilters.push({
      key: 'start_date' as keyof AlarmFilters,
      label: 'Start Date',
      value: date.toLocaleDateString()
    })
  }

  if (filters.end_date && filters.end_date.trim() !== '') {
    const date = new Date(filters.end_date)
    activeFilters.push({
      key: 'end_date' as keyof AlarmFilters,
      label: 'End Date',
      value: date.toLocaleDateString()
    })
  }

  // If no active filters, don't render anything
  if (activeFilters.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-gray-700 dark:text-[#e5e5e5]">
        Active filters:
      </span>
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="bg-gray-200 dark:bg-[#404040] text-gray-700 dark:text-[#e5e5e5] hover:bg-gray-300 dark:hover:bg-[#4e4f51] transition-colors pr-1 pl-3 border-0"
        >
          <span className="mr-2">
            <span className="font-medium">{filter.label}:</span> {filter.value}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0.5 hover:bg-gray-300 dark:hover:bg-[#4e4f51] rounded-sm"
            onClick={() => onRemoveFilter(filter.key)}
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  )
}

export default ActiveFilters