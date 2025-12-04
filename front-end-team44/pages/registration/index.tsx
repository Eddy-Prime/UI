import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import { Button } from '../../components/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/components/ui/card'
import { Input } from '../../components/components/ui/input'
import { Label } from '../../components/components/ui/label'
import { EyeIcon, EyeOffIcon } from 'lucide-react'
import TypingAnimation from '../../components/TypingAnimation'
import { ModeToggle } from '../../components/ModeToggle'

const Registration: React.FC = () => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required.')
      setIsLoading(false)
      return
    }

    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address.')
      setIsLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      setIsLoading(false)
      return
    }

    try {
      // Call the backend API
      const response = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        }),
      })

      if (response.ok) {
        const userData = await response.json()
        // Automatically log in the user after registration
        const loginResponse = await fetch('http://localhost:8080/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        })

        if (loginResponse.ok) {
          const loginData = await loginResponse.json()
          localStorage.setItem('userSession', JSON.stringify({ 
            email: formData.email, 
            token: loginData.token,
            userId: loginData.user?.id || userData.id
          }))
          router.push('/dashboard')
        } else {
          // Registration successful but login failed, redirect to login
          router.push('/login')
        }
      } else {
        const errorData = await response.text()
        if (errorData.includes('already exists')) {
          setError('An account with this email already exists.')
        } else {
          setError('Failed to create account. Please try again.')
        }
      }
    } catch (error) {
      setError('Failed to connect to server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Sign Up - AG Solution</title>
        <meta name="description" content="Create your AG Solution account" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      <main className="relative min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
        {/* Moving orbs animation - Left side only */}
        <div className="absolute inset-0 overflow-hidden z-5">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gray-300 dark:bg-gray-600 opacity-15 dark:opacity-25 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-20 w-96 h-96 bg-gray-400 dark:bg-gray-500 opacity-10 dark:opacity-20 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute bottom-20 left-32 w-80 h-80 bg-gray-200 dark:bg-gray-700 opacity-8 dark:opacity-15 rounded-full blur-3xl animate-ping"></div>
        </div>

        {/* Logo - Top Left */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="AG Solution Logo"
            width={190}
            height={50}
            className="rounded-lg"
          />
          
        </div>

        {/* Theme Toggle - Top Right */}
        <div className="absolute top-6 right-6 z-20">
          <ModeToggle />
        </div>

        {/* Full-screen split layout */}
        <div className="relative z-10 flex min-h-screen">
          {/* Left Panel - 50% width */}
          <div className="w-1/2 flex items-center pl-16 relative z-10 bg-gray-50 dark:bg-[#1a1a1a] transition-colors duration-300">
            <div className="max-w-2xl">
              <TypingAnimation 
                className="text-6xl font-bold text-gray-900 dark:text-white text-left leading-tight"
                style={{fontFamily: 'Inter, sans-serif'}}
              />
            </div>
          </div>

          {/* Middle - Vertical divider */}
          <div className="w-0.6 bg-gray-300 dark:bg-gray-700 transition-colors duration-300"></div>

          {/* Right Panel - 50% width */}
          <div className="w-1/2 flex items-center justify-center px-8">
            <Card className="w-full max-w-md border border-gray-300 dark:border-gray-600 shadow-lg bg-white dark:bg-gray-800 transition-colors duration-300">
              <CardHeader className="text-center space-y-2 pb-6">
                <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white transition-colors duration-300">Create an account</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Enter your information below to create your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="h-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-300"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="h-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-300"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        className="h-10 pr-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white transition-colors duration-300"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-10 px-3 py-0 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm text-center">{error}</div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full h-10 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>

                <div className="text-center text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Already have an account?{' '}
                  <Link href="/login" className="underline underline-offset-4 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                    Sign in
                  </Link>
                </div>

                <div className="text-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
                  By clicking continue, you agree to our{' '}
                  <Link href="#" className="underline underline-offset-4 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                    Terms of Service
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  )
};

export default Registration;
