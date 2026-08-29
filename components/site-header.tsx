import Link from "next/link";
import { ArrowRightIcon, CampusMark } from "@/components/icons";

export function SiteHeader({ compact = false, compactLabel = "Exit practice" }: { compact?: boolean; compactLabel?: string }) {
  return (
    <header className="border-b border-[#dbe8e4] bg-[rgba(251,253,251,0.92)] backdrop-blur-md">
      <div className="page-shell flex min-h-18 items-center justify-between gap-6 py-3">
        <Link aria-label="Campus Decoder home" className="flex min-h-11 min-w-11 items-center gap-3 rounded-xl text-[#0b2e2a] no-underline" href="/">
          <CampusMark className="h-10 w-10" />
          <span className="font-display hidden text-xl font-bold tracking-[-0.02em] sm:inline">Campus Decoder</span>
        </Link>
        {!compact ? (
          <nav aria-label="Main navigation" className="flex items-center gap-2">
            <a className="hidden min-h-11 items-center rounded-full px-4 text-sm font-bold text-[#45625e] no-underline hover:bg-[#eef7f3] sm:inline-flex" href="#how-it-works">How it works</a>
            <Link className="button-primary !min-h-11 !px-5 text-sm" href="/practice">Start practice <ArrowRightIcon className="h-4 w-4" /></Link>
          </nav>
        ) : (
          <Link className="button-quiet !px-4 text-sm" href="/">{compactLabel}</Link>
        )}
      </div>
    </header>
  );
}
