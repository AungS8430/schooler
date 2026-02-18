"use client";

import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  type: "class" | "holiday" | "exam" | "event" | "other" | "break";
  description?: string;
}

interface Calendar {
  events: CalendarEvent[];
  start: Date;
  end: Date;
}

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const toDateOnly = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

const startOfWeekSunday = (date: Date) => {
  const day = date.getDay();
  return addDays(date, -day);
};

const endOfWeekSaturday = (date: Date) => addDays(startOfWeekSunday(date), 6);

const isWithinInclusive = (target: Date, start: Date, end: Date) =>
  target.getTime() >= start.getTime() && target.getTime() <= end.getTime();

export default function CalendarPage() {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [calendar, setCalendar] = useState<Calendar | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE}/school-academic-calendar`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const events = data.events.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
        setCalendar({
          events,
          start: new Date(data.start),
          end: new Date(data.end),
        });
      })
  }, []);

  useEffect(() => {
    if (!calendar) return;
    const rangeStart = startOfWeekSunday(toDateOnly(calendar.start));
    const rangeEnd = endOfWeekSaturday(toDateOnly(calendar.end));
    const days: Date[] = [];

    for (let cursor = rangeStart; cursor <= rangeEnd; cursor = addDays(cursor, 1)) {
      days.push(new Date(cursor));
    }

    setCalendarDays(days);
  }, [calendar]);

  const handleSaveAsPng = async () => {
    if (!calendarRef.current) return;

    // Store original styles and classes
    const originalClass = calendarRef.current.className;
    const originalStyle = calendarRef.current.style.cssText;

    // Find all elements with overflow and store their styles
    const overflowElements: Array<{ element: HTMLElement; originalOverflow: string; originalMaxWidth: string }> = [];
    const allElements = calendarRef.current.querySelectorAll('*');
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);
      if (computedStyle.overflow !== 'visible' || computedStyle.overflowX !== 'visible' || computedStyle.overflowY !== 'visible') {
        overflowElements.push({
          element: htmlEl,
          originalOverflow: htmlEl.style.overflow,
          originalMaxWidth: htmlEl.style.maxWidth,
        });
        htmlEl.style.overflow = 'visible';
        htmlEl.style.maxWidth = 'none';
      }
    });

    const hiddenEventDetails = calendarRef.current.querySelectorAll('.hidden.md\\:block');
    hiddenEventDetails.forEach((el) => {
      (el as HTMLElement).classList.remove('hidden');
    });

    calendarRef.current.className = originalClass.replace(/\bdark\b/g, '').trim();

    calendarRef.current.style.overflow = 'visible';
    calendarRef.current.style.maxWidth = 'none';
    calendarRef.current.style.minWidth = '1000px'; // Force desktop width for image
    calendarRef.current.style.width = 'fit-content';

    const lightThemeVars = {
      '--background': 'oklch(1 0 0)',
      '--foreground': 'oklch(0.145 0 0)',
      '--card': 'oklch(1 0 0)',
      '--card-foreground': 'oklch(0.145 0 0)',
      '--popover': 'oklch(1 0 0)',
      '--popover-foreground': 'oklch(0.145 0 0)',
      '--primary': 'oklch(0.67 0.16 58)',
      '--primary-foreground': 'oklch(0.99 0.02 95)',
      '--secondary': 'oklch(0.967 0.001 286.375)',
      '--secondary-foreground': 'oklch(0.21 0.006 285.885)',
      '--muted': 'oklch(0.97 0 0)',
      '--muted-foreground': 'oklch(0.556 0 0)',
      '--accent': 'oklch(0.97 0 0)',
      '--accent-foreground': 'oklch(0.205 0 0)',
      '--destructive': 'oklch(0.58 0.22 27)',
      '--border': 'oklch(0.922 0 0)',
      '--input': 'oklch(0.922 0 0)',
      '--ring': 'oklch(0.708 0 0)',
    };

    Object.entries(lightThemeVars).forEach(([key, value]) => {
      calendarRef.current!.style.setProperty(key, value);
    });

    calendarRef.current.style.colorScheme = 'light';
    calendarRef.current.style.backgroundColor = 'oklch(1 0 0)';
    calendarRef.current.style.color = 'oklch(0.145 0 0)'; // Force dark text color

    try {
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 150));

      const dataUrl = await toPng(calendarRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: true,
        filter: (_node) => {
          return true;
        },
      });

      const filename = `calendar-${new Date().toISOString().split('T')[0]}.png`;

      // Check if we're on mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile) {
        // On mobile, open the image in a new tab so user can long-press to save
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${filename}</title>
                <style>
                  body { margin: 0; padding: 0; background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                  img { max-width: 100%; height: auto; }
                </style>
              </head>
              <body>
                <img src="${dataUrl}" alt="${filename}" />
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      } else {
        // On desktop, use direct download
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        link.click();
      }
    } catch (error) {
      console.error('Error saving schedule as PNG:', error);
      try {
        const dataUrl = await toPng(calendarRef.current, {
          skipFonts: true,
          pixelRatio: 1,
          backgroundColor: '#ffffff',
        });

        const filename = `schedule-${new Date().toISOString().split('T')[0]}.png`;
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`<img src="${dataUrl}" alt="${filename}" style="max-width:100%;" />`);
            newWindow.document.close();
          }
        } else {
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataUrl;
          link.click();
        }
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
        alert('Failed to save schedule as PNG. Please try again.');
      }
    } finally {
      // Restore hidden class to event details
      hiddenEventDetails.forEach((el) => {
        (el as HTMLElement).classList.add('hidden');
      });

      // Restore original class and styles
      calendarRef.current.className = originalClass;
      calendarRef.current.style.cssText = originalStyle;

      // Restore overflow on all elements
      overflowElements.forEach(({ element, originalOverflow, originalMaxWidth }) => {
        element.style.overflow = originalOverflow;
        element.style.maxWidth = originalMaxWidth;
      });
    }
  };

  return (
    calendar && (
      <div className="flex flex-col justify-start items-center max-w-5xl w-full h-screen gap-0 mx-auto overflow-hidden">
        <div className="flex flex-col gap-2 sticky top-0 z-10 w-full p-3">
          <h1 className="text-2xl font-semibold">Academic Calendar</h1>
          <div className="flex gap-2 items-center w-full max-w-full">
            <Button onClick={handleSaveAsPng} variant="default">
              Save as PNG
            </Button>
          </div>
        </div>
        <ScrollArea ref={calendarRef} className="p-4 w-fit overflow-x-auto max-w-full">
          <div className="grid grid-cols-7 gap-1 text-sm font-semibold">
            {dayLabels.map((label) => (
              <div key={label} className="text-center p-2">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 mb-12 md:mb-0">
            {calendarDays.map((day) => {
              const dayOnly = toDateOnly(day);
              const isOutsideRange =
                dayOnly.getTime() < toDateOnly(calendar.start).getTime() ||
                dayOnly.getTime() > toDateOnly(calendar.end).getTime();

              const eventsForDay = calendar.events.filter((event) =>
                isWithinInclusive(dayOnly, toDateOnly(event.start), toDateOnly(event.end))
              );

              const primaryEvent = eventsForDay.find(e => e.type !== "break") || eventsForDay[0];

              let bgClass = "bg-background text-foreground";
              if (isOutsideRange) {
                bgClass = "bg-muted text-muted-foreground";
              } else if (day.getDay() === 0 || day.getDay() === 6) {
                bgClass = "bg-muted text-muted-foreground";
              } else if (primaryEvent) {
                if (primaryEvent.type === "class") {
                  bgClass = "bg-secondary text-secondary-foreground";
                } else if (primaryEvent.type === "holiday") {
                  bgClass = "bg-muted text-muted-foreground";
                } else if (primaryEvent.type === "exam") {
                  bgClass = "bg-destructive text-destructive-foreground";
                } else if (primaryEvent.type === "event") {
                  bgClass = "bg-accent text-accent-foreground";
                } else if (primaryEvent.type === "break") {
                  bgClass = "bg-muted text-muted-foreground";
                }
              }

              return (
                <Popover key={day.toISOString()}>
                  <PopoverTrigger asChild>
                    <div
                      className={`shadow-md rounded-md p-2 min-h-22.5 flex flex-col gap-1 ${bgClass}`}
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="font-semibold">{day.getDate()}</span>
                        {day.getDate() === 1 && (
                          <span className="text-xs opacity-70">
                      {day.toLocaleString("en-US", { month: "short" })}
                    </span>
                        )}
                      </div>
                      {eventsForDay.map((event) => (
                        <div
                          key={event.id}
                          className="text-xs hidden md:block"
                          title={event.description || event.title}
                        >
                          • {event.title}
                        </div>
                      ))}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent>
                    <PopoverHeader>
                      <PopoverTitle>
                        {day.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </PopoverTitle>
                    </PopoverHeader>
                    <PopoverDescription>
                      {eventsForDay.length === 0 ? (
                        <span>No events.</span>
                      ) : (
                        <ul className="list-disc list-inside">
                          {eventsForDay.map((event) => (
                            <li key={event.id} className="mb-1">
                              <span className="font-semibold">{event.title}</span>
                              {event.description && (
                                <span className="text-sm text-muted-foreground">
                                {event.description}
                              </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </PopoverDescription>
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>
          <ScrollBar />
        </ScrollArea>
      </div>
    )
  );
}