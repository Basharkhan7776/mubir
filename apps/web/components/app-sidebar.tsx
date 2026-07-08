import * as React from "react";
import { Link, useLocation } from "react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Logo from "@/assets/logo.png";
import {
  Box,
  ChevronRight,
  CreditCard,
  Home,
  LogOut,
  PanelLeftIcon,
  ReceiptText,
  RefreshCcw,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";
import { PaginationEllipsis } from "./ui/pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";

const icons = {
  Box,
  CreditCard,
  Home,
  ReceiptText,
};

const data = {
  navMain: [
    {
      title: "Navigation",
      items: [
        {
          title: "Home",
          url: "/app",
          icon: "Home",
        },
        {
          title: "Inventory",
          url: "/app/inventory",
          icon: "Box",
        },
        {
          title: "Ledger",
          url: "/app/ledger",
          icon: "CreditCard",
        },
        {
          title: "Receipts",
          url: "/app/receipts",
          icon: "ReceiptText",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const location = useLocation();
  const { toggleSidebar, state } = useSidebar();

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader className="py-4 group-data-[collapsible=icon]:py-2 group-data-[collapsible=icon]:px-1">
        <Tooltip>
          <TooltipTrigger
            render={
              <div className="flex items-center justify-center gap-3 group-data-[collapsible=icon]:gap-0 cursor-default">
                <img
                  src={Logo}
                  alt="Logo"
                  className="size-8 p-1 border rounded-lg shrink-0"
                />
                <span className="font-extrabold text-3xl group-data-[collapsible=icon]:hidden">
                  Mudir.
                </span>
              </div>
            }
          />
          <TooltipContent
            side="right"
            align="center"
            hidden={state !== "collapsed"}
          >
            Mudir.
          </TooltipContent>
        </Tooltip>
      </SidebarHeader>
      <SidebarContent>
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => {
                  const Icon = icons[item.icon as keyof typeof icons];
                  return (
                    <SidebarMenuItem key={item.title} className="mb-2">
                      <SidebarMenuButton
                        render={<Link to={item.url} />}
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                        className="px-4 py-6 flex items-center justify-between text-lg group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:justify-center"
                      >
                        <div className="flex items-center gap-2">
                          {Icon && <Icon className="size-6 shrink-0" />}
                          <span className="group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                        </div>
                        <ChevronRight className="size-6 shrink-0 group-data-[collapsible=icon]:hidden" />
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="mb-2">
            <SidebarMenuButton
              onClick={() => toggleSidebar()}
              tooltip={state === "expanded" ? "Close sidebar" : "Open sidebar"}
              className="flex items-center justify-between group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:justify-center cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <PanelLeftIcon className="size-6 shrink-0" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {state === "expanded" ? "Close" : "Open"}
                </span>
              </div>
              <ChevronRight className="size-6 shrink-0 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Dialog>
              <DialogTrigger
                render={
                  <SidebarMenuButton
                    tooltip="Settings"
                    className="flex items-center justify-between group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:justify-center cursor-pointer w-full"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="size-6 shrink-0" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        Settings
                      </span>
                    </div>
                    <ChevronRight className="size-6 shrink-0 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                }
              />
              <DialogContent className="w-44">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Settings />
                    <span>Settings</span>
                  </div>
                </div>
                <Separator orientation="vertical" />
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCcw />
                    Sync
                  </div>
                  <ChevronRight />
                </Button>
                <Button
                  variant="ghost"
                  className="flex w-full items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <LogOut />
                    Sign out
                  </div>
                  <ChevronRight />
                </Button>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
