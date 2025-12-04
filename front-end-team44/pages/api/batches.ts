import { NextApiRequest, NextApiResponse } from 'next'
import { Batch, BatchesResponse, ExecutionStatus } from '../../types/batches'

// Backend API URL
const BACKEND_URL = 'http://localhost:8080'

// Backend batch interface (actual format from Spring Boot)
interface BackendBatch {
  batchId: string
  batchNumber: string
  productionOrderNumber: string
  recipeId: string
  plannedStartTime: string
  actualStartTime: string
  plannedEndTime: string
  actualEndTime: string
  executionStatus: string
  internalId: number
  name?: string
}

// Helper function to convert backend batch data to frontend format
const convertBackendBatch = (backendBatch: BackendBatch): Batch => {
  return {
    batch_id: backendBatch.batchId,
    batch_number: backendBatch.batchNumber,
    production_order_number: backendBatch.productionOrderNumber,
    recipe_id: backendBatch.recipeId,
    planned_start_time: backendBatch.plannedStartTime,
    actual_start_time: backendBatch.actualStartTime,
    planned_end_time: backendBatch.plannedEndTime,
    actual_end_time: backendBatch.actualEndTime,
    execution_status: backendBatch.executionStatus as ExecutionStatus,
    id: backendBatch.internalId,
    name: backendBatch.name,
    line_id: null
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<BatchesResponse | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      execution_status,
      batch_number,
      production_order_number,
      recipe_id,
      start_date,
      end_date,
      page = '1',
      limit = '20'
    } = req.query

    // Fetch all batches from existing backend endpoint
    const backendUrl = `${BACKEND_URL}/api/batches`
    
    console.log('Fetching from backend:', backendUrl)
    
    const backendResponse = await fetch(backendUrl)
    
    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.status}`)
    }

    const backendBatches = await backendResponse.json()
    
    // Convert backend format to frontend format
    let allBatches: Batch[] = backendBatches.map(convertBackendBatch)

    // Apply frontend filters
    let filteredBatches = allBatches

    if (execution_status && execution_status !== 'all') {
      filteredBatches = filteredBatches.filter(batch => 
        batch.execution_status === execution_status
      )
    }

    if (batch_number && typeof batch_number === 'string') {
      filteredBatches = filteredBatches.filter(batch => 
        batch.batch_number.toLowerCase().includes(batch_number.toLowerCase())
      )
    }

    if (production_order_number && typeof production_order_number === 'string') {
      filteredBatches = filteredBatches.filter(batch => 
        batch.production_order_number.toLowerCase().includes(production_order_number.toLowerCase())
      )
    }

    if (recipe_id && typeof recipe_id === 'string') {
      filteredBatches = filteredBatches.filter(batch => 
        batch.recipe_id.toLowerCase().includes(recipe_id.toLowerCase())
      )
    }

    if (start_date && typeof start_date === 'string') {
      const startDateTime = new Date(start_date)
      filteredBatches = filteredBatches.filter(batch => 
        new Date(batch.actual_start_time) >= startDateTime
      )
    }

    if (end_date && typeof end_date === 'string') {
      const endDateTime = new Date(end_date)
      endDateTime.setHours(23, 59, 59, 999)
      filteredBatches = filteredBatches.filter(batch => 
        new Date(batch.actual_start_time) <= endDateTime
      )
    }

    // Sort by actual start time (newest first)
    filteredBatches.sort((a, b) => 
      new Date(b.actual_start_time).getTime() - new Date(a.actual_start_time).getTime()
    )

    // Apply pagination
    const pageNumber = parseInt(page as string, 10)
    const limitNumber = parseInt(limit as string, 10)
    const startIndex = (pageNumber - 1) * limitNumber
    const endIndex = startIndex + limitNumber

    const paginatedBatches = filteredBatches.slice(startIndex, endIndex)
    const totalPages = Math.ceil(filteredBatches.length / limitNumber)

    const response: BatchesResponse = {
      batches: paginatedBatches,
      total: filteredBatches.length,
      page: pageNumber,
      totalPages
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Error in batches API:', error)
    
    // Fallback to mock data if backend is unavailable
    console.log('Backend unavailable, using mock data...')
    
    const mockBatches: Batch[] = [
      {
        batch_id: '00197be5-160e-415e-8bca-5271cb3b3c4d',
        batch_number: 'BATCH-1000',
        production_order_number: 'PO-2000',
        recipe_id: 'RECIPE-015',
        planned_start_time: '2025-12-01T16:33:56.392878',
        actual_start_time: '2025-12-01T16:41:56.392878',
        planned_end_time: '2025-12-01T16:53:56.392878',
        actual_end_time: '2025-12-01T17:43:56.392878',
        execution_status: ExecutionStatus.COMPLETED,
        id: 224,
        name: null,
        line_id: null
      }
    ]

    res.status(200).json({
      batches: mockBatches,
      total: 1,
      page: 1,
      totalPages: 1
    })
  }
}