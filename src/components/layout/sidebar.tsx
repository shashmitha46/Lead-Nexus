
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, PanelLeft, PanelRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/buyers", icon: Users, label: "Buyers" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  if (!isMounted) {
    return (
        <aside
        className={cn(
          "hidden sm:block fixed h-full z-10 border-r bg-background transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-60"
        )}
        />
    );
  }

  return (
    <>
    <aside
      className={cn(
        "hidden sm:flex flex-col h-full z-10 border-r bg-background transition-all duration-300 ease-in-out fixed",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex-1 overflow-auto py-2">
        <nav
          className={cn(
            "grid items-start px-2 text-sm font-medium",
            isCollapsed && "px-0"
          )}
        >
          <TooltipProvider>
            {navLinks.map(({ href, icon: Icon, label }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Tooltip key={href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        isActive && "bg-muted text-primary",
                        isCollapsed && "justify-center"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {!isCollapsed && (
                        <span className="truncate">{label}</span>
                      )}
                      <span className="sr-only">{label}</span>
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right">{label}</TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <Button
          variant="outline"
          size="icon"
          className={cn("h-10 w-10", !isCollapsed && "w-full")}
          onClick={toggleSidebar}
        >
          {isCollapsed ? <PanelRight /> : <PanelLeft />}
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      </div>
    </aside>
    <div className={cn("hidden sm:block transition-all duration-300 ease-in-out", isCollapsed ? "pl-16" : "pl-60")} />
    </>
  );
}
