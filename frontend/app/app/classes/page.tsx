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
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { List, Users } from "lucide-react";
import Link from "next/link";

interface Grade {
  key: string;
  value: string;
}

export default function ClassesPage() {
  const [gradeList, setGradeList] = useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [classList, setClassList] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE}/grades`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const gradesArray = Object.entries(data.grades).map(([key, value]) => ({
          key,
          value: value as string
        }));
        setGradeList(gradesArray);
      })
      .catch((error) => {
        console.error("Error fetching grades:", error);
      });
  }, []);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE}/classes${selectedGrade?.key ? ("?grade=" + selectedGrade.key) : ""}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setClassList(data.classes);
      })
      .catch((error) => {
        console.error("Error fetching classes:", error);
      });
  }, [selectedGrade]);

  return (
    <div className="flex flex-col justify-start items-center max-w-5xl w-full h-screen gap-0 mx-auto overflow-hidden">
      <div className="flex flex-col gap-2 sticky top-0 z-10 w-full p-3">
        <h1 className="text-2xl font-semibold">Classes</h1>
        <div className="flex gap-2 items-center w-full max-w-full">
          <Combobox required items={gradeList} itemToStringValue={(grade: Grade) => grade.value} value={selectedGrade} onValueChange={(value) => setSelectedGrade(value)} autoHighlight>
            <ComboboxInput placeholder="Select a class..." showClear className="grow" />
            <ComboboxContent>
              <ComboboxEmpty>No class found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item.key} value={item}>
                    {item.value}
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
            classList && classList.map((className) => (
              <Card key={className} size="sm" className="bg-card/50">
                <CardHeader>
                  <CardTitle>{className}</CardTitle>
                </CardHeader>
                <Separator />
                <CardFooter>
                  <Button variant="link" size="sm" asChild>
                    <Link href={`/app/schedule?class=${className}`}><List /> View Schedule</Link>
                  </Button>
                  <Button variant="link" size="sm" asChild>
                    <Link href={`/app/students?class=${className}`}><Users /> View People</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))
          }
        </div>

        <ScrollBar />
      </ScrollArea>
    </div>
  )
}