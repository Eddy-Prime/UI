'use client'

import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { useTheme } from 'next-themes'
import { ArrowLeft, User, Settings as SettingsIcon, Monitor, Sun, Moon, Eye, Save, Trash2, LogOut, UserCircle, PanelLeftClose, PanelLeftOpen, LayoutDashboard, Users, CreditCard, BookOpen, UserCheck, BarChart3, MessageCircle, Bell, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { ModeToggle } from '../components/ModeToggle'
import { ProfileDropdown } from '../components/ProfileDropdown'
import { AvatarSelector } from '../components/AvatarSelector'
import { Avatar, AvatarFallback, AvatarImage } from '../components/components/ui/avatar'
import { useToast } from '../components/hooks/use-toast'

interface UserData {
  username: string
  email: string
  preferredName: string
  fullName: string
  userInitial?: string
  userName?: string
  userAvatar?: string
}

const Settings: React.FC = () => {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [activeSection, setActiveSection] = useState('general')
  const [userData, setUserData] = useState<UserData>({
    username: '',
    email: '',
    preferredName: '',
    fullName: ''
  })
  const [formData, setFormData] = useState<UserData>({
    username: '',
    email: '',
    preferredName: '',
    fullName: ''
  })
  const [loading, setLoading] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!profileDropdownOpen)
  }
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteInputText, setDeleteInputText] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    const loadUserData = () => {
      // Load user data from localStorage
      const sessionData = localStorage.getItem('userSession')
      if (sessionData) {
        const session = JSON.parse(sessionData)
        const email = session.email || ''
        const username = session.username || email.split('@')[0] || ''
        const user = {
          username,
          email,
          preferredName: session.preferredName || username,
          fullName: session.fullName || username,
          userInitial: (session.preferredName || username).charAt(0).toUpperCase(),
          userName: session.preferredName || username,
          userAvatar: session.avatar || ''
        }
        setUserData(user)
        setFormData(user)
      }
    }

    // Load initial data
    loadUserData()

    // Listen for storage changes (when user updates profile)
    const handleStorageChange = (e) => {
      if (e.key === 'userSession') {
        loadUserData()
      }
    }

    // Listen for focus events (when user navigates back to settings)
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

  const handleBack = () => {
    router.back()
  }

  const handleSaveProfile = async () => {
    setSaveStatus('saving')
    setLoading(true)

    try {
      const sessionData = localStorage.getItem('userSession')
      if (!sessionData) throw new Error('No session found')

      const session = JSON.parse(sessionData)
      const response = await fetch('http://localhost:8080/auth/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        },
        body: JSON.stringify({
          preferredName: formData.preferredName,
          name: formData.fullName
        })
      })

      if (response.ok) {
        // Update local storage
        const updatedSession = {
          ...session,
          preferredName: formData.preferredName,
          fullName: formData.fullName
        }
        localStorage.setItem('userSession', JSON.stringify(updatedSession))
        
        // Update userData state with all necessary properties for UI display
        const updatedUserData = {
          ...userData,
          preferredName: formData.preferredName,
          fullName: formData.fullName,
          userName: formData.preferredName, // Update the display name
          userInitial: formData.preferredName.charAt(0).toUpperCase() // Update initial
        }
        setUserData(updatedUserData)
        setSaveStatus('success')
        
        // Show success toast
        console.log('Attempting to show toast...')  // Debug log
        toast({
          description: "Account preferences updated",
          duration: 3000,
        })
        
        // Reset status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Profile update error:', error)
      setSaveStatus('error')
      
      // Show error toast
      console.log('Attempting to show error toast...')  // Debug log
      toast({
        variant: "destructive",
        description: "Failed to update account preferences. Please try again.",
        duration: 3000,
      })
      
      setTimeout(() => setSaveStatus('idle'), 2000)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    const sessionData = localStorage.getItem('userSession')
    if (sessionData) {
      const session = JSON.parse(sessionData)
      const token = session.token

      fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ entity: token })
      }).then(() => {
        localStorage.removeItem('userSession')
        router.push('/login')
      }).catch((error) => {
        console.error('Logout error:', error)
        localStorage.removeItem('userSession')
        router.push('/login')
      })
    } else {
      router.push('/login')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteInputText !== 'DELETE') return

    setLoading(true)

    try {
      const sessionData = localStorage.getItem('userSession')
      if (!sessionData) throw new Error('No session found')

      const session = JSON.parse(sessionData)
      const response = await fetch('http://localhost:8080/auth/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.token}`
        }
      })

      if (response.ok) {
        localStorage.removeItem('userSession')
        setShowDeleteModal(false)
        router.push('/login')
      } else {
        throw new Error('Failed to delete account')
      }
    } catch (error) {
      console.error('Account deletion error:', error)
      alert('Failed to delete account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderGeneralSettings = () => (
    <div>
      {/* Profile Section */}
      <div className="mb-8 lg:mb-12">
        <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 lg:mb-6">Profile</h2>
        
        {/* Avatar Selection */}
        <div className="mb-6 p-4 bg-gray-100 dark:bg-[#2f2f2f] rounded-xl border border-gray-200 dark:border-[#404040]">
          <label className="block text-sm font-medium text-gray-700 dark:text-[#e5e5e5] mb-3">
            Profile Avatar
          </label>
          <div className="flex items-center gap-4">
            <AvatarSelector
              currentAvatar={userData.userAvatar}
              userInitial={userData.userInitial || 'U'}
              userName={userData.userName || 'User'}
              onAvatarSelect={(avatarUrl) => {
                const updatedUserData = { ...userData, userAvatar: avatarUrl }
                setUserData(updatedUserData)
                setFormData({ ...formData, userAvatar: avatarUrl })
                
                // Immediately save to localStorage to persist avatar
                const sessionData = localStorage.getItem('userSession')
                if (sessionData) {
                  const session = JSON.parse(sessionData)
                  session.avatar = avatarUrl
                  localStorage.setItem('userSession', JSON.stringify(session))
                }
              }}
              size="lg"
            />
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-[#a0a0a0]">
                Click on your avatar to choose profile pictures, or continue using your initials.
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-[#e5e5e5] mb-2">
              Full name
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-3 py-2.5 bg-white dark:bg-[#2f2f2f] border border-gray-300 dark:border-[#404040] rounded-xl text-gray-900 dark:text-[#e5e5e5] focus:border-gray-400 dark:focus:border-[#565656] focus:outline-none transition-all duration-200 placeholder:text-gray-500 dark:placeholder:text-[#9ca3af]"
              placeholder="Enter your full name"
            />
          </div>

          {/* What should PromptVerse call you */}
          <div>
            <label className="block text-sm text-gray-700 dark:text-[#e5e5e5] mb-2">
              What should PromptVerse call you?
            </label>
            <input
              type="text"
              value={formData.preferredName}
              onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
              className="w-full px-3 py-2.5 bg-white dark:bg-[#2f2f2f] border border-gray-300 dark:border-[#404040] rounded-xl text-gray-900 dark:text-[#e5e5e5] focus:border-gray-400 dark:focus:border-[#565656] focus:outline-none transition-all duration-200 placeholder:text-gray-500 dark:placeholder:text-[#9ca3af]"
              placeholder="How would you like to be addressed?"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={handleSaveProfile}
            disabled={loading || (formData.preferredName === userData.preferredName && formData.fullName === userData.fullName)}
            className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-gray-800 dark:text-white font-medium rounded-xl transition-all duration-200"
          >
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Error' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Horizontal Divider */}
        <div className="h-px bg-gray-200 dark:bg-gray-750 opacity-50 mb-4"></div>

      {/* Appearance Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Appearance</h2>
        </div>
        
        
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Color mode</p>
        
        <div className="flex flex-wrap gap-3 max-w-sm sm:max-w-md lg:max-w-lg">
          {/* Light Theme Card - Claude UI Style */}
          <div
            onClick={() => setTheme('light')}
            className={`relative w-28 h-20 sm:w-32 sm:h-24 cursor-pointer transition-all duration-200 rounded-lg overflow-hidden border-2 ${
              theme === 'light'
                ? 'border-orange-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-[#e5e7eb] dark:hover:border-gray-500'
            }`}
          >
            <div className="w-full h-full bg-white border border-gray-200 p-2">
              <div className="flex flex-col space-y-1">
                <div className="h-1 bg-gray-300 rounded w-full"></div>
                <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                <div className="h-1 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            
            {/* Radio Indicator */}
            <div className="absolute bottom-2 right-2">
              <div className={`w-3 h-3 rounded-full ${
                theme === 'light' 
                  ? 'bg-orange-500' 
                  : 'bg-gray-300'
              }`}></div>
            </div>
            
            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 text-center py-1">
              <span className="text-xs sm:text-xs font-medium text-gray-700">Light</span>
            </div>
          </div>

          {/* Auto Theme Card - Claude UI Style */}
          <div
            onClick={() => setTheme('system')}
            className={`relative w-28 h-20 sm:w-32 sm:h-24 cursor-pointer transition-all duration-200 rounded-lg overflow-hidden border-2 ${
              theme === 'system'
                ? 'border-orange-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-[#e5e7eb] dark:hover:border-gray-500'
            }`}
          >
            <div className="w-full h-full border border-gray-200 dark:border-gray-600">
              <div className="flex h-full">
                <div className="w-1/2 bg-white p-2">
                  <div className="flex flex-col space-y-1">
                    <div className="h-1 bg-gray-300 rounded"></div>
                    <div className="h-1 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
                <div className="w-1/2 bg-gray-800 p-2">
                  <div className="flex flex-col space-y-1">
                    <div className="h-1 bg-gray-600 rounded"></div>
                    <div className="h-1 bg-gray-500 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Radio Indicator */}
            <div className="absolute bottom-2 right-2">
              <div className={`w-3 h-3 rounded-full ${
                theme === 'system' 
                  ? 'bg-orange-500' 
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}></div>
            </div>
            
            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 text-center py-1">
              <span className="text-xs sm:text-xs font-medium text-gray-700 dark:text-gray-300">Auto</span>
            </div>
          </div>

          {/* Dark Theme Card - Claude UI Style */}
          <div
            onClick={() => setTheme('dark')}
            className={`relative w-28 h-20 sm:w-32 sm:h-24 cursor-pointer transition-all duration-200 rounded-lg overflow-hidden border-2 ${
              theme === 'dark'
                ? 'border-orange-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-[#e5e7eb] dark:hover:border-gray-500'
            }`}
          >
            <div className="w-full h-full bg-gray-800 border border-gray-700 p-2">
              <div className="flex flex-col space-y-1">
                <div className="h-1 bg-gray-600 rounded w-full"></div>
                <div className="h-1 bg-gray-500 rounded w-3/4"></div>
                <div className="h-1 bg-gray-500 rounded w-1/2"></div>
              </div>
            </div>
            
            {/* Radio Indicator */}
            <div className="absolute bottom-2 right-2">
              <div className={`w-3 h-3 rounded-full ${
                theme === 'dark' 
                  ? 'bg-orange-500' 
                  : 'bg-gray-600'
              }`}></div>
            </div>
            
            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-90 text-center py-1">
              <span className="text-xs sm:text-xs font-medium text-gray-300">Dark</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAccountSettings = () => (
    <div>
      <h2 className="text-lg lg:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6 lg:mb-8">Account</h2>

      <div className="space-y-0">
        {/* Log out row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-gray-200 dark:border-gray-600 gap-4">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Log out of current device
          </span>
          <button
            onClick={handleLogout}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Log out
          </button>
        </div>

        {/* Delete account row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 gap-4">
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            Delete account
          </span>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={loading}
            className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )



  return (
    <>
      <Head>
        <title>Settings - PromptVerse AI</title>
        <meta name="description" content="PromptVerse AI Settings - Manage your account preferences and personal information." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="flex w-screen min-h-screen bg-background text-foreground" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Mobile Overlay */}
        {!isCollapsed && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleSidebar} />
        )}
        
        {/* Left Sidebar - Responsive with mobile slide-in */}
        <div className={`${!isCollapsed ? 'fixed lg:relative' : 'hidden lg:flex'} flex-none ${isCollapsed ? 'w-[70px]' : 'w-[280px]'} h-screen bg-[#fafaf9] dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-600 flex flex-col transition-all duration-300 ease-in-out overflow-hidden z-50 ${!isCollapsed ? 'left-0' : 'lg:left-0'}`}>
          <>
            {/* Top Section - Brand Area */}
            <div className="p-4 pb-4 relative">
            <div className="flex items-center justify-between">
              {/* Company Logo */}
              <Link href="/dashboard" className="flex items-center">
                {isCollapsed ? (
                  <img 
                    src="/images/logo.png" 
                    alt="Logo" 
                    className="w-12 h-12 object-contain hover:opacity-80 transition-all duration-200 dark:brightness-200 dark:contrast-125"
                  />
                ) : (
                  <img 
                    src="/images/logo.png" 
                    alt="Company Logo" 
                    className="h-12 w-auto object-contain hover:opacity-80 transition-all duration-200 dark:brightness-200 dark:contrast-125"
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
              <div className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-4 py-3'} px-3 text-gray-600 dark:text-gray-400 font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white group`}>
                <MessageCircle className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all group-hover:scale-110 flex-shrink-0`} />
                {!isCollapsed && <span className="text-sm">AI Chatbot</span>}
              </div>
              
              {/* Alarms */}
              <Link href="/alarms" className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-4 py-3'} px-3 text-gray-600 dark:text-gray-400 font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white group`}>
                <Bell className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all group-hover:scale-110 flex-shrink-0`} />
                {!isCollapsed && <span className="text-sm">Alarms</span>}
              </Link>
            </div>
          </nav>
          
          {/* Divider Line */}
          <div className="h-px bg-gray-200 dark:bg-gray-750 opacity-50 mb-4"></div>
          
          {/* Bottom Section - User Profile */}
          <div className={`mt-auto ${isCollapsed ? 'p-2' : 'p-4'} relative`}>
            <button 
              onClick={toggleProfileDropdown}
              className={`w-full ${isCollapsed ? 'flex justify-center' : 'flex items-center gap-4'} rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 transition-colors duration-200 p-2`}
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                {userData.userAvatar ? (
                  <AvatarImage src={userData.userAvatar} alt={userData.userName || userData.username} />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                  {userData.userInitial || userData.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userData.userName || userData.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{userData.email}</p>
                </div>
              )}
            </button>

            {/* Profile Dropdown */}
            <ProfileDropdown
              isOpen={profileDropdownOpen}
              onClose={() => setProfileDropdownOpen(false)}
              userInitial={userData.userInitial || 'U'}
              userName={userData.userName || userData.username}
              userEmail={userData.email}
              userAvatar={userData.userAvatar}
              isCollapsed={isCollapsed}
            />
          </div>
          </>
        </div>

        {/* Vertical Separator Line - Only on desktop */}
        <div className="hidden lg:block w-px h-screen bg-gray-100 dark:bg-gray-900 opacity-40"></div>

        {/* Settings Content Area */}
        <div className="flex-1 min-h-screen bg-white dark:bg-[#262626] transition-colors duration-300 overflow-y-auto">
          {/* Mobile Header - Only visible on mobile */}
          <div className="lg:hidden sticky top-0 bg-white dark:bg-[#262626] border-b border-gray-200 dark:border-gray-700 px-4 py-3 z-30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleSidebar}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                  title="Open sidebar"
                >
                  <PanelLeftOpen className="w-5 h-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Settings</h1>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            </div>
          </div>
          
          <div className="max-w-6xl mx-auto px-4 lg:px-8 py-4 lg:py-12">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-10">
              
              {/* Settings Navigation - Desktop only */}
              <div className="hidden lg:block w-60 flex-shrink-0">
                <div className="mb-8">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                </div>
              
                <nav className="space-y-1">
                  {[
                    { key: 'general', label: 'General', icon: SettingsIcon },
                    { key: 'account', label: 'Account', icon: User }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                        activeSection === key
                          ? 'bg-gray-200 dark:bg-[#4e4f51] text-gray-900 dark:text-white font-medium'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-[#4e4f51] font-normal'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Mobile Navigation Tabs */}
              <div className="lg:hidden w-full mb-4">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  {[
                    { key: 'general', label: 'General', icon: SettingsIcon },
                    { key: 'account', label: 'Account', icon: User }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-all duration-200 border-b-2 ${
                        activeSection === key
                          ? 'border-indigo-500 text-indigo-600 font-medium'
                          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 font-normal'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

            {/* Settings Content - Optimized for mobile */}
              <div className="flex-1 max-w-4xl">
                <div className="lg:pl-4">
                  {activeSection === 'general' && renderGeneralSettings()}
                  {activeSection === 'account' && renderAccountSettings()}
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Delete Account Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 lg:p-6 max-w-md w-full">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Are you sure?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                This action will delete all of your data associated with your account and you will be logged out. You cannot restore your data after deletion. This action cannot be undone.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type "DELETE" to confirm:
                </label>
                <input
                  type="text"
                  value={deleteInputText}
                  onChange={(e) => setDeleteInputText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="DELETE"
                />
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteInputText('')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-all duration-200 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteInputText !== 'DELETE' || loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-md transition-all duration-200 order-1 sm:order-2"
                >
                  {loading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Settings