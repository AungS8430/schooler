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

export default function ClassesPage() {
  const [gradeList, setGradeList] = useState<string[]>(["1st Year", "2nd Year", "3rd Year"]);
  const [selectedGrade, setSelectedGrade] = useState<string>("2nd Year");
  const [classList, setClassList] = useState<string[]>([
    "C2R1",
    "C2R2",
    "M2R1",
    "M2R2",
    "E2R1",
    "E2R2"
  ]);

  useEffect(() => {
    if (!selectedGrade && gradeList.length > 0) {
      setSelectedGrade(classList[0]);
    }
  }, [selectedGrade, gradeList]);

  return (
    <div className="flex flex-col justify-start items-center max-w-5xl w-full h-screen gap-0 mx-auto overflow-hidden">
      <div className="flex flex-col gap-2 sticky top-0 z-10 w-full p-3">
        <h1 className="text-2xl font-semibold">Classes</h1>
        <div className="flex gap-2 items-center w-full max-w-full">
          <Combobox required items={gradeList} value={selectedGrade} onValueChange={(value) => setSelectedGrade(value || "")} autoHighlight>
            <ComboboxInput placeholder="Select a class..." showClear className="grow" />
            <ComboboxContent>
              <ComboboxEmpty>No class found.</ComboboxEmpty>
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
            classList.map((className) => (
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