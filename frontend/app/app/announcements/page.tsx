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
import SpinnerOverlay from "@/components/app/spinner";
import Link from "next/link";
import { Search, Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useSession } from "next-auth/react";

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
  const session = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [announcementIds, setAnnouncementIds] = useState<number[] | null>();
  const [announcements, setAnnouncements] = useState<Map<number, Announcement>>(new Map());

  function fetchAnnouncementIds() {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/api/v1/announcements?query=${encodeURIComponent(searchTerm)}`, {
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
    if (!announcementIds) return;
    for (const id of announcementIds) {
      if (!announcements.has(id)) {
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/api/v1/announcements/${id}`, {
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
            (perms && (perms.role === "teacher" || perms.role === "admin")) && (
              <Button size="icon" asChild>
                <Link href="/app/announcements/create">
                  <Plus />
                </Link>
              </Button>
            )
          }
        </div>
      </div>
      <ScrollArea className="flex flex-col justify-start w-full max-w-full gap-6 overflow-y-auto p-3 pt-0 flex-1 mb-12 md:mb-0">
        <div className="grid lg:grid-cols-2 2xl:grid-cols-3 gap-2">
          {
            announcementIds ? announcementIds.map((id) => {
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
                    editable={perms && (perms.role === "teacher" || perms.role === "admin") ? announcement.author_id === session.data?.user?.id : false}
                  />
                )
              }
            }) : (
              <SpinnerOverlay />
            )
          }
        </div>
        <ScrollBar />
      </ScrollArea>
    </div>
  );
}