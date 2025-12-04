import React from 'react'
import { Badge } from "./components/ui/badge"
import { Card, CardContent } from "./components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./components/ui/table"
import { Skeleton } from "./components/ui/skeleton"
import { Batch, ExecutionStatus } from '../types/batches'

interface BatchesTableProps {
  batches: Batch[]
  isLoading?: boolean
}

const ExecutionStatusConfig: Record<string, { color: string; label: string }> = {
  'COMPLETED': {
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
    label: 'Completed'
  },
  'RUNNING': {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    label: 'Running'
  },
  'IN_PROGRESS': {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    label: 'In Progress'
  },
  'PLANNED': {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    label: 'Planned'
  },
  'SCHEDULED': {
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    label: 'Scheduled'
  },
  'ABORTED': {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
    label: 'Aborted'
  },
  'FAILED': {
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
    label: 'Failed'
  }
}

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime)
  const end = new Date(endTime)
  const diffMs = end.getTime() - start.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  
  if (diffHours > 0) {
    return `${diffHours}h ${diffMinutes}m`
  }
  return `${diffMinutes}m`
}

export function BatchesTable({ batches, isLoading }: BatchesTableProps) {
  if (isLoading) {
    return (
      <Card className="bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-0">
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 w-20 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-32 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" />
                <Skeleton className="h-4 w-40 bg-gray-200 dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (batches.length === 0) {
    return (
      <Card className="bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No batches found with the current filters.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card className="bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600">
                  <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Batch Number</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Production Order</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Recipe ID</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Status</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Planned Start</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Actual Start</TableHead>
                  <TableHead className="text-gray-700 dark:text-gray-300 font-medium">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map(batch => (
                  <TableRow 
                    key={batch.batch_id} 
                    className="border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                      {batch.batch_number}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {batch.production_order_number}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {batch.recipe_id}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${ExecutionStatusConfig[batch.execution_status]?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'} font-medium`}
                      >
                        {ExecutionStatusConfig[batch.execution_status]?.label || batch.execution_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {formatDateTime(batch.planned_start_time)}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {formatDateTime(batch.actual_start_time)}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      {batch.actual_end_time ? 
                        calculateDuration(batch.actual_start_time, batch.actual_end_time) : 
                        '-'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {batches.map(batch => (
          <Card 
            key={batch.batch_id} 
            className="bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {batch.batch_number}
                  </h3>
                  <Badge 
                    variant="outline" 
                    className={`${ExecutionStatusConfig[batch.execution_status]?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'} font-medium`}
                  >
                    {ExecutionStatusConfig[batch.execution_status]?.label || batch.execution_status}
                  </Badge>
                </div>
                
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Production Order:</span>
                    <span className="text-gray-900 dark:text-gray-100">{batch.production_order_number}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Recipe ID:</span>
                    <span className="text-gray-900 dark:text-gray-100">{batch.recipe_id}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Planned Start:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatDateTime(batch.planned_start_time)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Actual Start:</span>
                    <span className="text-gray-900 dark:text-gray-100">{formatDateTime(batch.actual_start_time)}</span>
                  </div>

                  {batch.actual_end_time && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {calculateDuration(batch.actual_start_time, batch.actual_end_time)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  )
}