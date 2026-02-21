"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Timetable from "@/components/app/timetable";
import WelcomeHeader from "@/components/app/welcome";
import AnnouncementCard from "@/components/app/announcement-card";
import { ChevronRight, Calendar } from "lucide-react";
import ScrollGradient from "@/components/app/scroll-gradient";

import Link from "next/link";

type Slot = {
  id: string;
  start: string; // e.g. '08:00'
  end: string;   // e.g. '08:10'
};
type Subject = {
  id: string;
  title: string;
  slotIds: string[]; // can span multiple slots
  location?: string;
  endsEarly?: boolean;
  overlapsBreak?: boolean;
  isBreak?: boolean;
  isLunch?: boolean;
  teacher?: string;
  classroom?: string;
}

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

export default function HomePage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [timetableData, setTimetableData] = useState<{ [day: number]: Subject[] } | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [announcementIds, setAnnouncementIds] = useState<number[] | null>();
  const [announcements, setAnnouncements] = useState<Map<number, Announcement>>(new Map());

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/api/v1/auth/permissions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.permissions && data.permissions.class) {
          setSelectedClass(data.permissions.class);
        }
      })
      .catch((error) => {
        console.error("Error fetching user permissions:", error);
      });
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/api/v1/schedule/slots`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.slots && Array.isArray(data.slots)) {
          setSlots(data.slots);
        }
      })
      .catch((error) => {
        console.error("Error fetching slots:", error);
      })
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/api/v1/announcements`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setAnnouncementIds(data.announcement_ids.slice(0, 5));
      })
      .catch((error) => {
        console.error("Error fetching announcements:", error);
      });
  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/api/v1/schedule/timetable?class_=${encodeURIComponent(selectedClass)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.timetable) {
          setTimetableData(data.timetable[0]);
        }
      })
      .catch((error) => {
        console.error("Error fetching schedule:", error);
      });
  }, [selectedClass]);

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
    <div className="flex flex-col justify-center items-center w-full max-w-5xl p-3 gap-3 md:px-3 md:py-7 md:gap-12 mx-auto overflow-hidden mb-12 md:mb-0">
      <div className="flex flex-col justify-center overflow-hidden max-w-full">
        <div className="flex flex-col justify-center md:gap-6 overflow-hidden">
          <WelcomeHeader schedule={Boolean(timetableData && slots)} />
          {
            timetableData && slots && (
              <Timetable timetable={timetableData} slots={slots} dynamic />
            )
          }
        </div>
        {
          timetableData && slots && (
            <div className="self-end">
              <Button variant="link" asChild>
                <Link href="/app/calendar"><Calendar/>View Academic Calendar</Link>
              </Button>
              <Button variant="link" asChild>
                <Link href="/app/schedule"><ChevronRight/>View Class Schedule</Link>
              </Button>
            </div>
          )
        }
      </div>
      {/*Mock up for announcements*/}
      <div className="flex flex-col justify-start max-w-full w-fit gap-2">
        <h2 className="text-xl font-semibold">Recent Announcements</h2>
        <div className="flex flex-col">
          <ScrollGradient scrollClassName="flex flex-row max-w-full overflow-x-auto gap-2 py-2 justify-start">
            {
              announcementIds && announcementIds.map((id) => {
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
          </ScrollGradient>
          <Button className="self-end" variant="link" asChild>
            <Link href="/app/announcements"><ChevronRight />View All Announcements</Link>
          </Button>
        </div>

      </div>
    </div>
  );
}