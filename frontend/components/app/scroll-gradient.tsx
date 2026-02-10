"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
    const element = scrollRef.current;
    const container = containerRef.current;
    if (!element || !container) {
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
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        ref={scrollRef}
        className={cn("overflow-x-auto", scrollClassName)}
        style={
          maskImage
            ? ({
                maskImage,
                WebkitMaskImage: maskImage,
              } as React.CSSProperties)
            : undefined
        }
      >
        {children}
      </div>
    </div>
  );
}
