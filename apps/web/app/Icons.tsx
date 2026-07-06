// Кастомные SVG-иконки. Единый размер (по умолчанию 20), stroke currentColor,
// одинаковая толщина линии — визуально одного веса. Без эмодзи.

type P = { size?: number; className?: string };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

export function SunIcon({ size = 20, className }: P) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function MoonIcon({ size = 20, className }: P) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

// «Как в системе» — круг, наполовину закрашенный
export function AutoIcon({ size = 20, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth={1.8} />
      <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
    </svg>
  );
}

// Настройки — «ползунки» (чище гайки)
export function SlidersIcon({ size = 20, className }: P) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" />
      <circle cx="16" cy="6" r="2" fill="currentColor" stroke="none" />
      <circle cx="8" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="18" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function HeartIcon({ size = 20, filled = false, className }: P & { filled?: boolean }) {
  return (
    <svg {...base(size)} className={className} fill={filled ? "currentColor" : "none"} aria-hidden>
      <path d="M12 20.5l-1.4-1.3C5.4 14.5 2.5 11.9 2.5 8.7 2.5 6.2 4.5 4.2 7 4.2c1.5 0 2.9.7 3.7 1.8l1.3 1.6 1.3-1.6C15.1 4.9 16.5 4.2 18 4.2c2.5 0 4.5 2 4.5 4.5 0 3.2-2.9 5.8-8.1 10.5L12 20.5z" />
    </svg>
  );
}

export function StarIcon({ size = 16, filled = true, className }: P & { filled?: boolean }) {
  return (
    <svg {...base(size)} className={className} fill={filled ? "currentColor" : "none"} aria-hidden>
      <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9L12 3.5z" />
    </svg>
  );
}

export function SearchIcon({ size = 18, className }: P) {
  return (
    <svg {...base(size)} className={className} aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.2-3.2" />
    </svg>
  );
}
