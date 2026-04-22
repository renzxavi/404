"use client";

// Design replication from index5.html — gesture strip (#gesture-strip)
// Font: Unbounded (Google Fonts) — loaded globally; fallback sans-serif
// Background: white (#ffffff) — matches the white strip in the reference
// Border-bottom: 1.5px solid #e0e0e0 — subtle separator below the strip
// Each column separated by 1.5px solid var(--graphite) ≈ #c8c8c8

import { ArrowLeftCircle, PauseCircle, ArrowRightCircle } from "lucide-react";

const categories = [
  { id: "wont-work", label: "WON'T WORK HERE",    icon: ArrowLeftCircle },
  { id: "need-it",   label: "I NEED THIS HERE",   icon: PauseCircle },
  { id: "missing",   label: "WHY ISN'T THIS HERE?", icon: ArrowRightCircle },
];

export default function CategoryTabs() {
  return (
    // Container: white bg, full width, border-bottom matches design divider
    // Height: ~52px as seen in reference (compact horizontal strip)
    <div
      className="grid grid-cols-3 w-full"
      style={{
        // Color: white background — exact match from reference image
        backgroundColor: "#ffffff",
        // Border: 1.5px solid light gray — bottom separator line
        borderBottom: "1.5px solid #e0e0e0",
        // Height: ~52px — compact gesture strip as in the design
        height: "52px",
      }}
    >
      {categories.map(({ id, label, icon: Icon }, index) => (
        <div
          key={id}
          className="flex flex-row items-center justify-center gap-2 cursor-pointer group"
          style={{
            // Border: 1.5px solid #c8c8c8 — vertical dividers between columns
            // Only middle column has left + right borders (matching HTML: border-left + border-right on gs-need)
            // First and last get only adjacent border via CSS trick — replicated with inline styles
            borderLeft: index > 0 ? "1.5px solid #c8c8c8" : "none",
            // Padding: 0 16px — horizontal breathing room
            padding: "0 16px",
          }}
        >
          {/* Icon: small circle arrow / pause — size 15px, strokeWidth 1.5, color #1a1a1a */}
          {/* Color: #1a1a1a (near-black) replicado del diseño — matches gs-arrow text color */}
          <Icon
            size={15}
            strokeWidth={1.5}
            style={{ color: "#1a1a1a", flexShrink: 0 }}
          />

          {/* Typography: Unbounded font, 9px, weight 700, uppercase, tracking 0.12em */}
          {/* Color: #1a1a1a — near-black text as seen in reference */}
          {/* Text is single line, centered, no wrap */}
          <span
            style={{
              // Font: Unbounded — matches the reference gesture strip labels
              fontFamily: "'Unbounded', sans-serif",
              // Size: 9px — compact micro label
              fontSize: "9px",
              // Weight: 700 — bold as in the design
              fontWeight: 700,
              // Case: uppercase — all caps matching reference
              textTransform: "uppercase",
              // Tracking: 0.12em — tight letter spacing as in design
              letterSpacing: "0.12em",
              // Color: #1a1a1a — near-black
              color: "#1a1a1a",
              // No wrap: single line layout
              whiteSpace: "nowrap",
              // Line height: 1
              lineHeight: 1,
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
