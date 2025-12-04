'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { PanelLeftClose, PanelLeftOpen, BarChart3, MessageCircle, Bell } from 'lucide-react'
import Link from 'next/link'
import { ModeToggle } from '../components/ModeToggle'
import { ProfileDropdown } from '../components/ProfileDropdown'
import { Avatar, AvatarFallback, AvatarImage } from '../components/components/ui/avatar'
import { useToast } from '../components/hooks/use-toast'
import FilterPanel from '../components/FilterPanel'
import ActiveFilters from '../components/ActiveFilters'
import AlarmsTable from '../components/AlarmsTable'
import PaginationComponent from '../components/Pagination'
import { Alarm, AlarmsResponse, AlarmFilters } from '../types'

const AlarmsPage: React.FC = () => {
  const router = useRouter()
  const { toast } = useToast()
  
  // State management
  const [alarms, setAlarms] = useState<Alarm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [userData, setUserData] = useState({
    userName: 'User',
    email: 'user@example.com',
    userInitial: 'U',
    userAvatar: null
  })
  
  // Filter and pagination state
  const [filters, setFilters] = useState<AlarmFilters>({
    severity: 'all',
    equipment_id: '',
    production_step: 'all',
    start_date: '',
    end_date: '',
    batch_id: '',
    page: 1,
    limit: 20
  })
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Alarm stats state
  const [alarmStats, setAlarmStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0,
    active: 0
  })

  // Fetch alarm stats function
  const fetchAlarmStats = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/alarm-stats')
      if (response.ok) {
        const stats = await response.json()
        setAlarmStats(stats)
      }
    } catch (error) {
      console.error('Failed to fetch alarm stats:', error)
    }
  }, [])

  // Debounced fetch function
  const fetchAlarms = useCallback(async (currentFilters: AlarmFilters) => {
    try {
      setLoading(true)
      setError(null)

      // Build query parameters
      const params = new URLSearchParams()
      
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value && value !== 'all' && value !== '') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/alarms?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: AlarmsResponse = await response.json()
      
      setAlarms(data.alarms)
      setTotalPages(data.totalPages)
      setTotal(data.total)
      setCurrentPage(data.page)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch alarms'
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  // Load user data
  useEffect(() => {
    const loadUserData = () => {
      const sessionData = localStorage.getItem('userSession')
      if (sessionData) {
        const session = JSON.parse(sessionData)
        const email = session.email || ''
        const username = session.username || email.split('@')[0] || ''
        setUserData({
          userName: session.preferredName || username,
          email,
          userInitial: (session.preferredName || username).charAt(0).toUpperCase(),
          userAvatar: session.avatar || null
        })
      }
    }

    loadUserData()

    const handleStorageChange = (e) => {
      if (e.key === 'userSession') {
        loadUserData()
      }
    }

    const handleFocus = () => {
      loadUserData()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Debounce hook
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAlarms(filters)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [filters, fetchAlarms])

  // Load alarm stats on component mount
  useEffect(() => {
    fetchAlarmStats()
  }, [fetchAlarmStats])

  // Sidebar functions
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen)
  }

  const handleFiltersChange = (newFilters: Partial<AlarmFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1  // Reset to page 1 unless explicitly setting page
    }))
  }

  const handleClearFilters = () => {
    const clearedFilters: AlarmFilters = {
      severity: 'all',
      equipment_id: '',
      production_step: 'all',
      start_date: '',
      end_date: '',
      batch_id: '',
      page: 1,
      limit: 20
    }
    setFilters(clearedFilters)
  }

  const handleRemoveFilter = (filterKey: keyof AlarmFilters) => {
    const updates: Partial<AlarmFilters> = { page: 1 }
    
    if (filterKey === 'severity' || filterKey === 'production_step') {
      (updates as any)[filterKey] = 'all'
    } else if (filterKey === 'equipment_id' || filterKey === 'batch_id' || filterKey === 'start_date' || filterKey === 'end_date') {
      (updates as any)[filterKey] = ''
    }
    
    handleFiltersChange(updates)
  }

  const handlePageChange = (page: number) => {
    handleFiltersChange({ page })
  }

  return (
    <>
      <Head>
        <title>Alarms - PromptVerse AI</title>
        <meta name="description" content="PromptVerse AI Alarms - Monitor and analyze production alarms in real-time." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      
      <div className="flex w-screen h-screen bg-background text-foreground" style={{fontFamily: 'Inter, sans-serif'}}>
        {/* Left Sidebar - Dynamic width with transition */}
        <div className={`flex-none ${isCollapsed ? 'w-[70px]' : 'w-[280px]'} h-screen bg-[#fafaf9] dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-600 flex flex-col transition-all duration-300 ease-in-out overflow-hidden relative`}>
          {/* Top Section - Brand Area */}
          <div className="p-4 pb-4 relative">
            <div className="flex items-center justify-between">
              {/* Company Logo */}
              <Link href="/dashboard" className="flex items-center">
                {isCollapsed ? (
                  <img 
                    src="/images/logo.png" 
                    alt="Logo" 
                    className="w-12 h-12 object-contain hover:opacity-80 transition-all duration-200 dark:brightness-300 dark:contrast-150 dark:saturate-150"
                  />
                ) : (
                  <img 
                    src="/images/logo.png" 
                    alt="Company Logo" 
                    className="h-12 w-auto object-contain hover:opacity-80 transition-all duration-200 dark:brightness-300 dark:contrast-150 dark:saturate-150"
                  />
                )}
              </Link>
              
              {/* Sidebar Toggle */}
              <button 
                onClick={toggleSidebar}
                className={`${isCollapsed ? 'mx-auto' : 'absolute top-4 right-4'} p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-neutral-900 rounded-lg transition-colors duration-200`}
                title={isCollapsed ? 'Open sidebar' : 'Close sidebar Ctrl+\\'}
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5" />
                ) : (
                  <PanelLeftClose className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Navigation Menu */}
          <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
            <div className={`${isCollapsed ? 'mt-4' : 'mt-8'} space-y-2`}>
              {/* Batch Analysis */}
              <div className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-4 py-3'} px-3 text-gray-600 dark:text-gray-400 font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white group`}>
                <BarChart3 className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all group-hover:scale-110 flex-shrink-0`} />
                {!isCollapsed && <span className="text-sm">Batch Analysis</span>}
              </div>
              
              {/* AI Chatbot */}
              <Link href="/chat" className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-4 py-3'} px-3 text-gray-600 dark:text-gray-400 font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white group`}>
                <MessageCircle className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all group-hover:scale-110 flex-shrink-0`} />
                {!isCollapsed && <span className="text-sm">AI Chatbot</span>}
              </Link>
              
              {/* Alarms - Active */}
              <div className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-4 py-3'} px-3 bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-white font-medium rounded-lg transition-all duration-200 group`}>
                <Bell className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all group-hover:scale-110 flex-shrink-0`} />
                {!isCollapsed && <span className="text-sm">Alarms</span>}
              </div>
            </div>
          </nav>

          {/* Divider Line */}
          <div className="h-px bg-gray-100 dark:bg-gray-800 opacity-50 mb-4"></div>
          
          {/* Bottom Section - User Profile */}
          <div className={`mt-auto ${isCollapsed ? 'p-2' : 'p-4'} relative`}>
            <button 
              onClick={toggleProfileDropdown}
              className={`w-full ${isCollapsed ? 'flex justify-center' : 'flex items-center gap-4'} rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors duration-200 p-2`}
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                {userData.userAvatar ? (
                  <AvatarImage src={userData.userAvatar} alt={userData.userName} />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                  {userData.userInitial}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userData.userName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{userData.email}</p>
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            <ProfileDropdown
              isOpen={profileDropdownOpen}
              onClose={() => setProfileDropdownOpen(false)}
              userInitial={userData.userInitial}
              userName={userData.userName}
              userEmail={userData.email}
              userAvatar={userData.userAvatar}
              isCollapsed={isCollapsed}
            />
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="w-px h-screen bg-gray-100 dark:bg-gray-800 opacity-40"></div>

        {/* Main Content Area - Scrollable Full Page */}
        <div className="flex-1 h-screen bg-white dark:bg-[#262626] transition-colors duration-300 overflow-y-auto">
          {/* Theme Toggle - Top Right Fixed */}
          <div className="fixed top-4 right-4 z-20">
            <ModeToggle />
          </div>

          {/* Page Content */}
          <div className="relative min-h-screen">
            {/* Page Header */}
            <div className="py-8 px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center space-x-3 mb-8">
                  <Bell className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      Smart Alarms
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Monitor and analyze production alarms in real-time
                    </p>
                  </div>
                </div>

                {/* Stats Section */}
                {total > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gray-100 dark:bg-[#262626] rounded-xl p-6 border border-gray-200 dark:border-[#404040] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-[#404040] rounded-lg flex items-center justify-center">
                            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-[#e5e5e5]">Total Alarms</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">{alarmStats.total}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-[#262626] rounded-xl p-6 border border-gray-200 dark:border-[#404040] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-[#404040] rounded-lg flex items-center justify-center">
                            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-[#e5e5e5]">Critical</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {alarmStats.critical}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-[#262626] rounded-xl p-6 border border-gray-200 dark:border-[#404040] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gray-200 dark:bg-[#404040] rounded-lg flex items-center justify-center">
                            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-[#e5e5e5]">Active</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {alarmStats.active}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Filter Panel */}
                <div className="mb-8">
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={handleClearFilters}
                  />
                </div>

                {/* Active Filters */}
                <div className="mb-8">
                  <ActiveFilters
                    filters={filters}
                    onRemoveFilter={handleRemoveFilter}
                  />
                </div>

                {/* Alarms Table */}
                <div className="bg-white dark:bg-[#2f2f2f] rounded-xl shadow-sm border border-gray-200 dark:border-[#404040] overflow-hidden">
                  <AlarmsTable
                    alarms={alarms}
                    loading={loading}
                    error={error}
                  />
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="border-t border-gray-200 dark:border-[#404040] px-6 py-6">
                      <PaginationComponent
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AlarmsPage