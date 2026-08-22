type LogoProps = {
  size?: number;
  animate?: boolean;
  className?: string;
};

export function Logo({ size = 36, animate = false, className }: LogoProps) {
  return (
    <svg
      className={`logo-mark ${animate ? "is-animate" : ""} ${className ?? ""}`}
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <circle className="logo-ring" cx="32" cy="32" r="27" />
      <path className="logo-a" d="M20 47 L32 15 L44 47" />
      <path className="logo-bar" d="M24.5 36.5 H39.5" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "wordmark is-compact" : "wordmark"}>
      <span className="wordmark-name">Aether</span>
      <span className="wordmark-unit">Systems</span>
    </div>
  );
}
