import { NextApiRequest, NextApiResponse } from 'next'

// Backend API URL
const BACKEND_URL = 'http://localhost:8080'

interface AlarmStats {
  total: number
  critical: number
  warning: number
  info: number
  active: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<AlarmStats | { error: string }>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Fetch all alarms from backend
    const backendUrl = `${BACKEND_URL}/api/alarms`
    
    const backendResponse = await fetch(backendUrl)
    
    if (!backendResponse.ok) {
      throw new Error(`Backend API error: ${backendResponse.status}`)
    }

    const backendAlarms = await backendResponse.json()
    
    // Calculate stats from backend data
    const stats: AlarmStats = {
      total: backendAlarms.length,
      critical: backendAlarms.filter((alarm: any) => alarm.severity === 'Critical').length,
      warning: backendAlarms.filter((alarm: any) => alarm.severity === 'Warning').length,
      info: backendAlarms.filter((alarm: any) => alarm.severity === 'Info').length,
      active: backendAlarms.filter((alarm: any) => alarm.severity !== 'Info').length
    }

    res.status(200).json(stats)
  } catch (error) {
    console.error('Error fetching alarm stats:', error)
    
    // Fallback stats if backend is unavailable
    const fallbackStats: AlarmStats = {
      total: 0,
      critical: 0,
      warning: 0,
      info: 0,
      active: 0
    }
    
    res.status(200).json(fallbackStats)
  }
}