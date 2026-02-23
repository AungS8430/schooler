import { Users, School, List, Calendar, Book, Megaphone, Settings } from "lucide-react";

export const PrimaryPages = [
  {
    href: "/app/announcements",
    label: "Announcements",
    icon: <Megaphone />
  },
  {
    href: "/app/schedule",
    label: "Schedule",
    icon: <List />
  },
  {
    href: "/app/calendar",
    label: "Academic Calendar",
    icon: <Calendar />
  },
  {
    href: "/app/classes",
    label: "Classes",
    icon: <School />
  },
  {
    href: "/app/people",
    label: "People",
    icon: <Users />
  },
  {
    href: "/app/resources",
    label: "Resources",
    icon: <Book />
  }
]
export const SecondaryPages = [
  {
    href: "/app/settings",
    label: "Settings",
    icon: <Settings />
  },
]