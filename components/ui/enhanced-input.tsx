import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"

import { cn } from "@/lib/utils"

const enhancedInputVariants = cva(
  "flex w-full rounded-xl border border-input bg-background px-4 py-3 text-base ring-offset-background transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:border-ring",
        success: "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500",
        error: "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500",
        warning: "border-yellow-500 focus-visible:border-yellow-500 focus-visible:ring-yellow-500",
      },
      inputSize: {
        default: "h-12 px-4 text-base",
        sm: "h-10 px-3 text-sm",
        lg: "h-14 px-5 text-lg",
        // Mobile-optimized
        touch: "h-14 px-4 text-base", // Better for mobile keyboards
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
)

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof enhancedInputVariants> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
  loading?: boolean
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  (
    {
      className,
      variant,
      inputSize,
      type,
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      showPasswordToggle,
      loading,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const generatedId = React.useId()
    const inputId = id || generatedId
    
    // Determine variant based on state
    const currentVariant = error ? "error" : success ? "success" : variant
    
    // Handle password toggle
    const handlePasswordToggle = () => {
      setShowPassword(!showPassword)
    }
    
    // Get appropriate input type
    const inputType = type === "password" && showPasswordToggle
      ? (showPassword ? "text" : "password")
      : type

    // Mobile-specific input types for better keyboard
    const getMobileInputType = (type: string) => {
      switch (type) {
        case "email":
          return "email"
        case "tel":
        case "phone":
          return "tel"
        case "number":
        case "currency":
          return "number"
        case "url":
          return "url"
        default:
          return inputType
      }
    }

    return (
      <div className="space-y-2">
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors",
              error ? "text-red-600" : success ? "text-green-600" : "text-foreground"
            )}
          >
            {label}
          </label>
        )}
        
        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          
          {/* Input Field */}
          <input
            type={getMobileInputType(type || "text")}
            className={cn(
              enhancedInputVariants({ variant: currentVariant, inputSize, className }),
              leftIcon && "pl-10",
              (rightIcon || showPasswordToggle || loading) && "pr-10",
              isFocused && "ring-2 ring-ring ring-offset-2"
            )}
            ref={ref}
            id={inputId}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            // Mobile optimization attributes
            autoCapitalize={type === "email" ? "none" : "sentences"}
            autoCorrect={type === "email" ? "off" : "on"}
            spellCheck={type === "email" || type === "password" ? "false" : "true"}
            {...props}
          />
          
          {/* Right Icon / Loading / Password Toggle */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
            )}
            
            {!loading && showPasswordToggle && type === "password" && (
              <button
                type="button"
                onClick={handlePasswordToggle}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded touch-manipulation"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
            
            {!loading && !showPasswordToggle && rightIcon && (
              <div className="text-muted-foreground">
                {rightIcon}
              </div>
            )}
            
            {/* Success/Error Icons */}
            {!loading && success && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {!loading && error && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        </div>
        
        {/* Helper Text / Error / Success Message */}
        {(error || success || helperText) && (
          <div className="text-sm space-y-1">
            {error && (
              <p className="text-red-600 flex items-start space-x-1">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </p>
            )}
            {!error && success && (
              <p className="text-green-600 flex items-start space-x-1">
                <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{success}</span>
              </p>
            )}
            {!error && !success && helperText && (
              <p className="text-muted-foreground">{helperText}</p>
            )}
          </div>
        )}
      </div>
    )
  }
)

EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput, enhancedInputVariants }
