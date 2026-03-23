import * as React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar'
import { LayoutDashboardIcon, CreditCardIcon, ChartBarIcon, FileTextIcon } from 'lucide-react'

export function AppSidebarSimple(props: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user)

  const userInfo = {
    name: `${user?.firstName ?? 'Guest'}${user?.lastName ? ` ${user.lastName}` : ''}`,
    email: user?.email ?? '',
    avatar: '/vite.svg',
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <LayoutDashboardIcon className="size-5" />
                <span className="text-base font-semibold">InvestEd</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/dashboard" className="flex items-center gap-2">
                <LayoutDashboardIcon />
                Dashboard
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/portfolio" className="flex items-center gap-2">
                <CreditCardIcon />
                Portfolio
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/trade" className="flex items-center gap-2">
                <ChartBarIcon />
                Trade
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/learn" className="flex items-center gap-2">
                <FileTextIcon />
                Learn
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userInfo} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebarSimple
