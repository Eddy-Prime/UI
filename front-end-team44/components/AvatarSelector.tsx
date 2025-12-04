'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@components/components/ui/avatar'
import { Button } from '@components/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@components/components/ui/dialog'
import { User, Upload, Camera } from 'lucide-react'

interface AvatarSelectorProps {
  currentAvatar?: string
  userInitial: string
  userName: string
  onAvatarSelect: (avatarUrl: string) => void
  size?: 'sm' | 'md' | 'lg'
}

// Predefined avatar options (you can expand this list)
const avatarOptions = [
  {
    id: 'avatar-1',
    url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    name: 'Professional Woman'
  },
  {
    id: 'avatar-2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    name: 'Professional Man'
  },
  {
    id: 'avatar-3',
    url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    name: 'Friendly Woman'
  },
  {
    id: 'avatar-4',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    name: 'Casual Man'
  },
  {
    id: 'avatar-5',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face',
    name: 'Business Woman'
  },
  {
    id: 'avatar-6',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    name: 'Creative Man'
  },
  {
    id: 'avatar-7',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    name: 'Student'
  },
  {
    id: 'avatar-8',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    name: 'Executive'
  }
]

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  currentAvatar,
  userInitial,
  userName,
  onAvatarSelect,
  size = 'md'
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar || '')
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync internal state with prop changes (for persistence after refresh)
  useEffect(() => {
    setSelectedAvatar(currentAvatar || '')
  }, [currentAvatar])

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl)
    onAvatarSelect(avatarUrl)
    
    // Save to localStorage
    const sessionData = localStorage.getItem('userSession')
    if (sessionData) {
      const session = JSON.parse(sessionData)
      session.avatar = avatarUrl
      localStorage.setItem('userSession', JSON.stringify(session))
    }
    
    setIsOpen(false)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    setIsUploading(true)

    try {
      // Create a file reader to convert to base64
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          handleAvatarSelect(result)
        }
        setIsUploading(false)
      }
      reader.onerror = () => {
        alert('Error reading file')
        setIsUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error uploading file')
      setIsUploading(false)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const resetToInitial = () => {
    setSelectedAvatar('')
    onAvatarSelect('')
    
    // Remove from localStorage
    const sessionData = localStorage.getItem('userSession')
    if (sessionData) {
      const session = JSON.parse(sessionData)
      delete session.avatar
      localStorage.setItem('userSession', JSON.stringify(session))
    }
    
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-all duration-200 hover:opacity-80 hover:scale-105">
          <Avatar className={sizeClasses[size]}>
            {selectedAvatar ? (
              <AvatarImage src={selectedAvatar} alt={userName} />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
              {userInitial}
            </AvatarFallback>
          </Avatar>
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose Your Avatar</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Selection Preview */}
          <div className="flex items-center justify-center p-4 border rounded-lg">
            <div className="text-center space-y-2">
              <Avatar className="h-16 w-16 mx-auto">
                {selectedAvatar ? (
                  <AvatarImage src={selectedAvatar} alt={userName} />
                ) : null}
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm text-gray-600 dark:text-gray-400">Current Selection</p>
            </div>
          </div>

          {/* Upload Button */}
          <div className="flex justify-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
              id="avatar-upload"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Your Photo
                </>
              )}
            </Button>
          </div>

          {/* Avatar Options Grid */}
          <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto">
            {avatarOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAvatarSelect(option.url)}
                className={`relative rounded-full transition-all duration-200 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  selectedAvatar === option.url 
                    ? 'ring-2 ring-primary ring-offset-2' 
                    : ''
                }`}
                title={option.name}
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage src={option.url} alt={option.name} />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={resetToInitial}
              className="flex-1"
            >
              Use Initials
            </Button>
            {selectedAvatar && (
              <Button
                variant="outline"
                onClick={resetToInitial}
                className="flex-1 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
              >
                Remove Picture
              </Button>
            )}
            <Button
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}