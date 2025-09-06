'use client'

import React, { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

// Fade In Animation
interface FadeInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export const FadeIn: React.FC<FadeInProps> = ({ 
  children, 
  delay = 0, 
  duration = 300, 
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

// Scale In Animation
interface ScaleInProps {
  children: React.ReactNode
  delay?: number
  duration?: number
  className?: string
}

export const ScaleIn: React.FC<ScaleInProps> = ({ 
  children, 
  delay = 0, 
  duration = 300, 
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

// Slide In Animation
interface SlideInProps {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  duration?: number
  className?: string
}

export const SlideIn: React.FC<SlideInProps> = ({ 
  children, 
  direction = 'up',
  delay = 0, 
  duration = 300, 
  className 
}) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, delay)

    return () => clearTimeout(timer)
  }, [delay])

  const getTransform = () => {
    if (isVisible) return 'translate-x-0 translate-y-0'
    
    switch (direction) {
      case 'left':
        return '-translate-x-8 translate-y-0'
      case 'right':
        return 'translate-x-8 translate-y-0'
      case 'up':
        return 'translate-x-0 -translate-y-8'
      case 'down':
        return 'translate-x-0 translate-y-8'
      default:
        return 'translate-x-0 translate-y-8'
    }
  }

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        getTransform(),
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

// Staggered Animation Container
interface StaggeredContainerProps {
  children: React.ReactNode
  stagger?: number
  className?: string
}

export const StaggeredContainer: React.FC<StaggeredContainerProps> = ({ 
  children, 
  stagger = 100, 
  className 
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <FadeIn delay={index * stagger} key={index}>
          {child}
        </FadeIn>
      ))}
    </div>
  )
}

// Loading Skeleton
interface SkeletonProps {
  className?: string
  animate?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, animate = true }) => {
  return (
    <div
      className={cn(
        'bg-muted rounded-md',
        animate && 'animate-pulse',
        className
      )}
    />
  )
}

// Pulse Animation
interface PulseProps {
  children: React.ReactNode
  className?: string
}

export const Pulse: React.FC<PulseProps> = ({ children, className }) => {
  return (
    <div className={cn('animate-pulse', className)}>
      {children}
    </div>
  )
}

// Bounce Animation
interface BounceProps {
  children: React.ReactNode
  className?: string
  trigger?: boolean
}

export const Bounce: React.FC<BounceProps> = ({ children, className, trigger = true }) => {
  return (
    <div className={cn(trigger && 'animate-bounce', className)}>
      {children}
    </div>
  )
}

// Hover Scale Effect
interface HoverScaleProps {
  children: React.ReactNode
  scale?: 'sm' | 'md' | 'lg'
  className?: string
}

export const HoverScale: React.FC<HoverScaleProps> = ({ 
  children, 
  scale = 'sm', 
  className 
}) => {
  const getScaleClass = () => {
    switch (scale) {
      case 'sm':
        return 'hover:scale-[1.02] active:scale-[0.98]'
      case 'md':
        return 'hover:scale-[1.05] active:scale-[0.95]'
      case 'lg':
        return 'hover:scale-[1.1] active:scale-[0.9]'
      default:
        return 'hover:scale-[1.02] active:scale-[0.98]'
    }
  }

  return (
    <div className={cn('transition-transform duration-200', getScaleClass(), className)}>
      {children}
    </div>
  )
}

// Progress Bar Animation
interface AnimatedProgressProps {
  value: number
  max?: number
  className?: string
  barClassName?: string
  animated?: boolean
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({ 
  value, 
  max = 100, 
  className, 
  barClassName,
  animated = true 
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  const percentage = Math.min((value / max) * 100, 100)

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayValue(percentage)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setDisplayValue(percentage)
    }
  }, [percentage, animated])

  return (
    <div className={cn('w-full bg-secondary rounded-full h-2 overflow-hidden', className)}>
      <div
        className={cn(
          'h-full bg-primary rounded-full transition-all duration-700 ease-out',
          barClassName
        )}
        style={{ width: `${displayValue}%` }}
      />
    </div>
  )
}

// Floating Action Button with animations
interface FloatingButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ 
  children, 
  onClick, 
  className,
  position = 'bottom-right'
}) => {
  const getPositionClass = () => {
    switch (position) {
      case 'bottom-right':
        return 'bottom-6 right-6'
      case 'bottom-left':
        return 'bottom-6 left-6'
      case 'top-right':
        return 'top-6 right-6'
      case 'top-left':
        return 'top-6 left-6'
      default:
        return 'bottom-6 right-6'
    }
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg',
        'hover:scale-110 hover:shadow-xl active:scale-95',
        'transition-all duration-200 ease-out',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'flex items-center justify-center',
        getPositionClass(),
        className
      )}
    >
      {children}
    </button>
  )
}
