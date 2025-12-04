import React from 'react'
import { Card, CardContent } from "./components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./components/ui/collapsible"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select"
import { ChevronDown, ChevronUp } from "lucide-react"
import { BatchFilters, ExecutionStatus } from '../types/batches'

interface BatchFilterPanelProps {
  filters: BatchFilters
  onFiltersChange: (filters: BatchFilters) => void
  isOpen: boolean
  onToggle: () => void
}

const ExecutionStatusColors: Record<ExecutionStatus, string> = {
  [ExecutionStatus.COMPLETED]: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-800/30',
  [ExecutionStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-800/30',
  [ExecutionStatus.RUNNING]: 'bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-800/30',
  [ExecutionStatus.PLANNED]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-800/30',
  [ExecutionStatus.SCHEDULED]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-800/30',
  [ExecutionStatus.ABORTED]: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-800/30',
  [ExecutionStatus.FAILED]: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-800/30',
}

export function BatchFilterPanel({ filters, onFiltersChange, isOpen, onToggle }: BatchFilterPanelProps) {
  const handleFilterChange = (key: keyof BatchFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onFiltersChange({
      execution_status: 'all',
      batch_number: '',
      production_order_number: '',
      recipe_id: '',
      start_date: '',
      end_date: ''
    })
  }

  const hasActiveFilters = 
    filters.execution_status !== 'all' ||
    filters.batch_number !== '' ||
    filters.production_order_number !== '' ||
    filters.recipe_id !== '' ||
    filters.start_date !== '' ||
    filters.end_date !== ''

  return (
    <Card className="bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Filters</h3>
                  {hasActiveFilters && (
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                )}
              </div>
            </CardContent>
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4">
            <div className="space-y-4">
              {/* Execution Status Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Execution Status
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filters.execution_status === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleFilterChange('execution_status', 'all')}
                    className={filters.execution_status === 'all' ? 
                      'bg-gray-600 hover:bg-gray-700 text-white dark:bg-gray-600 dark:hover:bg-gray-700' : 
                      'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
                    }
                  >
                    All
                  </Button>
                  {Object.values(ExecutionStatus).map(status => (
                    <Button
                      key={status}
                      variant={filters.execution_status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('execution_status', status)}
                      className={filters.execution_status === status ? 
                        `${ExecutionStatusColors[status]}` : 
                        'bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600'
                      }
                    >
                      {status.replace('_', ' ')}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Text Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Batch Number
                  </label>
                  <Input
                    placeholder="Search batch number..."
                    value={filters.batch_number}
                    onChange={(e) => handleFilterChange('batch_number', e.target.value)}
                    className="bg-white border-gray-300 focus:border-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:focus:border-gray-500"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Production Order
                  </label>
                  <Input
                    placeholder="Search production order..."
                    value={filters.production_order_number}
                    onChange={(e) => handleFilterChange('production_order_number', e.target.value)}
                    className="bg-white border-gray-300 focus:border-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:focus:border-gray-500"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Recipe ID
                  </label>
                  <Input
                    placeholder="Search recipe ID..."
                    value={filters.recipe_id}
                    onChange={(e) => handleFilterChange('recipe_id', e.target.value)}
                    className="bg-white border-gray-300 focus:border-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:focus:border-gray-500"
                  />
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Start Date From
                  </label>
                  <Input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="bg-white border-gray-300 focus:border-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:focus:border-gray-500"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                    Start Date To
                  </label>
                  <Input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="bg-white border-gray-300 focus:border-gray-500 dark:bg-gray-800 dark:border-gray-600 dark:focus:border-gray-500"
                  />
                </div>
              </div>

              {/* Reset Button */}
              {hasActiveFilters && (
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetFilters}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}