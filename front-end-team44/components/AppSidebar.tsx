import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  BarChart3, 
  MessageCircle, 
  Bell, 
  PanelLeftClose, 
  PanelLeftOpen,
  Package,
  Settings
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar'
import { ProfileDropdown } from './ProfileDropdown'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from './components/ui/sidebar'

interface UserData {
  userName: string
  email: string
  userInitial: string
  userAvatar: string | null
}

export function AppSidebar() {
  const router = useRouter()
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === 'collapsed'
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [userData, setUserData] = useState<UserData>({
    userName: 'User',
    email: 'user@example.com',
    userInitial: 'U',
    userAvatar: null
  })

  // Load user data from localStorage
  useEffect(() => {
    const loadUserData = () => {
      const sessionData = localStorage.getItem('userSession')
      if (sessionData) {
        try {
          const parsedData = JSON.parse(sessionData)
          setUserData({
            userName: parsedData.userName || 'User',
            email: parsedData.email || 'user@example.com',
            userInitial: (parsedData.userName || 'User').charAt(0).toUpperCase(),
            userAvatar: parsedData.userAvatar || null
          })
        } catch (error) {
          console.error('Error parsing user session data:', error)
        }
      }
    }

    loadUserData()
    window.addEventListener('storage', loadUserData)
    return () => window.removeEventListener('storage', loadUserData)
  }, [])

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen)
  }

  // Navigation items
  const navigationItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      isActive: router.pathname === '/dashboard'
    },
    {
      href: '/chat',
      label: 'AI Chatbot',
      icon: MessageCircle,
      isActive: router.pathname === '/chat'
    },
    {
      href: '/alarms',
      label: 'Alarms',
      icon: Bell,
      isActive: router.pathname === '/alarms'
    },
    {
      href: '/batches',
      label: 'Batches',
      icon: Package,
      isActive: router.pathname === '/batches'
    }
  ]

  return (
    <Sidebar className="bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
      <SidebarHeader>
        <div className="flex items-center justify-between p-4">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
            {!isCollapsed && (
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                SmartFactory
              </h1>
            )}
          </div>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <PanelLeftClose className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
          <div className={`${isCollapsed ? 'mt-4' : 'mt-8'} space-y-2`}>
            {navigationItems.map((item) => {
              const Icon = item.icon
              const baseClasses = `flex items-center ${
                isCollapsed ? 'justify-center py-3' : 'gap-4 py-3'
              } px-3 font-medium rounded-lg cursor-pointer transition-all duration-200 group`
              
              const activeClasses = item.isActive 
                ? 'bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-white'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white'

              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`${baseClasses} ${activeClasses}`}
                >
                  <Icon className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all group-hover:scale-110 flex-shrink-0`} />
                  {!isCollapsed && <span className="text-sm">{item.label}</span>}
                </Link>
              )
            })}
          </div>
        </nav>
      </SidebarContent>

      <SidebarFooter>
        {/* Divider Line */}
        <div className="h-px bg-gray-100 dark:bg-gray-800 opacity-50 mb-4"></div>
        
        {/* User Profile */}
        <div className={`${isCollapsed ? 'p-2' : 'p-4'} relative`}>
          <button 
            onClick={toggleProfileDropdown}
            className={`w-full ${
              isCollapsed ? 'flex justify-center' : 'flex items-center gap-4'
            } rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors duration-200 p-2`}
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
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {userData.userName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                  {userData.email}
                </p>
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
      </SidebarFooter>
    </Sidebar>
  )
}