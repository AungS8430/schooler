"use client";

import { useState, useEffect, useRef } from "react";
import Timetable from "@/components/app/timetable";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { toPng } from "html-to-image";

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

export default function SchedulePage() {
  const [classList, setClassList] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [timetableData, setTimetableData] = useState<{ [day: number]: Subject[] } | null>(null);
  const [slots, setSlots] = useState<Slot[] | null>([]);
  const timetableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE}/classes`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.classes && Array.isArray(data.classes)) {
          setClassList(data.classes);
        }
      })
      .catch((error) => {
        console.error("Error fetching class list:", error);
      });
    fetch(`${process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE}/permissions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.permissions.class) {
          setSelectedClass(data.permissions.class);
        }
      })
      .catch((error) => {
        console.error("Error fetching user permissions:", error);
      });
    fetch(`${process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE}/get-slots`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.slots && Array.isArray(data.slots)) {
          setSlots(data.slots);
        }
      })
      .catch((error) => {
        console.error("Error fetching slots:", error);
      })

  }, []);

  useEffect(() => {
    if (!selectedClass) return;
    fetch(`${process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE}/school-timetable?class_=${encodeURIComponent(selectedClass)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.timetable) {
          setTimetableData(data.timetable[0]);
        }
      })
      .catch((error) => {
        console.error("Error fetching schedule:", error);
      });
  }, [selectedClass]);

  useEffect(() => {
    console.log(timetableData);
  }, [timetableData]);

  useEffect(() => {
    if (!selectedClass && classList.length > 0) {
      setSelectedClass(classList[0]);
    }
  }, [selectedClass, classList]);

  const handleValueChange = (value: string | null) => {
    if (value) {
      setSelectedClass(value);
    }
  };

  const handleSaveAsPng = async () => {
    if (!timetableRef.current) return;

    // Store original styles and classes
    const originalClass = timetableRef.current.className;
    const originalStyle = timetableRef.current.style.cssText;

    // Find all elements with overflow and store their styles
    const overflowElements: Array<{ element: HTMLElement; originalOverflow: string; originalMaxWidth: string }> = [];
    const allElements = timetableRef.current.querySelectorAll('*');
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

    // Remove dark class if present and ensure light theme
    timetableRef.current.className = originalClass.replace(/\bdark\b/g, '').trim();

    // Remove overflow from the main container
    timetableRef.current.style.overflow = 'visible';
    timetableRef.current.style.maxWidth = 'none';

    // Apply light theme CSS variables directly
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
      timetableRef.current!.style.setProperty(key, value);
    });

    timetableRef.current.style.colorScheme = 'light';
    timetableRef.current.style.backgroundColor = 'oklch(1 0 0)';
    timetableRef.current.style.color = 'oklch(0.145 0 0)'; // Force dark text color

    try {
      // Wait for styles to apply
      await new Promise(resolve => setTimeout(resolve, 150));

      const dataUrl = await toPng(timetableRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: true,
        filter: (_node) => {
          return true;
        },
      });

      const filename = `schedule-${selectedClass}-${new Date().toISOString().split('T')[0]}.png`;

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
        const dataUrl = await toPng(timetableRef.current, {
          skipFonts: true,
          pixelRatio: 1,
          backgroundColor: '#ffffff',
        });

        const filename = `schedule-${selectedClass}-${new Date().toISOString().split('T')[0]}.png`;
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
      // Restore original class and styles
      timetableRef.current.className = originalClass;
      timetableRef.current.style.cssText = originalStyle;

      // Restore overflow on all elements
      overflowElements.forEach(({ element, originalOverflow, originalMaxWidth }) => {
        element.style.overflow = originalOverflow;
        element.style.maxWidth = originalMaxWidth;
      });
    }
  };

  return (
    <div className="flex flex-col justify-start items-center max-w-5xl w-full h-screen gap-0 mx-auto overflow-hidden">
      <div className="flex flex-col gap-2 sticky top-0 z-10 w-full p-3">
        <h1 className="text-2xl font-semibold">Class Schedule</h1>
        <div className="flex gap-2 items-center w-full max-w-full">
          <Combobox required items={classList} value={selectedClass} onValueChange={handleValueChange} autoHighlight>
            <ComboboxInput placeholder="Select a class..." showClear={false} className="grow" />
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
          <Button onClick={handleSaveAsPng} variant="default">
            Save as PNG
          </Button>
        </div>
      </div>
      {timetableData && slots && (
        <div ref={timetableRef} className="p-4 w-fit overflow-x-auto max-w-full mb-12 md:mb-0">
          <Timetable timetable={timetableData} slots={slots} />
          <div className="w-full text-right pt-2 text-sm">Class schedule for {selectedClass}</div>
        </div>
      )}
    </div>
  );
}