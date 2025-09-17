
"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Home, Users, PanelLeft } from "lucide-react";
import { usePathname } from "next/navigation";
import { UserNav } from "./user-nav";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/icons";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const navLinks = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/buyers", icon: Users, label: "Buyers" },
];

type HeaderProps = {
  className?: string;
};

export function Header({ className }: HeaderProps) {
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    useEffect(() => {
      supabase.auth.getSession().then(({ data }) => {
        setIsAuthenticated(!!data.session)
      })
      const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
        setIsAuthenticated(!!session)
      })
      return () => { sub.subscription.unsubscribe() }
    }, [])
  return (
    <header
      className={cn(
        "sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6",
        className
      )}
    >
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs">
          <nav className="grid gap-6 text-lg font-medium">
            <NextLink
              href="#"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Logo className="h-6 w-6 text-primary" />
              <span>Lead Nexus</span>
            </NextLink>
            {navLinks.map(({ href, icon: Icon, label }) => {
                 const isActive = pathname.startsWith(href);
                 return (
                    <NextLink
                        key={href}
                        href={href}
                        className={cn("flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground", isActive && "text-foreground")}
                    >
                        <Icon className="h-5 w-5" />
                        {label}
                    </NextLink>
            )})}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <NextLink
            href="#"
            className="group hidden items-center gap-2 text-lg font-semibold sm:flex"
            >
            <Logo className="h-6 w-6 text-primary" />
            <span>Lead Nexus</span>
        </NextLink>
      </div>

      <div className="flex-1" />
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <UserNav />
        ) : (
          <>
            <NextLink href="/auth/login">
              <Button variant="outline" size="sm">Log in</Button>
            </NextLink>
            <NextLink href="/auth/signup">
              <Button size="sm">Sign up</Button>
            </NextLink>
          </>
        )}
      </div>
    </header>
  );
}
