"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Logo from "@/components/icons/logo";
import { User, LogOut, EllipsisVertical } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SessionProvider, useSession, signOut } from "next-auth/react";
import { PrimaryPages, SecondaryPages } from "@/config";

function AppSidebarInner() {
  const session = useSession();
  const pathname = usePathname();
  return (
    <Sidebar variant="floating" className="hidden sm:block">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-5!"
              size="lg"
            >
              <Link href="/app">
                <Logo className="size-5!"/>
                <span className="text-lg font-semibold">Schooler</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="gap-2">
                {PrimaryPages.map((page) => (
                  <SidebarMenuButton
                    key={page.href}
                    variant={pathname.startsWith(page.href) ? "secondary" : "default"}
                    className="p-5"
                    asChild
                  >
                    <Link href={page.href}>
                      {page.icon}
                      {page.label}
                    </Link>
                  </SidebarMenuButton>
                ))}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="gap-2">
                {SecondaryPages.map((page) => (
                  <SidebarMenuButton
                    key={page.href}
                    variant={pathname.startsWith(page.href) ? "secondary" : "default"}
                    className="p-5"
                    asChild
                  >
                    <Link href={page.href}>
                      {page.icon}
                      {page.label}
                    </Link>
                  </SidebarMenuButton>
                ))}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator/>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-muted-foreground"
                >
                  <Avatar>
                    <AvatarImage src={session?.data?.user.image || undefined} alt={session?.data?.user.name || "User Avatar"} />
                    <AvatarFallback>{session?.data?.user.name != null ? session?.data?.user.name[0] : ""}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{session?.data?.user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{session?.data?.user.email}</span>
                  </div>
                  <EllipsisVertical className="ml-auto size-4!"/>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="end"
                side="right"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar>
                      <AvatarImage src={session?.data?.user.image || undefined} alt={session?.data?.user.name || "User Avatar"} />
                      <AvatarFallback>{session?.data?.user.name != null ? session?.data?.user.name[0] : ""}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium text-foreground">{session?.data?.user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{session?.data?.user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/app/profile">
                      <User/>
                      Profile
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Button variant="destructive" className="w-full justify-start" onClick={() => signOut()}>
                    <LogOut />
                    Sign out
                  </Button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default function AppSidebar() {
  return (
    <SessionProvider>
      <AppSidebarInner />
    </SessionProvider>
  )
}