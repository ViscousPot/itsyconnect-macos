"use client";

import { useParams } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { AppSwitcher } from "./app-switcher";
import { NavMain } from "./nav-main";
import { NavFooter } from "./nav-footer";

export function AppSidebar() {
  const { appId } = useParams<{ appId?: string }>();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="drag pt-8">
        <div className="no-drag">
          <AppSwitcher />
        </div>
      </SidebarHeader>
      <SidebarContent>
        {appId && <NavMain appId={appId} />}
      </SidebarContent>
      <SidebarFooter>
        <NavFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
