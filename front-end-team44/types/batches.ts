export interface Equipment {
  equipment_id: string
  process_id: string
  name: string
  type: string
}

export interface Sensor {
  sensor_id: string
  equipment_id: string
  type: string
  metric: string
}

export enum ExecutionStatus {
  COMPLETED = 'COMPLETED',
  IN_PROGRESS = 'IN_PROGRESS',
  RUNNING = 'RUNNING',
  PLANNED = 'PLANNED',
  SCHEDULED = 'SCHEDULED',
  ABORTED = 'ABORTED',
  FAILED = 'FAILED'
}

export interface Batch {
  batch_id: string
  batch_number: string
  production_order_number: string
  recipe_id: string
  planned_start_time: string
  actual_start_time: string
  planned_end_time: string
  actual_end_time: string
  execution_status: ExecutionStatus
  id: number
  name?: string
  line_id?: string
}

export interface BatchFilters {
  execution_status: ExecutionStatus | 'all'
  batch_number: string
  production_order_number: string
  recipe_id: string
  start_date: string
  end_date: string
  page?: number
  limit?: number
}

export interface BatchesResponse {
  batches: Batch[]
  total: number
  page: number
  totalPages: number
}

export interface BatchStats {
  total: number
  completed: number
  in_progress: number
  failed: number
}

