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
import { ButtonGroup } from "@/components/ui/button-group";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Mail, Phone } from "lucide-react";
import Link from "next/link";

interface Person {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  nickname?: string;
  class?: string;
  department?: string;
  role?: string;
  email?: string;
  phone?: string;
}

const samplePeople: Person[] = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    middleName: "Michael",
    nickname: "J.S.",
    class: "C2R1",
    department: "Science",
    role: "Student",
    email: "john.smith@schooler.edu",
    phone: "+1-555-0101"
  },
  {
    id: 2,
    firstName: "Emma",
    lastName: "Johnson",
    middleName: "Grace",
    nickname: "Em",
    class: "C2R1",
    department: "Science",
    role: "Student",
    email: "emma.johnson@schooler.edu",
    phone: "+1-555-0102"
  },
  {
    id: 3,
    firstName: "Liam",
    lastName: "Williams",
    class: "C2R2",
    department: "Science",
    role: "Student",
    email: "liam.williams@schooler.edu",
    phone: "+1-555-0103"
  },
  {
    id: 4,
    firstName: "Sophia",
    lastName: "Brown",
    middleName: "Rose",
    nickname: "Sophie",
    class: "C2R2",
    department: "Science",
    role: "Student",
    email: "sophia.brown@schooler.edu",
    phone: "+1-555-0104"
  },
  {
    id: 5,
    firstName: "Noah",
    lastName: "Davis",
    class: "M2R1",
    department: "Mathematics",
    role: "Student",
    email: "noah.davis@schooler.edu",
    phone: "+1-555-0105"
  },
  {
    id: 6,
    firstName: "Olivia",
    lastName: "Miller",
    middleName: "Charlotte",
    class: "M2R1",
    department: "Mathematics",
    role: "Student",
    email: "olivia.miller@schooler.edu",
    phone: "+1-555-0106"
  },
  {
    id: 7,
    firstName: "Ethan",
    lastName: "Wilson",
    nickname: "E.W.",
    class: "M2R2",
    department: "Mathematics",
    role: "Student",
    phone: "+1-555-0107"
  },
  {
    id: 8,
    firstName: "Ava",
    lastName: "Moore",
    middleName: "Elizabeth",
    class: "M2R2",
    department: "Mathematics",
    role: "Student",
    email: "ava.moore@schooler.edu",
  },
  {
    id: 9,
    firstName: "James",
    lastName: "Taylor",
    class: "E2R1",
    department: "Engineering",
    role: "Student",
    email: "james.taylor@schooler.edu",
    phone: "+1-555-0109"
  },
  {
    id: 10,
    firstName: "Isabella",
    lastName: "Anderson",
    middleName: "Marie",
    nickname: "Bella",
    class: "E2R1",
    department: "Engineering",
    role: "Student",
    email: "isabella.anderson@schooler.edu",
    phone: "+1-555-0110"
  },
  {
    id: 11,
    firstName: "Benjamin",
    lastName: "Thomas",
    class: "E2R2",
    department: "Engineering",
    role: "Student",
    email: "benjamin.thomas@schooler.edu",
    phone: "+1-555-0111"
  },
  {
    id: 12,
    firstName: "Mia",
    lastName: "Jackson",
    middleName: "Anne",
    class: "E2R2",
    department: "Engineering",
    role: "Student",
    email: "mia.jackson@schooler.edu",
    phone: "+1-555-0112"
  },
  {
    id: 13,
    firstName: "Robert",
    lastName: "Harris",
    middleName: "James",
    role: "Teacher",
    department: "Science",
    email: "robert.harris@schooler.edu",
    phone: "+1-555-0201"
  },
  {
    id: 14,
    firstName: "Sarah",
    lastName: "Martin",
    role: "Teacher",
    department: "Mathematics",
    email: "sarah.martin@schooler.edu",
    phone: "+1-555-0202"
  },
  {
    id: 15,
    firstName: "David",
    lastName: "Garcia",
    middleName: "Paul",
    role: "Teacher",
    department: "Engineering",
    email: "david.garcia@schooler.edu",
    phone: "+1-555-0203"
  }
]

export default function ClassesPage() {
  const [gradeList, setGradeList] = useState<string[]>(["1st Year", "2nd Year", "3rd Year"]);
  const [selectedGrade, setSelectedGrade] = useState<string | null>();
  const [classList, setClassList] = useState<string[]>([
    "C2R1",
    "C2R2",
    "M2R1",
    "M2R2",
    "E2R1",
    "E2R2"
  ]);
  const [selectedClass, setSelectedClass] = useState<string | null>();
  const [searchQuery, setSearchQuery] = useState("");
  const [people, setPeople] = useState<Person[]>(samplePeople)

  useEffect(() => {
    setSelectedClass(null);
  }, [selectedGrade]);

  return (
    <div className="flex flex-col justify-start items-center max-w-5xl w-full h-screen gap-0 mx-auto overflow-hidden">
      <div className="flex flex-col gap-2 sticky top-0 z-10 w-full p-3">
        <h1 className="text-2xl font-semibold">People</h1>
        <div className="flex gap-2 items-center w-full max-w-full">
          <Input placeholder="Search people..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="grow" />
          <Combobox items={classList} value={selectedClass} onValueChange={(value) => setSelectedClass(value)} autoHighlight>
            <ComboboxInput placeholder="Select a class..." showClear={false} />
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
          <Combobox items={gradeList} value={selectedGrade} onValueChange={(value) => setSelectedGrade(value)} autoHighlight>
            <ComboboxInput placeholder="Select a grade..." showClear={false} />
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
            people.map((person) => (
              <div key={person.id} className="bg-card/50 p-4 rounded-4xl shadow-md border">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div>
                    <div className="my-auto font-semibold">
                      {person.firstName} {person.lastName} <span className="text-muted-foreground">{person.nickname}</span>
                    </div>
                    <div className="font-normal text-sm my-auto">
                      {person.role} | {person.department} Department {person.class && `| ${person.class}`}
                    </div>
                  </div>
                  <ButtonGroup className="w-full sm:w-auto ml-auto my-auto">
                    <Button variant="outline" size="icon" asChild={!!person.phone} disabled={!person.phone} className="grow sm:grow-0">
                      {person.phone ? (
                        <Link href={`tel:${person.phone}`}><Phone /></Link>
                      ) : (
                        <Phone />
                      )}
                    </Button>
                    <Button size="icon" asChild={!!person.email} disabled={!person.email} className="grow sm:grow-0">
                      {person.email ? (
                        <Link href={`mailto:${person.email}`}><Mail /></Link>
                      ) : (
                        <Mail />
                      )}
                    </Button>
                  </ButtonGroup>
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