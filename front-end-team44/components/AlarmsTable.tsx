import React from 'react'
import { Clock, AlertCircle, Loader2 } from 'lucide-react'
import { Badge } from './components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table'
import { Card, CardContent } from './components/ui/card'
import { Skeleton } from './components/ui/skeleton'
import { Alarm, AlarmSeverity } from '../types'

interface AlarmsTableProps {
  alarms: Alarm[]
  loading: boolean
  error: string | null
}

const getSeverityConfig = (severity: AlarmSeverity) => {
  switch (severity) {
    case 'critical':
      return {
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
        border: 'border-l-red-500',
        dot: 'bg-red-500'
      }
    case 'warning':
      return {
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        border: 'border-l-yellow-500',
        dot: 'bg-yellow-500'
      }
    case 'info':
      return {
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        border: 'border-l-blue-500',
        dot: 'bg-blue-500'
      }
    default:
      return {
        badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600',
        border: 'border-l-gray-500',
        dot: 'bg-gray-500'
      }
  }
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}

const capitalizeStep = (step: string) => {
  return step.charAt(0).toUpperCase() + step.slice(1)
}

const LoadingState: React.FC = () => (
  <div className="p-8 text-center">
    <div className="flex items-center justify-center space-x-2 mb-4">
      <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      <span className="text-gray-600 dark:text-gray-400">Loading alarms...</span>
    </div>
    <div className="space-y-3 max-w-2xl mx-auto">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  </div>
)

const EmptyState: React.FC = () => (
  <div className="p-12 text-center">
    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
      No alarms found
    </h3>
    <p className="text-gray-500 dark:text-gray-400">
      Try adjusting your filters to see more results
    </p>
  </div>
)

const ErrorState: React.FC<{ error: string }> = ({ error }) => (
  <div className="p-12 text-center">
    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">
      Error loading alarms
    </h3>
    <p className="text-red-600 dark:text-red-400">
      {error}
    </p>
  </div>
)

// Mobile card component
const AlarmCard: React.FC<{ alarm: Alarm }> = ({ alarm }) => {
  const config = getSeverityConfig(alarm.severity)
  const { date, time } = formatTimestamp(alarm.timestamp)

  return (
    <Card className={`border-l-4 ${config.border} hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors bg-gray-50 dark:bg-[#262626]`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <Badge className={`${config.badge} flex items-center space-x-1`}>
            <div className={`w-2 h-2 rounded-full ${config.dot}`} />
            <span className="capitalize">{alarm.severity}</span>
          </Badge>
          <div className="text-right text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{time}</span>
            </div>
            <div>{date}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div>
            <span className="font-medium text-gray-900 dark:text-white">
              {alarm.equipment_id}
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">
              ({capitalizeStep(alarm.production_step)})
            </span>
          </div>
          
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {alarm.message}
          </p>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Batch: <span className="font-mono">{alarm.batch_id}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const AlarmsTable: React.FC<AlarmsTableProps> = ({ alarms, loading, error }) => {
  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorState error={error} />
  }

  if (alarms.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      {/* Mobile view - Cards */}
      <div className="block md:hidden p-4 space-y-4">
        {alarms.map((alarm) => (
          <AlarmCard key={alarm.id} alarm={alarm} />
        ))}
      </div>

      {/* Desktop view - Table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Severity</TableHead>
              <TableHead className="w-36">Timestamp</TableHead>
              <TableHead className="w-32">Equipment</TableHead>
              <TableHead className="w-32">Production Step</TableHead>
              <TableHead className="min-w-0">Message</TableHead>
              <TableHead className="w-36">Batch ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {alarms.map((alarm) => {
              const config = getSeverityConfig(alarm.severity)
              const { date, time } = formatTimestamp(alarm.timestamp)

              return (
                <TableRow
                  key={alarm.id}
                  className={`border-l-4 ${config.border} hover:bg-gray-100 dark:hover:bg-[#363636] transition-colors bg-gray-50 dark:bg-[#2f2f2f]`}
                >
                  <TableCell>
                    <Badge className={`${config.badge} flex items-center space-x-1 w-fit`}>
                      <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                      <span className="capitalize">{alarm.severity}</span>
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span>{time}</span>
                      </div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {date}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-medium">
                      {alarm.equipment_id}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <span className="capitalize">
                      {capitalizeStep(alarm.production_step)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <div className="max-w-md truncate" title={alarm.message}>
                      {alarm.message}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <span className="font-mono text-sm">
                      {alarm.batch_id}
                    </span>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </>
  )
}

export default AlarmsTable