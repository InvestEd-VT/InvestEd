import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboardIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ListIcon,
  BookOpenIcon,
  Settings2Icon,
  CircleHelpIcon,
  TrendingUpIcon,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const data = {
  navMain: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: <LayoutDashboardIcon />,
    },
    {
      title: 'Portfolio',
      url: '/portfolio',
      icon: <BriefcaseIcon />,
    },
    {
      title: 'Trade',
      url: '/stock/AAPL',
      icon: <ChartBarIcon />,
    },
    {
      title: 'Transactions',
      url: '/transactions',
      icon: <ListIcon />,
    },
    {
      title: 'Learn',
      url: '/learn',
      icon: <BookOpenIcon />,
    },
  ],
  navSecondary: [
    {
      title: 'Settings',
      url: '/settings',
      icon: <Settings2Icon />,
    },
    {
      title: 'Get Help',
      url: '/help',
      icon: <CircleHelpIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((s) => s.user);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const userData = {
    name: fullName || user?.email?.split('@')[0] || 'User',
    email: user?.email ?? '',
    avatar: '',
  };

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="/dashboard">
                <TrendingUpIcon className="size-5!" />
                <span className="text-base font-semibold">InvestEd</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
