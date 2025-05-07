
"use client"

import { animate, stagger } from "motion"
import { splitText } from "motion-plus"
import { useEffect, useRef } from "react"

export default function SplitText() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        document.fonts.ready.then(() => {
            if (!containerRef.current) return

            containerRef.current.style.visibility = "visible"

            const { words } = splitText(
                containerRef.current.querySelector("h1")!
            )

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
        })
    }, [])

    return (
        <div className="container" ref={containerRef}>
            <h1 className="text-3xl text-center">
                Drop files, set an expiry, and share instantly—no account needed!
            </h1>
            <Stylesheet />
        </div>
    )

}

function Stylesheet() {
    return (
        <style>{`
.container {
display: flex;
justify-content: center;
align-items: center;
flex-direction: column;
width: 100%;
max-width: 420px;
text-align: center;
visibility: hidden;
height: 100vh;
padding-top: 80px;
background: transparent; /* Ensure the background is transparent */
}

.split-word {
will-change: transform, opacity;
}
`}</style>
    )
}