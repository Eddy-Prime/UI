import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from '../../components/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/components/ui/card'
import { Input } from '../../components/components/ui/input'
import { Label } from '../../components/components/ui/label'
import { EyeIcon, EyeOffIcon, GithubIcon } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left side - Company branding */}
      <div className="flex-1 bg-slate-900 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="w-8 h-8 bg-white rounded mr-3 flex items-center justify-center">
              <span className="text-slate-900 font-bold text-sm">AG</span>
            </div>
            <span className="text-white text-xl font-semibold">AG Solution</span>
          </div>
          <blockquote className="text-slate-300 text-lg italic max-w-md">
            "This library has saved me countless hours of work and helped me deliver 
            stunning designs to my clients faster than ever before."
          </blockquote>
          <cite className="text-slate-400 text-sm block mt-4">- Sofia Davis</cite>
        </div>
      </div>

      {/* Right side - Registration form */}
      <div className="flex-1 bg-white flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-none">
          <CardHeader className="text-center space-y-2 pb-4">
            <CardTitle className="text-2xl font-semibold">Create an account</CardTitle>
            <CardDescription className="text-slate-600">
              Enter your information below to create your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="h-10"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="h-10"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
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
                    className="h-10 pr-10"
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
                      <EyeOffIcon className="h-4 w-4 text-slate-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center">{error}</div>
              )}

              <Button 
                type="submit" 
                className="w-full h-10 bg-slate-900 hover:bg-slate-800"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full h-10">
              <GithubIcon className="mr-2 h-4 w-4" />
              GitHub
            </Button>

            <div className="text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/login" className="underline underline-offset-4 hover:text-slate-900">
                Sign in
              </Link>
            </div>

            <div className="text-center text-xs text-slate-500">
              By clicking continue, you agree to our{' '}
              <Link href="#" className="underline underline-offset-4 hover:text-slate-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="#" className="underline underline-offset-4 hover:text-slate-700">
                Privacy Policy
              </Link>
              .
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Registration