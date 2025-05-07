"use client"

import { animate, stagger } from "motion"
import { splitText } from "motion-plus"

export function animateHeadingText(element: HTMLElement) {
  const { words } = splitText(element)

  animate(
    words,
    { opacity: [0, 1], y: [10, 0] },
    {
      type: "spring",
      duration: 2,
      bounce: 0,
      delay: stagger(0.05),
    }
  )
}
