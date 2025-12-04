import { NextApiRequest, NextApiResponse } from 'next'
import { BatchStats } from '../../../types/batches'

// Backend API URL
const BACKEND_URL = 'http://localhost:8080'

export default async function handler(req: NextApiRequest, res: NextApiResponse<BatchStats | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Fetch all batches to calculate stats
    const backendResponse = await fetch(`${BACKEND_URL}/api/batches`)
    
    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.status}`)
    }

    const batches = await backendResponse.json()
    
    // Calculate statistics (using correct field name from backend)
    const stats: BatchStats = {
      total: batches.length,
      completed: batches.filter((b: any) => b.executionStatus === 'COMPLETED').length,
      in_progress: batches.filter((b: any) => b.executionStatus === 'IN_PROGRESS').length,
      failed: batches.filter((b: any) => b.executionStatus === 'FAILED').length
    }

    res.status(200).json(stats)
  } catch (error) {
    console.error('Error fetching batch stats:', error)
    
    // Fallback stats
    res.status(200).json({
      total: 0,
      completed: 0,
      in_progress: 0,
      failed: 0
    })
  }
}