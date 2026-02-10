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
import Link from "next/link";
import Image from "next/image";

interface AnnouncementCardProps {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  author: { name: string; image: string};
  date: string;
  target: string;
  priority: number;
}

export default async function AnnouncementCard({ id, title, description, thumbnail, author, date, target, priority }: AnnouncementCardProps) {
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
        <CardDescription className="">{description}</CardDescription>
      </CardHeader>
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
          <div>
            <span className="text-sm text-muted-foreground">To: {target}</span>
          </div>
        </div>

      </CardContent>
      <CardFooter>
        <Button className="w-full" asChild>
          <Link href={`/app/announcements/${id}`}>View Announcement</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}