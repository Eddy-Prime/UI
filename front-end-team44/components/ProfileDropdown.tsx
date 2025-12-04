'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Settings, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@components/components/ui/avatar'

interface ProfileDropdownProps {
  isOpen: boolean
  onClose: () => void
  userInitial: string
  userName: string
  userEmail: string
  userAvatar?: string
  isCollapsed?: boolean
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  isOpen,
  onClose,
  userInitial,
  userName,
  userEmail,
  userAvatar,
  isCollapsed = false
}) => {
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleSettings = () => {
    onClose()
    router.push('/settings')
  }

  const handleLogout = () => {
    onClose()
    // Get token from localStorage
    const sessionData = localStorage.getItem('userSession')
    if (sessionData) {
      const session = JSON.parse(sessionData)
      const token = session.token

      // Call logout API
      fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ entity: token })
      }).then(() => {
        // Clear local storage and redirect
        localStorage.removeItem('userSession')
        router.push('/login')
      }).catch((error) => {
        console.error('Logout error:', error)
        // Even if API fails, clear local storage and redirect
        localStorage.removeItem('userSession')
        router.push('/login')
      })
    } else {
      router.push('/login')
    }
  }

  if (!isOpen) return null

  return (
    <div 
      ref={dropdownRef}
      className={`absolute bottom-full mb-2 bg-white dark:bg-[#1a1a1a] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 animate-fade-in z-50 ${
        isCollapsed 
          ? 'left-full ml-2 w-64' 
          : 'left-0 w-64'
      }`}
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      {/* User Info Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            {userAvatar ? (
              <AvatarImage src={userAvatar} alt={userName} />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Divider Line */}
      <div className="h-px bg-gray-300 dark:bg-gray-600"></div>

      {/* Menu Items */}
      <div className="py-2">
        <button
          onClick={handleSettings}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  )
}