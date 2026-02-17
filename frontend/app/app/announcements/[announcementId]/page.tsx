"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { usePerms } from "@/lib/perms";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import StaticDisplay from "@/components/tiptap/static-display";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ArrowLeft, Pencil, Trash } from "lucide-react";
import Link from "next/link";

interface Announcement {
  id: number;
  title: string;
  description: string;
  content?: string;
  thumbnail?: string;
  author_id: string;
  authorName: string;
  authorImage?: string;
  date: string;
  priority: number;
}

export default function AnnouncementPage({ params }: { params: Promise<{ announcementId: string }> }) {
  const { announcementId } = use(params);
  const router = useRouter();
  const perms = usePerms();
  const session = useSession();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE}/announcements/${announcementId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setAnnouncement(data.announcement);
      })
      .catch((error) => {
        console.error("Error fetching announcement:", error);
      });
  }, [announcementId]);

  if (!announcement) return null;

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Header */}
      <div className="sticky top-0 z-10 border-border">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-9 w-9 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <h1 className="text-2xl font-semibold truncate my-auto">
            {announcement.title}
          </h1>
          <Badge className="my-auto" variant={announcement.priority === 1 ? "destructive" : announcement.priority === 2 ? "default" : "secondary"}>{announcement.priority === 1 ? "Important" : announcement.priority === 2 ? "Medium" : "Information"}</Badge>
          <div className="grow" />
          {
            (perms && (perms.role === "teacher" || perms.role === "admin") ? announcement.author_id === session.data?.user?.id : false) && (
              <div className="flex flex-row gap-1">
                <Link href={`/app/announcements/${announcement.id}/edit`}>
                  <Button size="icon"><Pencil /></Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="icon" variant="destructive"><Trash /></Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete this announcement?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        fetch(`${process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE}/announcements/${announcement.id}`, {
                          method: "DELETE",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          credentials: "include",
                        })
                          .then(() => {
                            router.push("/app/announcements");
                          })
                          .catch((error) => {
                            console.error("Error deleting announcement:", error);
                          });
                      }} variant="destructive">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )
          }
        </div>
      </div>
      <ScrollArea className="max-w-5xl mx-auto w-full flex flex-col gap-4">
        <div>
          { announcement.thumbnail && (
            <Image src={announcement.thumbnail} width={1000} height={1000} className="w-full h-64 rounded-md" alt={announcement.title}/>
          )}
          <div className="px-4">
            <p className="text-lg">{announcement.description}</p>
          </div>
          <div className="max-w-5xl mx-auto w-full px-4">
            <div className="flex items-center gap-4 mb-4">
              <Avatar>
                <AvatarImage src={announcement.authorImage} alt={announcement.authorName} />
                <AvatarFallback>
                  {announcement.authorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{announcement.authorName}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(announcement.date).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          {announcement.content && (<div className="max-w-5xl mx-auto w-full px-4">
            <StaticDisplay content={announcement.content}/>
          </div>)}
        </div>
        <ScrollBar />
      </ScrollArea>
    </div>
  )
}