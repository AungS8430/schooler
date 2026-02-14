"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sun, Moon, Laptop } from "lucide-react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tabsValue = mounted ? (theme ?? "system") : "system";

  return (
    <div className="flex flex-col justify-start items-center max-w-5xl w-full h-screen gap-0 mx-auto overflow-hidden">
      <div className="flex flex-col gap-4 sticky top-0 z-10 w-full p-3">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <div className="flex flex-row w-full gap-2">
          <div className="flex flex-col">
            <span className="font-semibold text-lg">Theme</span>
            <span className="text-sm text-muted-foreground">Select the theme, either dark, light or system. System theme will take the browser's or the system's settings.</span>
          </div>
          <div className="grow" />
          <Tabs value={tabsValue} className="my-auto" onValueChange={(value) => setTheme(value)}>
            <TabsList>
              <TabsTrigger value="light"><Sun />Light</TabsTrigger>
              <TabsTrigger value="dark"><Moon />Dark</TabsTrigger>
              <TabsTrigger value="system"><Laptop />System</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}