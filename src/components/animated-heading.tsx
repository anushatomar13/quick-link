"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "motion";
import { splitText } from "motion-plus";

export function AnimatedHeading() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.fonts.ready.then(() => {
      if (!containerRef.current) return;

      containerRef.current.style.visibility = "visible";
      const { words } = splitText(containerRef.current.querySelector("h1")!);

      animate(
        words,
        { opacity: [0, 1], y: [10, 0] },
        {
          type: "spring",
          duration: 2,
          bounce: 0,
          delay: stagger(0.05),
        }
      );
    });
  }, []);

  return (
    <div ref={containerRef} className="invisible">
      <h1 className="text-3xl md:text-5xl font-bold text-center bg-gradient-to-b from-neutral-100 to-neutral-400 bg-clip-text text-transparent">
        Drop files, set an expiry, and share instantly-no account needed!
      </h1>
    </div>
  );
}
