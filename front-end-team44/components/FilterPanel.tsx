import React, { useState } from 'react'
import { Filter, ChevronDown, ChevronUp, Search, Calendar, X } from 'lucide-react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { Badge } from './components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './components/ui/collapsible'
import { AlarmFilters, AlarmSeverity, ProductionStep } from '../types'

interface FilterPanelProps {
  filters: AlarmFilters
  onFiltersChange: (filters: Partial<AlarmFilters>) => void
  onClearFilters: () => void
}

const severityOptions: { value: AlarmSeverity | 'all', label: string, color: string }[] = [
  { value: 'all', label: 'All', color: 'bg-gray-500' },
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
  { value: 'warning', label: 'Warning', color: 'bg-amber-500' },
  { value: 'info', label: 'Info', color: 'bg-blue-500' }
]

const productionStepOptions: { value: ProductionStep | 'all', label: string }[] = [
  { value: 'all', label: 'All Steps' },
  { value: 'polymerization', label: 'Polymerization' },
  { value: 'mixing', label: 'Mixing' },
  { value: 'drying', label: 'Drying' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'qa', label: 'Quality Assurance' }
]

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const [isOpen, setIsOpen] = useState(true)

  // Count active filters (excluding page and limit)
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'page' || key === 'limit') return false
    return value && value !== '' && value !== 'all'
  }).length

  const handleSeverityClick = (severity: AlarmSeverity | 'all') => {
    onFiltersChange({ severity })
  }

  return (
    <div className="bg-gray-100 dark:bg-[#2f2f2f] rounded-xl border border-gray-200 dark:border-[#404040]">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#363636] transition-colors rounded-xl">
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Filters
              </h2>
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="bg-gray-200 dark:bg-[#404040] text-gray-700 dark:text-[#e5e5e5] border-0">
                  {activeFilterCount}
                </Badge>
              )}
            </div>
            {isOpen ? (
              <ChevronUp className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 sm:px-6 pb-6 space-y-6">
            {/* Severity Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-[#e5e5e5]">
                Severity
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {severityOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSeverityClick(option.value)}
                    className={`flex items-center space-x-2 justify-start transition-colors ${
                      filters.severity === option.value 
                        ? 'bg-gray-200 dark:bg-[#4e4f51] text-gray-900 dark:text-white border-gray-300 dark:border-[#4e4f51]' 
                        : 'hover:bg-gray-100 dark:hover:bg-[#363636]'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${option.color}`} />
                    <span>{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Main Filters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Equipment ID */}
              <div className="space-y-2">
                <Label htmlFor="equipment_id" className="text-sm font-medium text-gray-700 dark:text-[#e5e5e5]">
                  Equipment ID
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="equipment_id"
                    value={filters.equipment_id || ''}
                    onChange={(e) => onFiltersChange({ equipment_id: e.target.value })}
                    placeholder="e.g., REACTOR-A1"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Production Step */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-[#e5e5e5]">
                  Production Step
                </Label>
                <Select
                  value={filters.production_step || 'all'}
                  onValueChange={(value) => onFiltersChange({ production_step: value as ProductionStep | 'all' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {productionStepOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Batch ID */}
              <div className="space-y-2">
                <Label htmlFor="batch_id" className="text-sm font-medium text-gray-700 dark:text-[#e5e5e5]">
                  Batch ID
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="batch_id"
                    value={filters.batch_id || ''}
                    onChange={(e) => onFiltersChange({ batch_id: e.target.value })}
                    placeholder="e.g., BATCH-2024-001"
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="start_date" className="text-sm font-medium text-gray-700 dark:text-[#e5e5e5]">
                  Start Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="start_date"
                    type="date"
                    value={filters.start_date || ''}
                    onChange={(e) => onFiltersChange({ start_date: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <Label htmlFor="end_date" className="text-sm font-medium text-gray-700 dark:text-[#e5e5e5]">
                  End Date
                </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="end_date"
                    type="date"
                    value={filters.end_date || ''}
                    onChange={(e) => onFiltersChange({ end_date: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-[#404040]">
              <button
                onClick={onClearFilters}
                className="text-sm text-gray-500 dark:text-[#e5e5e5] hover:text-gray-700 dark:hover:text-white underline transition-colors"
              >
                Clear all filters
              </button>
              <div className="text-sm text-gray-500 dark:text-[#e5e5e5]">
                {activeFilterCount > 0 && `${activeFilterCount} filter${activeFilterCount !== 1 ? 's' : ''} applied`}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default FilterPanel