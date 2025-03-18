
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { SidebarContext, SidebarProvider, useSidebar } from "./sidebar-context"
import { Sidebar, SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON, SIDEBAR_WIDTH_MOBILE } from "./sidebar"
import { SidebarTrigger, SidebarRail } from "./sidebar-trigger"
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarSeparator,
} from "./sidebar-content"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "./sidebar-group"
import {
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  sidebarMenuButtonVariants,
} from "./sidebar-menu"
import {
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "./sidebar-sub-menu"

// Override SidebarProvider to wrap with TooltipProvider
const SidebarProviderWithTooltip = React.forwardRef<
  React.ElementRef<typeof SidebarProvider>,
  React.ComponentPropsWithoutRef<typeof SidebarProvider>
>(({ className, children, ...props }, ref) => {
  return (
    <SidebarProvider
      ref={ref}
      className={cn(
        "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
        className
      )}
      {...props}
    >
      <TooltipProvider delayDuration={0}>
        {children}
      </TooltipProvider>
    </SidebarProvider>
  )
})
SidebarProviderWithTooltip.displayName = "SidebarProvider"

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
  SidebarProviderWithTooltip as SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_ICON,
  SIDEBAR_WIDTH_MOBILE,
  sidebarMenuButtonVariants,
  useSidebar,
}

// Also export the context for advanced use cases
export { SidebarContext }
