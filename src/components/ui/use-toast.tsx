
import * as React from "react"
import {
  Toast,
  ToastActionElement,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast as useToastHook, toast as toastFunction } from "@/hooks/use-toast"

import { cn } from "@/lib/utils"

type ToastProps = React.ComponentProps<typeof Toast>

export {
  Toast,
  ToastActionElement,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
}

// Update the toast function to properly handle error toasts
export function toast(props: ToastProps) {
  const { title, description, variant, duration, action, cancel, ...toastProps } = props

  // Special handling for error toasts on mobile
  const isMobile = window.innerWidth < 768
  const isErrorVariant = variant === 'destructive'
  
  // Position error toasts at the top on mobile
  const mobileErrorPosition = isErrorVariant && isMobile ? 'top-center' : undefined
  
  // Set duration for error messages
  const errorDuration = isErrorVariant ? 6000 : duration
  
  // Create and update toast
  return toastFunction({
    title: title,
    description: description,
    duration: errorDuration,
    className: cn({
      "border-destructive bg-destructive text-destructive-foreground": variant === "destructive",
      "border-muted bg-muted text-foreground": variant === "muted",
    }),
    position: mobileErrorPosition,
    ...toastProps,
    action,
  })
}

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterProps = {
  children?: React.ReactNode
}

const Toaster = ({ children }: ToasterProps) => {
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  )
}

export { Toaster }

const useToast = useToastHook

export { useToast }

const ToastContext = React.createContext({
  ...useToast(),
  toast,
})

export { ToastContext }

const TOAST_METHODS = {
  ...useToast(),
  toast,
}

export { TOAST_METHODS }
