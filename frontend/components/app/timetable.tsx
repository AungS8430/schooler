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

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function Timetable({ dynamic, timetable, slots }: { dynamic?: boolean, timetable: { [day: number]: Subject[] }, slots: Slot[] }) {
  const [currentDay, setCurrentDay] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [dayColumnWidth, setDayColumnWidth] = useState<number>(112); // default 7rem
  const [gridWidth, setGridWidth] = useState<number>(0);
  const dayColumnRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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