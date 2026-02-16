"use client";

import { useEffect, useState } from "react";
import { usePerms } from "@/lib/perms";
import AnnouncementCard from "@/components/app/announcement-card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Announcement {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  author_id: string;
  authorName: string;
  authorImage?: string;
  date: string;
  priority: number;
}

export default function AnnouncementsPage() {
  const perms = usePerms();
  const [searchTerm, setSearchTerm] = useState("");
  const [announcementIds, setAnnouncementIds] = useState<number[]>([]);
  const [announcements, setAnnouncements] = useState<Map<number, Announcement>>(new Map());

  function fetchAnnouncementIds() {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE}/announcements?query=${encodeURIComponent(searchTerm)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setAnnouncementIds(data.announcement_ids);
      })
      .catch((error) => {
        console.error("Error fetching announcements:", error);
      });
  }
  useEffect(() => {
    fetchAnnouncementIds()
  }, [searchTerm])

  useEffect(() => {
    for (const id of announcementIds) {
      if (!announcements.has(id)) {
        fetch(`${process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE}/announcements/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
          .then((res) => res.json())
          .then((data) => {
            setAnnouncements(prev => new Map(prev).set(id, data.announcement));
          })
          .catch((error) => {
            console.error(`Error fetching announcement ${id}:`, error);
          });
      }
    }
  }, [announcementIds])
  return (
    <div className="flex flex-col justify-start items-center w-fit h-screen gap-0 mx-auto">
      <div className="flex flex-col gap-2 sticky top-0 z-10 w-full p-3">
        <h1 className="text-2xl font-semibold">Announcements</h1>
        <div className="flex flex-row gap-2 w-full">
          <InputGroup>
            <InputGroupInput placeholder="Search announcements..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <InputGroupAddon align="inline-end"><Search /></InputGroupAddon>
          </InputGroup>
          {
            (perms.role === "teacher" || perms.role === "admin") && (
              <Link href="/app/announcements/create">
                <Button size="icon"><Plus /></Button>
              </Link>
            )
          }
        </div>
      </div>
      <ScrollArea className="flex flex-col justify-start w-full max-w-full gap-6 overflow-y-auto p-3 pt-0 flex-1 mb-12 md:mb-0">
        <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-2">
          {
            announcementIds.map((id) => {
              if (announcements.has(id)) {
                const announcement = announcements.get(id)!;
                return (
                  <AnnouncementCard
                    key={announcement.id}
                    id={announcement.id}
                    title={announcement.title}
                    description={announcement.description}
                    thumbnail={announcement.thumbnail}
                    author={{name: announcement.authorName, image: announcement.authorImage || ""}}
                    date={announcement.date}
                    priority={announcement.priority}
                  />
                )
              }
            })
          }
        </div>
        <ScrollBar />
      </ScrollArea>
    </div>
  );
}