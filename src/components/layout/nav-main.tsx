"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge,
  Storefront,
  Images,
  Stamp,
  PaperPlaneTilt,
  ChatsCircle,
  ChartLineUp,
  CurrencyDollar,
  Info,
  Package,
  UsersThree,
  ChatDots,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  href: string;
  icon: Icon;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

function getNavGroups(appId: string): NavGroup[] {
  const base = `/dashboard/apps/${appId}`;

  return [
    {
      label: "Release",
      items: [
        { title: "Overview", href: base, icon: Gauge },
        { title: "Store listing", href: `${base}/store-listing`, icon: Storefront },
        { title: "Screenshots", href: `${base}/screenshots`, icon: Images },
        { title: "App review", href: `${base}/review`, icon: Stamp },
        { title: "App details", href: `${base}/details`, icon: Info },
      ],
    },
    {
      label: "Insights",
      items: [
        { title: "Reviews", href: `${base}/reviews`, icon: ChatsCircle },
        { title: "Analytics", href: `${base}/analytics`, icon: ChartLineUp },
        { title: "Sales", href: `${base}/sales`, icon: CurrencyDollar },
      ],
    },
    {
      label: "TestFlight",
      items: [
        { title: "Builds", href: `${base}/testflight`, icon: Package },
        { title: "Groups", href: `${base}/testflight/groups`, icon: UsersThree },
        { title: "Info", href: `${base}/testflight/info`, icon: Info },
        { title: "Feedback", href: `${base}/testflight/feedback`, icon: ChatDots },
      ],
    },
  ];
}

export function NavMain({ appId }: { appId: string }) {
  const pathname = usePathname();
  const base = `/dashboard/apps/${appId}`;
  const groups = getNavGroups(appId);

  function isActive(href: string): boolean {
    // Exact match for root pages (Overview, Builds) to avoid matching sub-paths
    if (href === base || href === `${base}/testflight`) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive(item.href)}
                >
                  <Link href={item.href}>
                    <item.icon size={16} />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
