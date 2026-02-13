"use client";

import { useState } from "react";
import AnnouncementCard from "@/components/app/announcement-card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Search } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function AnnouncementsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <div className="flex flex-col justify-start items-center w-fit h-screen gap-0 mx-auto">
      <div className="flex flex-col gap-2 sticky top-0 z-10 w-full p-3">
        <h1 className="text-2xl font-semibold">Announcements</h1>
        <div>
          <InputGroup>
            <InputGroupInput placeholder="Search announcements..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <InputGroupAddon><Search /></InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <InputGroupButton variant="default"><Search /></InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </div>
      <ScrollArea className="flex flex-col justify-start w-full max-w-full gap-6 overflow-y-auto p-3 pt-0 flex-1 mb-12 md:mb-0">
        <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-2">
          <AnnouncementCard
            id={1}
            title="Welcome to Schooler!"
            description="We're excited to have you on board. Explore the features and let us know if you have any questions."
            thumbnail={"/public/vercel.svg"}
            author={{ name: "Schooler Team", image: "/public/file.svg" }}
            date={new Date().toISOString()}
            target="C2R2 Students"
            priority={3}
          />
          <AnnouncementCard
            id={2}
            title="New Features Released"
            description="Check out the latest features we've added to enhance your experience."
            thumbnail={"/public/vercel.svg"}
            author={{ name: "Schooler Team", image: "/public/file.svg" }}
            date={new Date().toISOString()}
            target="All Users"
            priority={2}
          />
          <AnnouncementCard
            id={3}
            title="Scheduled Maintenance"
            description="Our platform will be undergoing maintenance on Saturday from 1 AM to 3 AM."
            thumbnail={"/public/vercel.svg"}
            author={{ name: "Schooler Team", image: "/public/file.svg" }}
            date={new Date().toISOString()}
            target="All Users"
            priority={1}
          />
          <AnnouncementCard
            id={1}
            title="Welcome to Schooler!"
            description="We're excited to have you on board. Explore the features and let us know if you have any questions."
            thumbnail={"/public/vercel.svg"}
            author={{ name: "Schooler Team", image: "/public/file.svg" }}
            date={new Date().toISOString()}
            target="C2R2 Students"
            priority={3}
          />
          <AnnouncementCard
            id={2}
            title="New Features Released"
            description="Check out the latest features we've added to enhance your experience."
            thumbnail={"/public/vercel.svg"}
            author={{ name: "Schooler Team", image: "/public/file.svg" }}
            date={new Date().toISOString()}
            target="All Users"
            priority={2}
          />
          <AnnouncementCard
            id={3}
            title="Scheduled Maintenance"
            description="Our platform will be undergoing maintenance on Saturday from 1 AM to 3 AM."
            thumbnail={"/public/vercel.svg"}
            author={{ name: "Schooler Team", image: "/public/file.svg" }}
            date={new Date().toISOString()}
            target="All Users"
            priority={1}
          />
        </div>
        <ScrollBar />
      </ScrollArea>
    </div>
  );
}