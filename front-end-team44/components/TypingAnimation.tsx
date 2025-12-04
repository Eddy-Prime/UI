import React, { useState, useEffect } from 'react'

const phrases = [
  "Real-time sensor data monitoring",
  "Batch processing and analysis", 
  "Manufacturing quality logs",
  "Alarm and alert management",
  "Production line insights",
  "Equipment performance tracking"
]

interface TypingAnimationProps {
  className?: string
  style?: React.CSSProperties
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ className, style }) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    const currentPhrase = phrases[currentPhraseIndex]
    
    if (isTyping) {
      if (currentText.length < currentPhrase.length) {
        const timeout = setTimeout(() => {
          setCurrentText(currentPhrase.slice(0, currentText.length + 1))
        }, 100)
        return () => clearTimeout(timeout)
      } else {
        const timeout = setTimeout(() => {
          setIsTyping(false)
        }, 2000)
        return () => clearTimeout(timeout)
      }
    } else {
      if (currentText.length > 0) {
        const timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1))
        }, 50)
        return () => clearTimeout(timeout)
      } else {
        setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length)
        setIsTyping(true)
      }
    }
  }, [currentText, isTyping, currentPhraseIndex])

  return (
    <div className="flex items-center justify-center min-h-[120px]">
      <span 
        className={`font-bold transition-colors duration-300 ${className || 'text-xl'}`}
        style={style}
      >
        {currentText}
        <span className="animate-pulse">|</span>
      </span>
    </div>
  )
}

export default TypingAnimation