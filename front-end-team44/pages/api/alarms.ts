import { NextApiRequest, NextApiResponse } from 'next'
import { Alarm, AlarmsResponse } from '../../types'

// Backend API URL - adjust this to match your Java backend
const BACKEND_URL = 'http://localhost:8080'

// Backend alarm interface
interface BackendAlarm {
  id: number
  startDate: string
  severity: 'Info' | 'Warning' | 'Critical'
  productionStep: number
  batches?: Array<{ id: string }>
}

// Helper function to convert backend alarm data to frontend format
const convertBackendAlarm = (backendAlarm: BackendAlarm): Alarm => {
  // Map Java enum values to lowercase
  const severityMap: { [key: string]: string } = {
    'Info': 'info',
    'Warning': 'warning', 
    'Critical': 'critical'
  }

  // Generate mock equipment_id and message since backend doesn't have these fields
  const equipmentIds = ['REACTOR-A1', 'REACTOR-B2', 'MIXER-C3', 'DRYER-D1', 'PACKAGE-E2', 'QA-F1']
  const messages = [
    'Temperature exceeded threshold',
    'Pressure sensor malfunction detected',
    'Flow rate below minimum requirement',
    'Equipment maintenance required',
    'Quality parameter out of range',
    'Vibration levels abnormal',
    'Chemical composition variance detected',
    'Safety interlock activated',
    'Process timing exceeded limits',
    'Material shortage detected'
  ]

  return {
    id: backendAlarm.id.toString(),
    timestamp: backendAlarm.startDate,
    severity: (severityMap[backendAlarm.severity] || 'info') as 'info' | 'warning' | 'critical',
    equipment_id: equipmentIds[backendAlarm.id % equipmentIds.length],
    production_step: 'polymerization', // Fixed production step mapping
    message: messages[backendAlarm.id % messages.length],
    batch_id: backendAlarm.batches && backendAlarm.batches.length > 0 
      ? `BATCH-${backendAlarm.batches[0].id.substring(0, 8)}`
      : `BATCH-2024-${String(backendAlarm.id).padStart(3, '0')}`
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AlarmsResponse | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const {
      severity,
      equipment_id,
      production_step,
      start_date,
      end_date,
      batch_id,
      page = '1',
      limit = '20'
    } = req.query

    // Build backend API URL with filters
    const backendParams = new URLSearchParams()
    
    // Map frontend filters to backend parameters
    if (severity && severity !== 'all') {
      // Convert lowercase to Java enum format
      const severityMap: { [key: string]: string } = {
        'critical': 'Critical',
        'warning': 'Warning',
        'info': 'Info'
      }
      if (severityMap[severity as string]) {
        backendParams.append('severity', severityMap[severity as string])
      }
    }

    if (production_step && production_step !== 'all') {
      // Extract step number from step format like "step-1"
      const stepMatch = (production_step as string).match(/step-(\d+)/)
      if (stepMatch) {
        backendParams.append('productionStep', stepMatch[1])
      }
    }

    if (start_date && typeof start_date === 'string') {
      backendParams.append('startDate', start_date)
    }

    // Fetch data from Java backend
    const backendUrl = `${BACKEND_URL}/api/alarms${backendParams.toString() ? '?' + backendParams.toString() : ''}`
    
    console.log('Fetching from backend:', backendUrl)
    
    const backendResponse = await fetch(backendUrl)
    
    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.status}`)
    }

    const backendAlarms: BackendAlarm[] = await backendResponse.json()
    
    // Convert backend format to frontend format
    let allAlarms: Alarm[] = backendAlarms.map(convertBackendAlarm)

    // Apply frontend-specific filters that backend doesn't handle
    let filteredAlarms = allAlarms

    if (equipment_id && typeof equipment_id === 'string') {
      filteredAlarms = filteredAlarms.filter(alarm => 
        alarm.equipment_id.toLowerCase().includes(equipment_id.toLowerCase())
      )
    }

    if (batch_id && typeof batch_id === 'string') {
      filteredAlarms = filteredAlarms.filter(alarm => 
        alarm.batch_id.toLowerCase().includes(batch_id.toLowerCase())
      )
    }

    if (end_date && typeof end_date === 'string') {
      const endDateTime = new Date(end_date)
      endDateTime.setHours(23, 59, 59, 999) // End of day
      filteredAlarms = filteredAlarms.filter(alarm => 
        new Date(alarm.timestamp) <= endDateTime
      )
    }

    // Apply pagination
    const pageNumber = parseInt(page as string, 10)
    const limitNumber = parseInt(limit as string, 10)
    const startIndex = (pageNumber - 1) * limitNumber
    const endIndex = startIndex + limitNumber

    const paginatedAlarms = filteredAlarms.slice(startIndex, endIndex)
    const totalPages = Math.ceil(filteredAlarms.length / limitNumber)

    const response: AlarmsResponse = {
      alarms: paginatedAlarms,
      total: filteredAlarms.length,
      page: pageNumber,
      totalPages
    }

    res.status(200).json(response)
  } catch (error) {
    console.error('Error in alarms API:', error)
    
    // Fallback to mock data if backend is unavailable
    console.log('Backend unavailable, using mock data...')
    
    // Simplified mock response for fallback
    const mockAlarms: Alarm[] = [
      {
        id: 'mock-1',
        timestamp: new Date().toISOString(),
        severity: 'warning' as const,
        equipment_id: 'REACTOR-A1',
        production_step: 'polymerization' as const,
        message: 'Backend connection failed - mock data displayed',
        batch_id: 'BATCH-MOCK-001'
      }
    ]

    res.status(200).json({
      alarms: mockAlarms,
      total: 1,
      page: 1,
      totalPages: 1
    })
  }
}