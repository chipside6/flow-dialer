
import * as React from "react"
import { 
  useToast as useHookToast,
  type ToastActionElement, 
  type ToastProps 
} from "@/components/ui/toast"

const useToast = () => {
  return useHookToast()
}

const toast = (props: ToastProps) => {
  const { toast } = useHookToast()
  
  // Handle mobile error toasts
  const isMobile = window.innerWidth < 768
  const isErrorVariant = props.variant === 'destructive'
  
  // Set position for error toasts on mobile
  const position = isErrorVariant && isMobile ? 'top-center' : props.position
  
  // Set longer duration for error messages
  const duration = isErrorVariant ? 6000 : props.duration
  
  return toast({
    ...props,
    duration,
    position,
  })
}

export { toast, useToast }
export type { ToastProps, ToastActionElement }
