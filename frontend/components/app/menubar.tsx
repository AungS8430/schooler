"use client";

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
import { User, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut, SessionProvider } from "next-auth/react";
import { PrimaryPages, SecondaryPages } from "@/config";

function AppMenuBarInner() {
  const session = useSession();
  const pathname = usePathname();
  return (
    <div className="fixed flex justify-center bottom-0 w-full z-50 md:hidden">
      <div className="bg-sidebar ring-1 ring-sidebar-border rounded-lg shadow-sm mb-2 min-[490px]:scale-110 flex">
        {PrimaryPages.slice(0, PrimaryPages.length / 2).map((page) => (
          <Button
            key={page.href}
            variant={pathname.startsWith(page.href) ? "secondary" : "ghost"}
            asChild
            className="flex flex-col gap-1"
            size="icon-lg"
          >
            <Link href={page.href} className="inline-flex flex-col items-center">
              {page.icon}
            </Link>
          </Button>
        ))}
        <Button size="icon-lg">
          <Link href="/app" className="inline-flex items-center px-4">
            <Logo className="size-6!" />
          </Link>

        </Button>
        {PrimaryPages.slice(PrimaryPages.length / 2).map((page) => (
          <Button
            key={page.href}
            variant={pathname.startsWith(page.href) ? "secondary" : "ghost"}
            asChild
            className="flex flex-col gap-1"
            size="icon-lg"
          >
            <Link href={page.href} className="inline-flex flex-col items-center">
              {page.icon}
            </Link>
          </Button>
        ))}
      </div>
      <div className="min-[400px]:absolute right-2 bottom-0 min-[490px]:scale-110">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-lg" className="ml-2 mb-2">
              {session?.data?.user.image ? (
                <Avatar>
                  <AvatarImage src={session?.data?.user.image} alt={session?.data?.user.name || "User Avatar"} />
                  <AvatarFallback>{session?.data?.user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <User />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="end"
            side="top"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar>
                  <AvatarFallback>{session?.data?.user.name != null ? session?.data?.user.name[0] : ""}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-foreground">{session?.data?.user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">{session?.data?.user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {SecondaryPages.map((page) => (
                <DropdownMenuItem asChild key={page.href}>
                  <Link href={page.href}>
                    {page.icon}
                    {page.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/app/profile">
                  <User />
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
      </div>
    </div>
  );
}

export default function AppMenuBar() {
  return (
    <SessionProvider>
      <AppMenuBarInner />
    </SessionProvider>

  );
}