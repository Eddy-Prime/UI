import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { 
  Send, 
  Menu, 
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  User,
  BarChart3,
  MessageCircle,
  Bell,
  Download,
  Wand2,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { ModeToggle } from '../components/ModeToggle'
import { ProfileDropdown } from '../components/ProfileDropdown'
import { Avatar, AvatarFallback, AvatarImage } from '../components/components/ui/avatar'
import { Button } from '../components/components/ui/button'
import { useToast } from '../components/hooks/use-toast'
import ChatService from '@services/chatServices'

interface Message {
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface PromptStarter {
  icon: any
  title: string
  prompt: string
}

const promptStarters: PromptStarter[] = [
  {
    icon: BarChart3,
    title: 'Batch Analysis',
    prompt: 'Show me the latest production batches with complete details including batch IDs, production dates, status, quality metrics, and any detected anomalies or failures.'
  },
  {
    icon: Settings,
    title: 'Equipment Status',
    prompt: "What's the current operational status of all production equipment? Highlight any maintenance issues, active alarms, or performance degradation."
  },
  {
    icon: BarChart3,
    title: 'Sensor Readings',
    prompt: 'Display real-time sensor readings across all equipment including temperature, pressure, flow rates, and any values outside normal operating ranges.'
  },
  {
    icon: Bell,
    title: 'Alarm Analysis',
    prompt: 'Show me all active and recent alarms from the past 24 hours. Help me identify patterns, recurring issues, or critical alerts requiring immediate attention.'
  }
]

const getWelcomeMessage = (): string => {
  const hour = new Date().getHours()
  
  if (hour >= 5 && hour < 12) {
    return "☀️ Good morning! Ready to investigate?"
  } else if (hour >= 12 && hour < 17) {
    return "🌤️ Good afternoon! What can I help with?"
  } else if (hour >= 17 && hour < 21) {
    return "🌆 Good evening! Let's dive in."
  } else {
    return Math.random() > 0.5 ? "🌙 Moonlit chat?" : "✨ Burning the midnight oil?"
  }
}




// Mock response generator
const generateMockResponse = (userMessage: string): string => {
  if (userMessage.toLowerCase().includes('batch')) {
    return `I found 12 active production batches. Here's the analysis:

**Recent Batches:**
• B-2024-1201: Polymerization phase, 94% complete
• B-2024-1202: Quality check phase, 2 minor alerts
• B-2024-1203: Drying phase, on schedule

**Quality Metrics:**
• Overall efficiency: 96.2%
• Defect rate: 0.8% (within tolerance)
• 3 batches flagged for review

Would you like me to dive deeper into any specific batch?`
  }
  
  if (userMessage.toLowerCase().includes('equipment')) {
    return `**Equipment Status Overview:**

🟢 **Operational (8/10)**
• Reactor Tank A1: Normal operations
• Mixing Unit B2: Normal operations  
• Dryer System C1: Normal operations

🟡 **Maintenance Required (2/10)**
• Pump P-401: Scheduled maintenance due
• Valve V-203: Minor pressure deviation

**Active Alerts:** 2 minor, 0 critical
**Next Maintenance:** Dec 5, 2025

Need details on any specific equipment?`
  }
  
  if (userMessage.toLowerCase().includes('sensor')) {
    return `**Real-time Sensor Readings:**

🌡️ **Temperature Sensors:**
• Reactor Core: 285°C (Normal: 280-290°C)
• Cooling System: 45°C (Normal: 40-50°C)

💨 **Pressure Readings:**
• Main Line: 12.4 bar (Normal: 10-15 bar)
• Secondary: 8.9 bar (Normal: 8-12 bar)

📊 **Flow Rates:**
• Input Stream: 450 L/min (Target: 440-460 L/min)
• Output Stream: 445 L/min

All readings within normal operating ranges.`
  }
  
  if (userMessage.toLowerCase().includes('alarm')) {
    return `**24-Hour Alarm Summary:**

🚨 **Active Alarms (3):**
• High Temperature Warning - Reactor Tank A2
• Low Pressure Alert - Line PL-102  
• Material Level Low - Storage Tank ST-05

📊 **Recent Patterns:**
• 47% of alarms between 2-4 PM (shift change)
• Temperature alerts increased 15% this week
• Most critical: Material supply chain delays

**Recommendations:** 
Check shift handover procedures and review temperature control calibration.`
  }
  
  return `I understand you're asking about ${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}. 

As your manufacturing quality investigation assistant, I can help you analyze:
• Production batch data and quality metrics  
• Equipment performance and maintenance status
• Sensor readings and operational parameters
• Alarm patterns and root cause analysis

What specific aspect would you like to investigate further?`
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [userData, setUserData] = useState({
    email: 'user@example.com',
    userName: 'User',
    userInitial: 'U',
    userAvatar: ''
  })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

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

    loadUserData()
    window.addEventListener('storage', loadUserData)
    window.addEventListener('focus', loadUserData)

    return () => {
      window.removeEventListener('storage', loadUserData)
      window.removeEventListener('focus', loadUserData)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handlePromptClick = (prompt: string) => {
    setInputValue(prompt)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)


    const response = await ChatService.sendMessage([...messages, userMessage].map(message => ({ role: message.role, content: message.content })))
    const responseData = await response.json();
    console.log(responseData)
    const responseBody = responseData.content
    console.log("response", responseBody)

    const assistantMessage: Message = {
      content: responseBody,
      role: 'assistant',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      <Head>
        <title>AI Chat - Manufacturing Assistant</title>
        <meta name="description" content="AI-powered manufacturing quality investigation assistant" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="flex w-screen h-screen bg-background text-foreground" style={{fontFamily: 'Inter, sans-serif'}}>
        {/* Left Sidebar - Exact same as dashboard */}
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
              
              {/* Collapse Button */}
              {!isCollapsed && (
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Collapse sidebar"
                >
                  <PanelLeftClose className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}
              
              {isCollapsed && (
                <button
                  onClick={toggleSidebar}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  title="Expand sidebar"
                >
                  <PanelLeftOpen className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            <nav className="space-y-2">
              {/* Dashboard */}
              <Link href="/dashboard" className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-4 py-3'} px-3 text-gray-600 dark:text-gray-400 font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white group`}>
                <BarChart3 className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all group-hover:scale-110 flex-shrink-0`} />
                {!isCollapsed && <span className="text-sm">Dashboard</span>}
              </Link>

              {/* AI Chatbot - Active */}
              <div className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-4 py-3'} px-3 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-medium rounded-lg border border-orange-200 dark:border-orange-800 relative`}>
                <MessageCircle className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`} />
                {!isCollapsed && <span className="text-sm">AI Chatbot</span>}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent rounded-lg pointer-events-none"></div>
              </div>

              {/* Settings */}
              <Link href="/settings" className={`flex items-center ${isCollapsed ? 'justify-center py-3' : 'gap-4 py-3'} px-3 text-gray-600 dark:text-gray-400 font-medium rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-neutral-900 hover:text-gray-900 dark:hover:text-white group`}>
                <Settings className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} transition-all group-hover:scale-110 flex-shrink-0`} />
                {!isCollapsed && <span className="text-sm">Settings</span>}
              </Link>
            </nav>
          </div>

          {/* Bottom Section - User Profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className={`flex items-center w-full ${isCollapsed ? 'justify-center p-2' : 'gap-3 p-3'} rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors group`}
              >
                <Avatar className="h-8 w-8">
                  {userData.userAvatar ? (
                    <AvatarImage src={userData.userAvatar} alt={userData.userName} />
                  ) : (
                    <AvatarFallback className="bg-orange-500 text-white text-sm font-medium">
                      {userData.userInitial}
                    </AvatarFallback>
                  )}
                </Avatar>
                {!isCollapsed && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {userData.userName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {userData.email}
                      </p>
                    </div>
                    <Settings className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </>
                )}
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && !isCollapsed && (
                <ProfileDropdown
                  isOpen={profileDropdownOpen}
                  onClose={() => setProfileDropdownOpen(false)}
                  userInitial={userData.userInitial}
                  userName={userData.userName}
                  userEmail={userData.email}
                  userAvatar={userData.userAvatar}
                  isCollapsed={false}
                />
              )}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-screen">


          {/* Messages Area - Claude Style */}
          <div className="flex-1 flex flex-col justify-center items-center px-8 bg-white dark:bg-[#0f0f0f]">
            {messages.length === 0 ? (
              /* Welcome Screen - Claude Style */
              <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-full py-8">
                {/* Top Section - Welcome Area */}
                <div className="text-center mb-12">
                  <div className="w-16 h-16 bg-gray-700 dark:bg-[#2d2d2d] rounded-full flex items-center justify-center mx-auto mb-8">
                    <Sparkles className="w-8 h-8 text-gray-300 dark:text-gray-400" />
                  </div>
                  <h1 className="text-4xl font-light text-gray-900 dark:text-white mb-4" style={{fontFamily: 'serif'}}>
                    {getWelcomeMessage()}
                  </h1>
                </div>

                {/* Middle Section - Hero Input Field */}
                <div className="w-full max-w-3xl mb-6">
                  <div className="relative">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="How can I help you today?"
                      className="w-full h-20 pl-16 pr-16 py-4 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#404040] rounded-2xl focus:outline-none focus:border-gray-400 dark:focus:border-[#525252] resize-none text-base text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      disabled={isLoading}
                    />
                    
                    {/* Left side icons */}
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <span className="text-sm font-medium">+</span>
                      </button>
                    </div>
                    
                    {/* Send Button - Only show when text exists */}
                    {inputValue.trim() && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Button
                          onClick={handleSendMessage}
                          disabled={!inputValue.trim() || isLoading}
                          className="w-8 h-8 p-0 bg-gray-600 hover:bg-gray-700 dark:bg-[#3a3a3a] dark:hover:bg-[#4a4a4a] text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Section - Small Prompt Pills */}
                <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
                  {promptStarters.map((starter, index) => {
                    const IconComponent = starter.icon
                    return (
                      <button
                        key={index}
                        onClick={() => handlePromptClick(starter.prompt)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-[#333] transition-colors"
                      >
                        <IconComponent className="w-3 h-3" />
                        <span>{starter.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              /* Chat Messages */
              <div className="p-4 space-y-6">
                {messages.map((message) => (
                  <div className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                    )}
                    
                    <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
                      <div className={`p-4 rounded-xl ${
                        message.role === 'user' 
                          ? 'bg-blue-600 text-white ml-auto max-w-md' 
                          : 'bg-gray-50 dark:bg-[#2a2a2a] text-gray-900 dark:text-[#e5e5e5]'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-[#666] mt-2 px-4">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-gray-600 dark:bg-[#404040] rounded-full flex items-center justify-center flex-shrink-0">
                        {userData.userAvatar ? (
                          <img src={userData.userAvatar} alt="User" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                    <div className="bg-gray-50 dark:bg-[#2a2a2a] p-4 rounded-xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>


        </div>
      </div>
    </>
  )
}

export default ChatPage