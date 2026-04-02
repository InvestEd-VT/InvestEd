import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { LayoutDashboardIcon, CreditCardIcon, ChartBarIcon, FileTextIcon } from 'lucide-react';

export function AppSidebarSimple(props: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user);

  const userInfo = {
    name: `${user?.firstName ?? 'Guest'}${user?.lastName ? ` ${user.lastName}` : ''}`,
    email: user?.email ?? '',
    avatar: '/vite.svg',
  };

  return (
    <Sidebar className="border-r border-zinc-900" collapsible="offcanvas" {...props}>
      <SidebarHeader className="py-3">
        <NavLink to="/dashboard" className="flex items-center gap-2">
          <span className="text-base font-semibold">InvestEd</span>
        </NavLink>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `flex items-center gap-2 ${isActive ? 'font-semibold text-primary' : ''}`
                }
              >
                <LayoutDashboardIcon />
                Dashboard
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/portfolio"
                className={({ isActive }) =>
                  `flex items-center gap-2 ${isActive ? 'font-semibold text-primary' : ''}`
                }
              >
                <CreditCardIcon />
                Portfolio
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/trade"
                className={({ isActive }) =>
                  `flex items-center gap-2 ${isActive ? 'font-semibold text-primary' : ''}`
                }
              >
                <ChartBarIcon />
                Trade
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <NavLink
                to="/learn"
                className={({ isActive }) =>
                  `flex items-center gap-2 ${isActive ? 'font-semibold text-primary' : ''}`
                }
              >
                <FileTextIcon />
                Learn
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userInfo} />
      </SidebarFooter>
    </Sidebar>
  );
}

export default AppSidebarSimple;
