
import * as React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { 
  SidebarProvider, 
  useSidebar 
} from "./SidebarUtils"

import { 
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset
} from "./SidebarCore"

import {
  SidebarHeader,
  SidebarFooter,
  SidebarInput,
  SidebarSeparator,
  SidebarContent
} from "./SidebarHeader"

import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./SidebarMenu"

// Wrap the SidebarProvider with TooltipProvider
const SidebarWithTooltip = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof SidebarProvider>
>((props, ref) => {
  return (
    <SidebarProvider ref={ref} {...props}>
      <TooltipProvider delayDuration={0}>
        <div
          style={
            {
              "--sidebar-width": "16rem",
              "--sidebar-width-icon": "3rem",
              ...props.style,
            } as React.CSSProperties
          }
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
            props.className
          )}
        >
          {props.children}
        </div>
      </TooltipProvider>
    </SidebarProvider>
  )
})
SidebarWithTooltip.displayName = "SidebarWithTooltip"

// Replace the original SidebarProvider with our wrapped version
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarWithTooltip as SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
