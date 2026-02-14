"use client";

import { useState, useEffect } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ExternalLink } from "lucide-react";
import Link from "next/link";

interface Resource {
  id: number;
  title: string;
  author: string;
  href: string;
  categories?: string[];
}

const sampleResources = [
  {
    id: 1,
    title: "School Leave Request Form",
    author: "Academic Affairs",
    href: "#",
    categories: ["Forms", "Academic"]
  },
  {
    id: 2,
    title: "Student Handbook",
    author: "Student Affairs",
    href: "#",
    categories: ["Guide", "Academic"]
  },
  {
    id: 3,
    title: "Scholarship Application Guide",
    author: "Financial Aid Office",
    href: "#",
    categories: ["Forms", "Financial"]
  },
  {
    id: 4,
    title: "Campus Map",
    author: "Facilities Management",
    href: "#",
    categories: ["Guide", "Campus"]
  },
  {
    id: 5,
    title: "Library Resources Guide",
    author: "Library Services",
    href: "#",
    categories: ["Guide", "Academic"]
  },
]


export default function ResourcesPage() {
  const [categoryList, setCategoryList] = useState<string[]>([
    "Forms",
    "Guides",
    "Academic",
    "Financial",
    "Campus"
  ]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>();
  const [searchQuery, setSearchQuery] = useState("");
  const [resources, setResources] = useState<Resource[]>(sampleResources)

  return (
    <div className="flex flex-col justify-start items-center max-w-5xl w-full h-screen gap-0 mx-auto overflow-hidden">
      <div className="flex flex-col gap-2 sticky top-0 z-10 w-full p-3">
        <h1 className="text-2xl font-semibold">Resources</h1>
        <div className="flex gap-2 items-center w-full max-w-full">
          <Input placeholder="Search resources..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="grow" />
          <Combobox items={categoryList} value={selectedCategory || ""} onValueChange={(value) => setSelectedCategory(value)} autoHighlight>
            <ComboboxInput placeholder="Select a category..." showClear={true} />
            <ComboboxContent>
              <ComboboxEmpty>No category found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </div>
      </div>
      <ScrollArea className="p-4 w-full overflow-auto max-w-full">
        <div className="flex flex-col gap-2 mb-12 md:mb-0">
          {
            resources.map((resource) => (
              <div key={resource.id} className="bg-card/50 p-4 rounded-4xl shadow-md border">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex flex-row gap-4">
                    <div>
                      <div className="-ml-1 mb-1 flex flex-row gap-1">
                        {resource.categories?.map((category) => (
                          <Badge key={category} variant="outline" className="">{category}</Badge>
                        ))}
                      </div>
                      <div className="my-auto font-semibold">
                        {resource.title}
                      </div>
                      <div className="font-normal text-sm my-auto">
                        <span className="text-muted-foreground">Posted by </span>{resource.author}
                      </div>
                    </div>
                  </div>
                    <Button className="w-full sm:w-auto ml-auto my-auto" asChild>
                      <Link href={resource.href} target="_blank" rel="noopener noreferrer">
                        <ExternalLink />View
                      </Link>
                    </Button>
                </div>
              </div>
            ))
          }
        </div>

        <ScrollBar />
      </ScrollArea>
    </div>
  )
}