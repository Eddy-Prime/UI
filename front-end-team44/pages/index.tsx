import Head from "next/head"
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import TypingAnimation from '../components/TypingAnimation'
import { ModeToggle } from '../components/ModeToggle'

const Home: React.FC = () => {

  return (
    <>
      <Head>
        <title>AG Solution</title>
        <meta name="description" content="GenAI-powered assistant for quality investigation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </Head>
      <main className="relative min-h-screen bg-white dark:bg-[#0a0a0a] transition-colors duration-300">
       

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
          <div className="w-0.6 bg-gray-300 dark:bg-gray-950 transition-colors duration-300"></div>

          {/* Right Panel - 50% width */}
          <div className="w-1/2 flex items-center justify-center px-8">
            <div className="w-full max-w-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300">
                  Get started
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  Choose how you'd like to continue
                </p>
              </div>
              
              <div className="space-y-4">
                <Link 
                  className="w-full px-6 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg transition-all duration-200 font-medium hover:bg-gray-800 dark:hover:bg-gray-200 block text-center"
                  href={'/login'}
                >
                  Log in
                </Link>
                <Link 
                  className="w-full px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg transition-all duration-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 block text-center"
                  href={'/registration'}
                >
                  Sign Up Free
                </Link>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-6 transition-colors duration-300">
                By continuing, you agree to our{' '}
                <Link href="#" className="underline hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                  Terms of Service
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* <footer className={`absolute bottom-6 left-6 flex items-center gap-2 z-10 ${
        
      }`}>
        <span className="text-sm font-medium">AG Solution</span>
      </footer> */}
    </>
  )
}

export default Home
