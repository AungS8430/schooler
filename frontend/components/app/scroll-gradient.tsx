"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

type ScrollGradientProps = {
  className?: string;
  scrollClassName?: string;
  children: React.ReactNode;
};

export default function ScrollGradient({
  className,
  scrollClassName,
  children,
}: ScrollGradientProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const fadeSize = 24;
  const maskImage = canScrollLeft || canScrollRight
    ? canScrollLeft && canScrollRight
      ? `linear-gradient(to right, transparent 0px, black ${fadeSize}px, black calc(100% - ${fadeSize}px), transparent 100%)`
      : canScrollLeft
        ? `linear-gradient(to right, transparent 0px, black ${fadeSize}px, black 100%)`
        : `linear-gradient(to right, black 0px, black calc(100% - ${fadeSize}px), transparent 100%)`
    : undefined;

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) {
      return;
    }

    const update = () => {
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      if (maxScrollLeft <= 1) {
        setCanScrollLeft(false);
        setCanScrollRight(false);
      } else {
        setCanScrollLeft(element.scrollLeft > 1);
        setCanScrollRight(element.scrollLeft < maxScrollLeft - 1);
      }
    };

    update();

    const onScroll = () => update();
    element.addEventListener("scroll", onScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(update);
      resizeObserver.observe(element);
    }

    return () => {
      element.removeEventListener("scroll", onScroll);
      resizeObserver?.disconnect();
    };
  }, []);

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className={cn(
          "focus-visible:ring-ring/50 rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
        )}
        style={
          maskImage
            ? ({
                maskImage,
                WebkitMaskImage: maskImage,
              } as React.CSSProperties)
            : undefined
        }
      >
        <div className={scrollClassName}>
          {children}
        </div>
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.ScrollAreaScrollbar
        data-slot="scroll-area-scrollbar"
        data-orientation="horizontal"
        orientation="horizontal"
        className={cn(
          "data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent flex touch-none p-px transition-colors select-none"
        )}
      >
        <ScrollAreaPrimitive.ScrollAreaThumb
          data-slot="scroll-area-thumb"
          className="rounded-full bg-border relative flex-1"
        />
      </ScrollAreaPrimitive.ScrollAreaScrollbar>
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}
