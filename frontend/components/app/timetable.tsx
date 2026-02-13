"use client";

import { useState, useEffect, useRef} from "react";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

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
export const slots: Slot[] = [
  { id: 's1', start: '08:00', end: '08:10' },
  { id: 's2', start: '08:15', end: '09:05' },
  { id: 's3', start: '09:05', end: '09:55' },
  { id: 's4', start: '10:05', end: '10:55' },
  { id: 's5', start: '10:55', end: '11:45' },
  { id: 's6', start: '11:45', end: '12:40' },
  { id: 's7', start: '12:40', end: '13:30' },
  { id: 's8', start: '13:30', end: '14:20' },
  { id: 's9', start: '14:30', end: '15:20' },
  { id: 's10', start: '15:20', end: '16:10' },
  { id: 's11', start: '16:10', end: '17:00' },
  { id: 's12', start: '17:00', end: '17:50' }
];
export const timetable: { [day: number]: Subject[] } = {
  1: [
    { id: 'shr', title: 'SHR', slotIds: ['s1'] },
    { id: 'english4', title: 'English 4', slotIds: ['s2', 's3'] },
    { id: 'ece2', title: 'Electrical Circuits and Electronics 2', slotIds: ['s4', 's5'] },
    { id: 'lunch', title: 'Lunch', slotIds: ['s6'], isLunch: true },
    { id: 'japanese4', title: 'Japanese 4', slotIds: ['s7', 's8'] },
    { id: 'calculus2', title: 'Calculus 2', slotIds: ['s9', 's10'] },
  ],
  2: [
    { id: 'shr', title: 'SHR', slotIds: ['s1'] },
    { id: 'programming4', title: 'Programming 4', slotIds: ['s2', 's3', 's4'] },
    { id: 'labwork6', title: 'Room : Labwork 6 (CE) (8.15-10.45)', slotIds: ['s2', 's3', 's4'], endsEarly: true, overlapsBreak: true },
    { id: 'lunch', title: 'Lunch', slotIds: ['s6'], isLunch: true },
    { id: 'thailang4', title: 'Thai Language 4', slotIds: ['s7', 's8'] },
    { id: 'hpe4', title: 'Health & Physical Education 4', slotIds: ['s9', 's10'] },
  ],
  3: [
    { id: 'shr', title: 'SHR', slotIds: ['s1'] },
    { id: 'chemistry3', title: 'Chemistry 3', slotIds: ['s2', 's3'] },
    { id: 'logicdesign', title: 'Logic Design and Sequential Circuits', slotIds: ['s4', 's5'] },
    { id: 'lunch', title: 'Lunch', slotIds: ['s6'], isLunch: true },
    { id: 'introcn', title: 'Intro. to Computer Network & Security', slotIds: ['s7', 's8'] },
    { id: 'linearalgebra2', title: 'Linear Algebra 2', slotIds: ['s9', 's10'] },
  ],
  4: [
    { id: 'shr', title: 'SHR', slotIds: ['s1'] },
    { id: 'calculus2', title: 'Calculus 2', slotIds: ['s2'] },
    { id: 'mathinfo', title: 'Mathematics for information Technology', slotIds: ['s3', 's4', 's5'] },
    { id: 'lunch', title: 'Lunch', slotIds: ['s6'], isLunch: true },
    { id: 'labwork4', title: 'Lab work 4 for Basic Computer Engineering', slotIds: ['s7', 's8', 's9'], classroom: "Labwork 7 (EE)" },
    { id: 'classactivity', title: 'Class Activity / LHR', slotIds: ['s10'] },
  ],
  5: [
    { id: 'shr', title: 'SHR', slotIds: ['s1'] },
    { id: 'physics4', title: 'Physics 4', slotIds: ['s2', 's3'] },
    { id: 'introcn', title: 'Intro. to Computer Network & Security', slotIds: ['s4', 's5'], classroom: "Labwork 6 (CE)" },
    { id: 'lunch', title: 'Lunch', slotIds: ['s6'], isLunch: true },
    { id: 'japanese4', title: 'Japanese 4', slotIds: ['s7', 's8'] },
    { id: 'thaiculture', title: 'Thai culture/Social study 1', slotIds: ['s9', 's10'] },
  ]
};

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getLastUsedSlotIndex(): number {
  let lastIndex = 0;
  for (const daySubjects of Object.values(timetable)) {
    for (const subject of daySubjects) {
      for (const slotId of subject.slotIds) {
        const idx = slots.findIndex(s => s.id === slotId);
        if (idx > lastIndex) lastIndex = idx;
      }
    }
  }
  return lastIndex;
}

const lastUsedIndex = getLastUsedSlotIndex();
const usedSlots = slots.slice(0, lastUsedIndex + 1);

function getCurrentSlot(slotsToCheck: Slot[], currentTime: string) {
  const [curHour, curMin] = currentTime.split(":").map(Number);
  const curMinutes = curHour * 60 + curMin;
  for (const slot of slotsToCheck) {
    const [startHour, startMin] = slot.start.split(":").map(Number);
    const [endHour, endMin] = slot.end.split(":").map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    if (curMinutes >= startMinutes && curMinutes < endMinutes) {
      return slot.id;
    }
  }
  return null;
}

export default function Timetable({ qClass, dynamic }: { qClass?: string; dynamic?: boolean }) {
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [dayColumnWidth, setDayColumnWidth] = useState<number>(112); // default 7rem
  const [gridWidth, setGridWidth] = useState<number>(0);
  const dayColumnRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dynamic) return;
    const update = () => {
      const now = new Date();
      setCurrentDay(now.getDay());
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!dynamic) return;
    const measureWidth = () => {
      if (dayColumnRef.current && gridRef.current) {
        const dayWidth = dayColumnRef.current.offsetWidth;
        const totalGridWidth = gridRef.current.scrollWidth;
        setDayColumnWidth(dayWidth);
        setGridWidth(totalGridWidth);
      }
    };

    // Measure immediately
    measureWidth();

    // Re-measure after a delay to ensure layout is complete
    const timer = setTimeout(measureWidth, 50);

    // Measure on window resize
    window.addEventListener('resize', measureWidth);

    return () => {
      window.removeEventListener('resize', measureWidth);
      clearTimeout(timer);
    };
  }, []);

  const gridColumns = `repeat(${usedSlots.length + 1}, minmax(75px, 1fr))`;
  const currentSlotId = getCurrentSlot(usedSlots, currentTime);

  function getTimeProgressPercent() {
    if (!dynamic || !currentSlotId) return null;
    const [curHour, curMin] = currentTime.split(":").map(Number);
    const curMinutes = curHour * 60 + curMin;

    for (let i = 0; i < usedSlots.length; i++) {
      const slot = usedSlots[i];
      const [startHour, startMin] = slot.start.split(":").map(Number);
      const [endHour, endMin] = slot.end.split(":").map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (curMinutes >= startMinutes && curMinutes < endMinutes) {
        const slotProgress = Math.max(0, Math.min(1, (curMinutes - startMinutes) / (endMinutes - startMinutes)));
        return ((i + slotProgress) / usedSlots.length) * 100;
      }

      if (i < usedSlots.length - 1) {
        const nextSlot = usedSlots[i + 1];
        const [nextStartHour, nextStartMin] = nextSlot.start.split(":").map(Number);
        const nextStartMinutes = nextStartHour * 60 + nextStartMin;

        if (curMinutes >= endMinutes && curMinutes < nextStartMinutes) {
          // Snap to the end of current column (i + 1) which is the start of the next column
          return ((i + 1) / usedSlots.length) * 100;
        }
      }
    }

    const firstSlot = usedSlots[0];
    const [firstHour, firstMin] = firstSlot.start.split(":").map(Number);
    const firstMinutes = firstHour * 60 + firstMin;
    if (curMinutes < firstMinutes) {
      return 0;
    }

    return 100;
  }
  const progressPercent = getTimeProgressPercent();

  return (
    <ScrollArea className="overflow-auto w-fit max-w-full p-2">

      <div className="relative">
        {progressPercent !== null && gridWidth > 0 && (
          <div
            className="absolute top-0 bottom-0 z-10 bg-primary shadow-lg ring-1 ring-accent"
            style={{
              left: `${dayColumnWidth + (gridWidth - dayColumnWidth) * (progressPercent / 100) - 2}px`,
              width: '3px',
              borderRadius: '2px',
              pointerEvents: 'none',
              transition: 'left 0.5s cubic-bezier(0.4,0,0.2,1)'
            }}
          />
        )}
        <div
          ref={gridRef}
          className="grid items-stretch gap-1"
          style={{ gridTemplateColumns: gridColumns }}
        >
          <div ref={dayColumnRef} />
          {usedSlots.map(slot => (
            <div key={slot.id} className="text-xs md:text-sm font-bold flex items-center">
              {slot.start}<br />- {slot.end}
            </div>
          ))}
          {dayNames.map((dayName, dayIdx) => {
            const subjectsForDay = timetable[dayIdx] || [];
            if (subjectsForDay.length === 0) return null;
            const cells = [];
            let slotIdx = 0;
            while (slotIdx < usedSlots.length) {
              const subject = subjectsForDay.find(subj => subj.slotIds[0] === usedSlots[slotIdx].id);
              if (subject) {
                // Only count span for slots that are in usedSlots
                const span = subject.slotIds.filter(id => usedSlots.find(s => s.id === id)).length;
                const isCurrent = currentDay === dayIdx && subject.slotIds.includes(currentSlotId || "");
                cells.push(
                  <Popover key={subject.id}>
                    <PopoverTrigger asChild>
                      <div
                        className={`h-16 text-xs md:text-sm flex items-center justify-center text-center rounded-md p-4 shadow-md ${isCurrent ? "bg-primary text-primary-foreground" : currentDay == dayIdx ? "bg-primary/65 text-primary-foreground" : (dynamic ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground")}`}
                        style={{ gridColumn: `span ${span}` }}
                      >
                        {subject.title}
                      </div>
                    </PopoverTrigger>
                    <PopoverContent>
                      <PopoverHeader>
                        <PopoverTitle>{subject.title}</PopoverTitle>
                        <PopoverDescription>
                          <span>Time: {subject.slotIds.map(id => {
                            const slot = slots.find(s => s.id === id);
                            return slot ? `${slot.start} - ${slot.end}` : "";
                          }).join(", ")}</span>
                          {subject.classroom && <span><br />Classroom: {subject.classroom}</span>}
                          {subject.teacher && <span><br />Teacher: {subject.teacher}</span>}
                          {subject.isLunch && <span><br />This is the lunch break.</span>}
                          {subject.isBreak && <span><br />This is a break period.</span>}
                          {subject.endsEarly && <span><br />This session ends early.</span>}
                          {subject.overlapsBreak && <span><br />This session overlaps with a break.</span>}
                        </PopoverDescription>
                      </PopoverHeader>
                    </PopoverContent>
                  </Popover>

                );
                slotIdx += span;
              } else {
                cells.push(
                  <div key={`empty-${dayIdx}-${slotIdx}`} className="px-2 py-1"></div>
                );
                slotIdx += 1;
              }
            }
            return [
              <div key={`day-${dayIdx}`} className="px-2 text-xs md:text-sm font-bold flex justify-end items-center">{dayName}</div>,
              ...cells
            ];
          })}
        </div>
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}