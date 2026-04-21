"use client";

import { ArrowLeftCircle, PauseCircle, ArrowRightCircle } from "lucide-react";

const categories = [
  { id: "wont-work", label: "Won't work here", icon: ArrowLeftCircle },
  { id: "need-it",   label: "Need it here",    icon: PauseCircle },
  { id: "missing",   label: "Why is it missing", icon: ArrowRightCircle },
];

export default function CategoryTabs() {
  return (
    <div className="grid grid-cols-3 bg-black w-full divide-x divide-zinc-800">
      {categories.map(({ id, label, icon: Icon }) => (
        <div
          key={id}
          className="flex flex-col items-center justify-center gap-2 py-6 px-2 text-white"
        >
          <Icon 
            size={20} 
            strokeWidth={1.5} 
            className="opacity-80" 
          />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-center leading-tight">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}