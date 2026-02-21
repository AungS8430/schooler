"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Activity, Users, School } from "lucide-react";
import Link from "next/link";

interface Person {
  id: number;
  name: string;
  personnelID?: string;
  image?: string;
  nickname?: string;
  class?: string;
  department?: string;
  role?: string;
  email?: string;
}

interface Grade {
  key: string;
  value: string;
}

export function PeopleContent() {
  const [gradeList, setGradeList] = useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [classList, setClassList] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const searchParams = useSearchParams();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/api/v1/people/grades`, {
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
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/api/v1/people/classes${selectedGrade?.key ? ("?grade=" + selectedGrade.key) : ""}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setClassList(data.classes);
        const classParam = searchParams.get("class");
        if (classParam) {
          setSelectedClass(classParam);
        }
      })
      .catch((error) => {
        console.error("Error fetching classes:", error);
      });
  }, [selectedGrade, searchParams]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL}/api/v1/people?search=${searchQuery}${selectedClass ? ("&class_=" + selectedClass) : ""}${selectedGrade ? ("&grade=" + selectedGrade.key) : ""}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setPeople(data.users);
      })
      .catch((error) => {
        console.error("Error fetching people:", error);
      });
  }, [searchQuery, selectedClass, selectedGrade]);

  return (
    <div className="flex flex-col justify-start items-center max-w-5xl w-full h-screen gap-0 mx-auto overflow-hidden">
      <div className="flex flex-col gap-2 sticky top-0 z-10 w-full p-3">
        <h1 className="text-2xl font-semibold">People</h1>
        <div className="flex gap-2 items-center w-full max-w-full">
          <Input placeholder="Search people..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="grow" />
          <Combobox items={classList} value={selectedClass || ""} onValueChange={(value) => setSelectedClass(value)} autoHighlight>
            <ComboboxInput placeholder="Select a class..." showClear={true} />
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
          <Combobox required items={gradeList} itemToStringValue={(grade: Grade) => grade.value} value={selectedGrade} onValueChange={(value) => setSelectedGrade(value)} autoHighlight>
            <ComboboxInput placeholder="Select a grade..." showClear className="grow" />
            <ComboboxContent>
              <ComboboxEmpty>No grade found.</ComboboxEmpty>
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
            people.map((person) => (
              <Dialog key={person.id}>
                <DialogTrigger asChild>
                  <div className="bg-card/50 p-4 rounded-4xl shadow-md border hover:cursor-pointer hover:underline">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex flex-row gap-4">
                        <Avatar className="my-auto">
                          {person.image ? (
                            <AvatarImage src={person.image} alt={`${person.name}'s profile picture`} />
                          ) : (
                            <AvatarFallback>{person.name.split(' ').map(n => n.charAt(0)).join('')}</AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <div className="my-auto font-semibold">
                            {person.name} <span className="text-muted-foreground">{person.personnelID}</span>
                          </div>
                          <div className="font-normal text-sm my-auto">
                            {person.role} | {person.department} Department {person.class && `| ${person.class}`}
                          </div>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()} className="w-full sm:w-auto ml-auto my-auto">
                        <Button className="w-full sm:w-9" size="icon" asChild={!!person.email} disabled={!person.email}>
                          {person.email ? (
                            <Link href={`mailto:${person.email}`}><Mail /></Link>
                          ) : (
                            <Mail />
                          )}
                        </Button>
                    </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader className="flex flex-row gap-4">
                    <Avatar className="my-auto">
                      {person.image ? (
                        <AvatarImage src={person.image} alt={`${person.name}'s profile picture`} />
                      ) : (
                        <AvatarFallback>{person.name.split(' ').map(n => n.charAt(0)).join('')}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="my-auto flex flex-col justify-center">
                      <DialogTitle>{person.name}</DialogTitle>
                      <DialogDescription>{person.nickname}</DialogDescription>
                    </div>
                  </DialogHeader>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div className="flex flex-row gap-2 items-center">
                      <Activity className="size-4" />
                      <div className="flex flex-col">
                        <div className="text-muted-foreground text-xs font-semibold">Role</div>
                        <div>{person.role}</div>
                      </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <Users className="size-4" />
                      <div className="flex flex-col">
                        <div className="text-muted-foreground text-xs font-semibold">Department</div>
                        <div>{person.department}</div>
                      </div>
                    </div>
                    {person.class && (
                      <div className="flex flex-row gap-2 items-center mt-4">
                        <School className="size-4" />
                        <div className="flex flex-col">
                          <div className="text-muted-foreground text-xs font-semibold">Class</div>
                          <div>{person.class}</div>
                        </div>
                      </div>
                    )}
                    {person.email && (
                      <div className="flex flex-row gap-2 items-center mt-4">
                        <Mail className="size-4" />
                        <div className="flex flex-col">
                          <div className="text-muted-foreground text-xs font-semibold">Email</div>
                          <div>{person.email}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            ))
          }
        </div>

        <ScrollBar />
      </ScrollArea>
    </div>
  );
}

