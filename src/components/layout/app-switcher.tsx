"use client";

import { useParams, useRouter } from "next/navigation";
import { CaretUpDown, Plus, SpinnerGap } from "@phosphor-icons/react";
import { useApps } from "@/lib/apps-context";
import { useFormDirty } from "@/lib/form-dirty-context";
import { AppIcon } from "@/components/app-icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

export function AppSwitcher() {
  const router = useRouter();
  const { appId } = useParams<{ appId?: string }>();
  const { isMobile } = useSidebar();
  const { apps, loading } = useApps();
  const { guardNavigation } = useFormDirty();

  const activeApp = apps.find((a) => a.id === appId);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {loading ? (
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-muted">
                  <SpinnerGap size={16} className="animate-spin text-muted-foreground" />
                </div>
              ) : (
                <AppIcon
                  iconUrl={activeApp?.iconUrl}
                  name={activeApp?.name ?? "App"}
                  className="size-8"
                  iconSize={16}
                />
              )}
              <span className="truncate font-semibold text-sm">
                {loading
                  ? "Loading..."
                  : activeApp?.name ?? "Select an app"}
              </span>
              <CaretUpDown className="ml-auto" size={16} />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Apps
            </DropdownMenuLabel>
            {apps.length === 0 && !loading && (
              <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                No apps found
              </div>
            )}
            {apps.map((app) => (
              <DropdownMenuItem
                key={app.id}
                onClick={() => guardNavigation(() => router.push(`/dashboard/apps/${app.id}`))}
                className="gap-2 p-2"
              >
                <AppIcon
                  iconUrl={app.iconUrl}
                  name={app.name}
                  className="size-6"
                  iconSize={12}
                />
                <div className="grid flex-1 leading-tight">
                  <span className="truncate font-medium">{app.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {app.bundleId}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => guardNavigation(() => router.push("/dashboard/settings"))}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus size={14} />
              </div>
              <div className="font-medium text-muted-foreground">
                Add credentials
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
