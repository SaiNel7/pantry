"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#111]">
      <div className="max-w-[390px] mx-auto flex">
      <Link
        href="/"
        className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${
          pathname === "/" ? "text-orange" : "text-[#444]"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        <span className="font-sans text-[10px] font-semibold uppercase tracking-widest">Home</span>
      </Link>
      <Link
        href="/list"
        className={`flex-1 flex flex-col items-center gap-1 py-2 transition-colors ${
          pathname === "/list" ? "text-orange" : "text-[#444]"
        }`}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <span className="font-sans text-[10px] font-semibold uppercase tracking-widest">List</span>
      </Link>
      </div>
    </nav>
  );
}
