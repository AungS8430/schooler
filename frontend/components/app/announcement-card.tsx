"use client";

import { useRouter } from "next/navigation";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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

interface AnnouncementCardProps {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  author: { name: string; image: string};
  date: string;
  priority: number;
  editable?: boolean;
}

export default function AnnouncementCard({ id, title, description, thumbnail, author, date, priority, editable }: AnnouncementCardProps) {
  const router = useRouter();
  return (
    <Card className="w-88 max-h-120 shrink-0">
      {
        thumbnail && (
          <Image src={thumbnail} alt={title} width={352} height={160} />
        )
      }
      <CardHeader>
        <CardAction>
          <Badge variant={priority === 1 ? "destructive" : priority === 2 ? "default" : "secondary"}>
            {priority === 1 ? "Important" : priority === 2 ? "Medium" : "Information"}
          </Badge>
        </CardAction>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="line-clamp-3 wrap-break-word">{description}</CardDescription>
      </CardHeader>
      <div className="grow" />
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar size="sm" className="my-auto">
              <AvatarImage src={author.image} alt={author.name} />
              <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">{author.name}</span>
              <span className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

      </CardContent>
      <CardFooter className="flex flex-row gap-2">
        <Button className="grow" asChild>
          <Link href={`/app/announcements/${id}`}>View Announcement</Link>
        </Button>
        {editable && (
          <div className="flex flex-row gap-1">
            <Button variant="outline" size="icon" asChild>
              <Link href={`/app/announcements/${id}/edit`}><Pencil /></Link>
            </Button>
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
                    fetch(`${process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE}/announcements/${id}`, {
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

        )}
      </CardFooter>
    </Card>
  )
}