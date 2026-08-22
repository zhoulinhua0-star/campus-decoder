import type { ReactNode, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function IconBase({ children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      {children}
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconBase>;
}

export function ArrowLeftIcon(props: IconProps) {
  return <IconBase {...props}><path d="M19 12H5m6 6-6-6 6-6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></IconBase>;
}

export function CheckIcon(props: IconProps) {
  return <IconBase {...props}><path d="m5 12 4.2 4.2L19 6.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></IconBase>;
}

export function ClockIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" /><path d="M12 7.5V12l3 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></IconBase>;
}

export function MessageIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 6.5A2.5 2.5 0 0 1 7.5 4h9A2.5 2.5 0 0 1 19 6.5v6a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4A2.5 2.5 0 0 1 4 12.5v-6Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" /></IconBase>;
}

export function MicrophoneIcon(props: IconProps) {
  return <IconBase {...props}><rect height="11" rx="4" stroke="currentColor" strokeWidth="1.8" width="7" x="8.5" y="3" /><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3m-3 0h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></IconBase>;
}

export function SparkIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 3c.45 4.6 2.4 6.55 7 7-4.6.45-6.55 2.4-7 7-.45-4.6-2.4-6.55-7-7 4.6-.45 6.55-2.4 7-7Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" /><path d="M19 16c.2 2 1 2.8 3 3-2 .2-2.8 1-3 3-.2-2-1-2.8-3-3 2-.2 2.8-1 3-3Z" fill="currentColor" /></IconBase>;
}

export function CopyIcon(props: IconProps) {
  return <IconBase {...props}><rect height="11" rx="2" stroke="currentColor" strokeWidth="1.6" width="10" x="8" y="7" /><path d="M15 7V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></IconBase>;
}

export function CampusMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 44 44">
      <rect fill="#0B766D" height="44" rx="14" width="44" />
      <path d="M11 20.5 22 13l11 7.5" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
      <path d="M14 21v10m5-10v10m6-10v10m5-10v10M11 32h22" stroke="#fff" strokeLinecap="round" strokeWidth="2" />
      <circle cx="31.5" cy="12.5" fill="#F4B65E" r="3.5" />
    </svg>
  );
}

export function ScenarioIcon({ type, className }: { type: "office" | "email" | "group"; className?: string }) {
  if (type === "email") {
    return <IconBase className={className}><rect height="14" rx="2.5" stroke="currentColor" strokeWidth="1.6" width="18" x="3" y="5" /><path d="m4.5 7 7.5 6 7.5-6" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.6" /></IconBase>;
  }
  if (type === "group") {
    return <IconBase className={className}><circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.6" /><circle cx="17" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.6" /><path d="M3.8 19c.4-3.3 2.1-5 5.2-5 3.2 0 4.9 1.7 5.3 5M14 15c2.9-.7 5.1.5 5.8 3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" /></IconBase>;
  }
  return <IconBase className={className}><path d="m3 10 9-6 9 6M5.5 11.5v7m4-7v7m5-7v7m4-7v7M3.5 20h17" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" /></IconBase>;
}
