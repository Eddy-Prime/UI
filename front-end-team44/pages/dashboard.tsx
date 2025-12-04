import React, { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { 
  Wand2, 
  Download, 
  BarChart3, 
  MessageCircle, 
  Bell, 
  Menu,
  Settings,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  ArrowRight,
  Package
} from 'lucide-react'
import { ModeToggle } from '../components/ModeToggle'
import { ProfileDropdown } from '../components/ProfileDropdown'
import { Avatar, AvatarFallback, AvatarImage } from '../components/components/ui/avatar'
import {
  SidebarProvider,
  SidebarInset,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from '../components/components/ui/sidebar'

const Dashboard: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [userData, setUserData] = useState({
    email: 'user@example.com',
    userName: 'User',
    userInitial: 'U',
    userAvatar: ''
  })

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)
  const toggleProfileDropdown = () => setProfileDropdownOpen(!profileDropdownOpen)

  // Get logged-in user from localStorage
  useEffect(() => {
    const loadUserData = () => {
      const sessionData = localStorage.getItem('userSession')
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData)
          const email = session.email || 'user@example.com'
          const username = session.username || email.split('@')[0]
          const userName = session.preferredName || session.fullName || username
          const userInitial = userName.charAt(0).toUpperCase()
          const userAvatar = session.avatar || ''
          
          setUserData({ email, userName, userInitial, userAvatar })
        } catch (error) {
          console.error('Error parsing user session:', error)
        }
      }
    }

    // Load initial data
    loadUserData()

    // Listen for storage changes (when user updates profile in settings)
    const handleStorageChange = (e) => {
      if (e.key === 'userSession') {
        loadUserData()
      }
    }

    // Listen for focus events (when user navigates back to dashboard)
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

  return (
    <>
      <Head>
        <title>Dashboard - PromptVerse AI</title>
        <meta name="description" content="PromptVerse AI Dashboard - Find Inspiration. Create, Generate, Produce & Automate." />
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
              
              {/* Alarms */}
              <Link href="/alarms" className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-4 py-3'} px-3 text-gray-600 dark:text-gray-400 font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white group`}>
                <Bell className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all group-hover:scale-110 flex-shrink-0`} />
                {!isCollapsed && <span className="text-sm">Alarms</span>}
              </Link>

              {/* Batches */}
              <Link href="/batches" className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-4 py-3'} px-3 text-gray-600 dark:text-gray-400 font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white group`}>
                <Package className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all group-hover:scale-110 flex-shrink-0`} />
                {!isCollapsed && <span className="text-sm">Batches</span>}
              </Link>
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

          {/* Hero Section */}
          <div className="relative min-h-screen flex items-center justify-center">
            {/* Radial gradient glow effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_70%,_rgba(147,197,253,0.2)_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_70%,_rgba(59,130,246,0.15)_0%,_transparent_50%)]"></div>
            
            {/* Sparkle decorations */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top-left sparkle */}
              <div 
                className="absolute top-20 left-16 text-gray-800 dark:text-white opacity-15 dark:opacity-60 animate-pulse"
                style={{
                  transform: 'rotate(15deg)',
                  fontSize: '16px',
                  animationDuration: '3s'
                }}
              >
                ✦
              </div>
              
              {/* Top-center sparkle */}
              <div 
                className="absolute top-12 left-1/2 transform -translate-x-1/2 text-gray-800 dark:text-white opacity-20 dark:opacity-80 animate-pulse"
                style={{
                  transform: 'rotate(-25deg) translateX(-50%)',
                  fontSize: '12px',
                  animationDuration: '2.5s'
                }}
              >
                ✦
              </div>
              
              {/* Top-right sparkle */}
              <div 
                className="absolute top-24 right-20 text-gray-800 dark:text-white opacity-12 dark:opacity-50 animate-pulse"
                style={{
                  transform: 'rotate(45deg)',
                  fontSize: '14px',
                  animationDuration: '4s'
                }}
              >
                ✦
              </div>
              
              {/* Middle-left sparkle */}
              <div 
                className="absolute top-1/2 left-12 transform -translate-y-1/2 text-gray-800 dark:text-white opacity-18 dark:opacity-70 animate-pulse"
                style={{
                  transform: 'rotate(-15deg) translateY(-50%)',
                  fontSize: '18px',
                  animationDuration: '3.5s'
                }}
              >
                ✦
              </div>
              
              {/* Middle-right sparkle */}
              <div 
                className="absolute top-1/2 right-16 transform -translate-y-1/2 text-gray-800 dark:text-white opacity-15 dark:opacity-60 animate-pulse"
                style={{
                  transform: 'rotate(30deg) translateY(-50%)',
                  fontSize: '13px',
                  animationDuration: '2.8s'
                }}
              >
                ✦
              </div>
              
              {/* Bottom-right sparkle */}
              <div 
                className="absolute bottom-20 right-24 text-gray-800 dark:text-white opacity-20 dark:opacity-80 animate-pulse"
                style={{
                  transform: 'rotate(-40deg)',
                  fontSize: '15px',
                  animationDuration: '3.2s'
                }}
              >
                ✦
              </div>
              
              {/* Additional center sparkle */}
              <div 
                className="absolute top-1/3 left-1/3 text-gray-800 dark:text-white opacity-10 dark:opacity-40 animate-pulse"
                style={{
                  transform: 'rotate(60deg)',
                  fontSize: '11px',
                  animationDuration: '4.5s'
                }}
              >
                ✦
              </div>
            </div>

            {/* Grid overlay for futuristic feel */}
            <div className="absolute inset-0 pointer-events-none">
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: 'radial-gradient(circle, rgb(75 85 99) 1px, transparent 1px)',
                  backgroundSize: '50px 50px'
                }}
              ></div>
            </div>
            
            {/* Hero content */}
            <div className="relative z-10 text-center px-4">
              {/* Brand text */}
              <div className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-8 tracking-wide flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                AG Solution AI
              </div>
              
              {/* Hero heading */}
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 dark:from-white dark:via-gray-200 dark:to-gray-400 bg-clip-text text-transparent leading-tight mb-8">
                Real-time sensor data monitoring.<br />
                Batch processing and analysis<br />
                Production & Equipment tracking.
              </h1>
              
              {/* Description paragraph */}
              <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl max-w-3xl mx-auto mb-12 px-4 leading-relaxed">
               AG Solution builds intelligent solutions for the process industry. We offer customers a broad experience and high quality in building automation systems, process control, data management, operational intelligence, MOM solutions, ICT infra & security.
              </p>
              
              
            </div>
          </div>

          {/* Divider Section
          <div className="relative py-16">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-gray-50 dark:bg-black px-8 text-gray-600 dark:text-gray-400 text-sm font-medium">
                Available Tools
              </span>
            </div>
          </div> */}


          {/* Cards Section */}
          <div className="relative pb-20">
            {/* Section Header */}
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Available Tools
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Powerful tools to transform your workflow
              </p>
            </div>

            {/* Feature Cards */}
            <div className="max-w-6xl mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                {/* Batch Analysis Card */}
                <div className="group w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4)] hover:border hover:border-indigo-500/20 dark:hover:border-indigo-400/30 transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer animate-slide-up">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-6 p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl group-hover:scale-105 transition-transform duration-300">
                      <BarChart3 className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Batch Analysis
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                      Process large datasets efficiently with automated batch operations and detailed analytics reporting.
                    </p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors duration-200 group-hover:scale-105">
                      Launch Tool
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* AI Chatbot Card */}
                <div className="group w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4)] hover:border hover:border-emerald-500/20 dark:hover:border-emerald-400/30 transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer animate-slide-up-delay-100">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-6 p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl group-hover:scale-105 transition-transform duration-300">
                      <MessageCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      AI Chatbot
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                      Intelligent conversational AI that understands context and provides personalized assistance 24/7.
                    </p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 dark:bg-emerald-500 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-colors duration-200 group-hover:scale-105">
                      Launch Tool
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Smart Alarms Card */}
                <Link href="/alarms" className="group w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.4)] hover:border hover:border-amber-500/20 dark:hover:border-amber-400/30 transition-all duration-300 ease-out hover:-translate-y-1 cursor-pointer animate-slide-up-delay-200 block">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-6 p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl group-hover:scale-105 transition-transform duration-300">
                      <Bell className="w-8 h-8 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      Smart Alarms
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                      Proactive monitoring system with customizable alerts and real-time notifications for critical events.
                    </p>
                    <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 dark:bg-amber-500 text-white rounded-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors duration-200 group-hover:scale-105">
                      Launch Tool
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <footer className="relative py-16 mt-20">
            {/* Radial gradient glow effect - same as hero */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,_rgba(147,197,253,0.2)_0%,_transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_30%,_rgba(59,130,246,0.15)_0%,_transparent_50%)]"></div>
            
            {/* Footer Content */}
            <div className="relative z-10 max-w-4xl mx-auto px-4">
              <div className="text-center space-y-6">
                {/* Copyright */}
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  © 2025 AG Solution NV - All rights reserved
                </p>
                
                {/* Policy Links */}
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                  <a 
                    href="https://www.agsolutiongroup.com/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    Privacy Policy
                  </a>
                  <span className="text-gray-400 dark:text-gray-600">-</span>
                  <a 
                    href="https://www.agsolutiongroup.com/information-security-management-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    Information Security Policy
                  </a>
                  <span className="text-gray-400 dark:text-gray-600">-</span>
                  <a 
                    href="https://www.agsolutiongroup.com/quality-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    Quality Policy
                  </a>
                  <span className="text-gray-400 dark:text-gray-600">-</span>
                  <a 
                    href="https://www.agsolutiongroup.com/terms-conditions" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    Terms & Conditions
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}

export default Dashboard