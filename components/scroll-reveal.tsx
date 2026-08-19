"use client";

import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: boolean;
};

type RevealStyle = CSSProperties & {
  "--reveal-delay": string;
};

export function ScrollReveal({ children, className, delay = 0, stagger = false }: ScrollRevealProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    element.dataset.revealReady = "true";

    if (reducedMotion || !("IntersectionObserver" in window)) {
      element.dataset.revealVisible = "true";
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        element.dataset.revealVisible = "true";
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.16 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const style: RevealStyle = { "--reveal-delay": `${delay}ms` };

  return (
    <div
      className={className}
      data-scroll-reveal={stagger ? "stagger" : "single"}
      ref={elementRef}
      style={style}
    >
      {children}
    </div>
  );
}
