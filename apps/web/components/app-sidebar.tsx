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
import Logo from "@/public/logo.png";
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
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar {...props} className="border rounded-lg m-4 h-[calc(100vh-)]">
      <SidebarHeader className="rounded-lg">
        <div className="flex items-center justify-center gap-3">
          <img src={Logo} alt="Logo" className="size-8 p-1 border rounded-lg" />
          <span className="font-extrabold text-3xl">Mudir.</span>
        </div>
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
                    <SidebarMenuItem key={item.title}>
                      <Link
                        to={item.url}
                        className="flex items-center gap-2 mb-4"
                      >
                        <SidebarMenuButton
                          isActive={location.pathname === item.url}
                          className="px-4 py-6 flex items-center justify-between text-lg"
                        >
                          <div className="flex items-center gap-2">
                            {Icon && <Icon className="size-6" />}
                            <span>{item.title}</span>
                          </div>

                          <ChevronRight className="size-6" />
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <Button
          className="flex items-center justify-between gap-2"
          variant="ghost"
          onClick={() => toggleSidebar()}
        >
          <div className="flex items-center gap-2">
            <PanelLeftIcon />
            Close
          </div>
          <ChevronRight />
        </Button>
        <Dialog>
          <Button variant="ghost" className="flex">
            <DialogTrigger className="w-full flex  items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Settings />
                Settings
              </div>
              <ChevronRight />
            </DialogTrigger>
          </Button>
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
      </SidebarFooter>
    </Sidebar>
  );
}
