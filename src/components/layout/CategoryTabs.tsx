"use client";

import { ArrowLeftCircle, PauseCircle, ArrowRightCircle } from "lucide-react";

const categories = [
  { id: "wont-work", label: "WON'T WORK HERE",    icon: ArrowLeftCircle },
  { id: "need-it",   label: "I NEED THIS HERE",   icon: PauseCircle },
  { id: "missing",   label: "WHY ISN'T THIS HERE?", icon: ArrowRightCircle },
];

export default function CategoryTabs() {
  return (
    <div
      className="grid grid-cols-3 w-full"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1.5px solid #e0e0e0",
        height: "52px",
      }}
    >
      {categories.map(({ id, label, icon: Icon }, index) => (
        <div
          key={id}
          className="flex flex-row items-center justify-center gap-2 cursor-pointer group"
          style={{
            borderLeft: index > 0 ? "1.5px solid #c8c8c8" : "none",
            padding: "0 16px",
          }}
        >
          <Icon
            size={15}
            strokeWidth={1.5}
            style={{ color: "#1a1a1a", flexShrink: 0 }}
          />
          <span
            style={{
              fontFamily: "'Unbounded', sans-serif",
              fontSize: "9px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "#1a1a1a",
              whiteSpace: "nowrap",
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
